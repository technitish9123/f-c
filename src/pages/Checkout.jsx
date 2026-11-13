import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getUserCart, emptyUserCart, applyDiscount, getProfile, saveProfile } from "../functions/user";
import { getCatalogue } from "../functions/catalogue";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const savedAddress = () => {
  try {
    return JSON.parse(localStorage.getItem("shippingAddress")) || {};
  } catch {
    return {};
  }
};

// Each field: [key, label, input props, check -> error message or ""]
const FIELDS = [
  ["name", "Full name", { autoComplete: "name", maxLength: 60 }, (v) => (v.trim().length < 2 ? "Please enter your name." : "")],
  ["mobileNum", "Mobile number", { type: "tel", inputMode: "numeric", autoComplete: "tel", maxLength: 13 },
    (v) => (/^(\+?91)?[6-9]\d{9}$/.test(v.replace(/\s/g, "")) ? "" : "Enter a 10-digit mobile number.")],
  ["email", "Email", { type: "email", autoComplete: "email", maxLength: 100 },
    (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email address.")],
  ["add", "Delivery address", { as: "textarea", rows: 3, autoComplete: "street-address", maxLength: 400 },
    (v) => (v.trim().length < 10 ? "Please enter your full address with PIN code." : "")],
  ["specialMessage", "Delivery note (optional)", { maxLength: 120, placeholder: "Floor, landmark, preferred time…" }, () => ""],
  ["gstin", "GSTIN for a business invoice (optional)", { maxLength: 15, style: { textTransform: "uppercase" } },
    (v) => (!v || /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/.test(v.toUpperCase()) ? "" : "A GSTIN has 15 characters, e.g. 27AAAAA0000A1Z5.")],
];

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user);

  const [lines, setLines] = useState(null); // null while loading
  const [total, setTotal] = useState(0);
  const [images, setImages] = useState({});
  const [form, setForm] = useState(() => ({
    name: user?.name || "", mobileNum: "", email: user?.email || "", add: "", specialMessage: "", gstin: "", ...savedAddress(),
  }));
  const [profile, setProfile] = useState(null);
  const [saveAddr, setSaveAddr] = useState(true);
  const [params] = useSearchParams();
  const [touched, setTouched] = useState({});
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [discounted, setDiscounted] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getUserCart(user.token)
      .then((res) => {
        setLines(res.data.products || []);
        setTotal(res.data.cartTotal || 0);
      })
      .catch(() => setLines([]));
    // Thumbnails come from the (cached) catalogue; the cart only stores ids.
    getCatalogue().then((all) => setImages(Object.fromEntries(all.map((p) => [p._id, p.images?.[0]?.url]))));
    // A coupon applied earlier no longer counts once the page reloads.
    dispatch({ type: "COUPON_APPLIED", payload: false });
    // Saved details from the profile fill whatever is still empty.
    getProfile(user.token)
      .then(({ data }) => {
        setProfile(data);
        const first = data.addresses?.[0];
        setForm((f) => ({
          ...f,
          name: f.name || data.name || "",
          mobileNum: f.mobileNum || first?.mobileNum || data.phone || "",
          add: f.add || first?.add || "",
          gstin: f.gstin || data.gstin || "",
        }));
      })
      .catch(() => {});
  }, []);

  const pickAddress = (a) => setForm((f) => ({ ...f, name: a.name, mobileNum: a.mobileNum, add: a.add }));
  const isSaved = (profile?.addresses || []).some((a) => a.add.trim() === form.add.trim());

  const errors = useMemo(() => Object.fromEntries(FIELDS.map(([k, , , check]) => [k, check(form[k] || "")])), [form]);
  const valid = Object.values(errors).every((e) => !e);
  const gst = (lines || []).reduce((sum, { product: p, count }) => sum + (p ? ((p.price * (Number(p.gst) || 0)) / 100) * count : 0), 0);
  const payable = discounted ?? total;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const applyCoupon = async (e) => {
    e.preventDefault();
    if (!coupon.trim()) return;
    setCouponMsg("");
    try {
      const { data } = await applyDiscount({ coupon: coupon.trim() }, user.token);
      if (data.error) {
        setDiscounted(null);
        setCouponMsg(data.error === "Invalid Coupon" ? "This code isn't valid or has expired." : data.error);
        dispatch({ type: "COUPON_APPLIED", payload: false });
        return;
      }
      setDiscounted(data.discount);
      dispatch({ type: "COUPON_APPLIED", payload: true });
      toast.success(`Coupon ${coupon.trim().toUpperCase()} applied.`);
    } catch {
      setCouponMsg("Couldn't check the code. Please try again.");
    }
  };

  const removeCoupon = () => {
    setDiscounted(null);
    setCoupon("");
    dispatch({ type: "COUPON_APPLIED", payload: false });
  };

  const proceed = (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(FIELDS.map(([k]) => [k, true])));
    if (!valid) {
      document.querySelector(".co-field.is-invalid input, .co-field.is-invalid textarea")?.focus();
      return;
    }
    const address = { ...form, mobileNum: form.mobileNum.replace(/\s/g, ""), gstin: (form.gstin || "").trim().toUpperCase() };
    if (!address.gstin) delete address.gstin;
    localStorage.setItem("shippingAddress", JSON.stringify(address));
    dispatch({ type: "SHIPPING_ADDRESS", payload: address });
    // Remember a new address (and GSTIN) on the account; checkout doesn't wait for it.
    if (profile && ((saveAddr && !isSaved && profile.addresses.length < 5) || (address.gstin && !profile.gstin))) {
      saveProfile(user.token, {
        ...(saveAddr && !isSaved && profile.addresses.length < 5 && {
          addresses: [...profile.addresses.map(({ label, name, mobileNum, add }) => ({ label: label || "", name, mobileNum, add })),
            { label: "", name: address.name, mobileNum: address.mobileNum, add: address.add }],
        }),
        ...(address.gstin && !profile.gstin && { gstin: address.gstin }),
      }).catch(() => {});
    }
    dispatch({ type: "SESSION", payload: true });
    navigate("/payment");
  };

  const emptyBag = async () => {
    if (!window.confirm("Remove everything from your bag?")) return;
    setBusy(true);
    localStorage.removeItem("cart");
    dispatch({ type: "ADD_TO_CART", payload: [] });
    await emptyUserCart(user.token).catch(() => {});
    navigate("/shop");
  };

  if (lines && !lines.length) {
    return (
      <div className="bag bag--empty">
        <div className="eyebrow">Checkout</div>
        <h1>Your bag is empty</h1>
        <p>Add a fabric or wallcovering to continue.</p>
        <div className="bag__empty-links">
          <Link to="/category/fabrics" className="ink-btn">Fabrics</Link>
          <Link to="/category/wallpaper" className="ink-btn ink-btn--ghost">Wallpaper</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bag co">
      <header className="bag__head">
        <Link to="/cart" className="text-link">← Back to bag</Link>
        <h1>Checkout</h1>
        <ol className="co__steps" aria-label="Checkout steps">
          <li className="is-done">Bag</li>
          <li className="is-current" aria-current="step">Delivery</li>
          <li>Payment</li>
        </ol>
        {params.get("cancelled") && (
          <p className="co__notice" role="status">Payment cancelled. No money was taken; your bag is saved.</p>
        )}
      </header>

      <div className="bag__body">
        <form className="co__form" onSubmit={proceed} noValidate>
          <div className="co__section">
            <span className="co__num">01</span>
            <div>
              <h2 className="co__title">Delivery details</h2>
              <p className="co__hint">We'll call this number to arrange delivery and send your receipt to this email.</p>
            </div>
          </div>

          {profile?.addresses?.length > 0 && (
            <div className="co__saved" role="group" aria-label="Saved addresses">
              {profile.addresses.map((a, i) => (
                <button
                  key={i}
                  type="button"
                  className={`co__chip${a.add.trim() === form.add.trim() ? " is-on" : ""}`}
                  onClick={() => pickAddress(a)}
                >
                  <strong>{a.label || a.name}</strong>
                  <span>{a.add}</span>
                </button>
              ))}
            </div>
          )}

          <div className="co__grid">
            {FIELDS.map(([k, label, { as, ...props }]) => {
              const err = touched[k] && errors[k];
              const Tag = as || "input";
              return (
                <div key={k} className={`co-field co-field--${k}${err ? " is-invalid" : ""}`}>
                  <label htmlFor={`co-${k}`}>{label}</label>
                  <Tag
                    id={`co-${k}`}
                    value={form[k] || ""}
                    onChange={set(k)}
                    onBlur={() => setTouched((t) => ({ ...t, [k]: true }))}
                    aria-invalid={!!err}
                    aria-describedby={err ? `co-${k}-err` : undefined}
                    {...(Tag === "input" && { type: "text" })}
                    {...props}
                  />
                  {err && <span className="co-field__err" id={`co-${k}-err`}>{err}</span>}
                </div>
              );
            })}
          </div>

          {profile && !isSaved && form.add.trim().length >= 10 && (profile.addresses?.length || 0) < 5 && (
            <label className="co__check">
              <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} />
              Save this address to my profile
            </label>
          )}

          <div className="co__section co__section--next">
            <span className="co__num">02</span>
            <div>
              <h2 className="co__title">Payment</h2>
              <p className="co__hint">Next, pay securely with UPI, card, net banking or wallet through Razorpay.</p>
            </div>
          </div>
        </form>

        <aside className="bag__summary co__summary" aria-label="Order summary">
          <div className="eyebrow">Order summary</div>

          <ul className="co__lines">
            {(lines || [null, null]).map((l, i) =>
              l ? (
                <li key={i} className="co-line">
                  <span className="co-line__media">
                    {images[l.product?._id] && <img src={images[l.product._id]} alt="" loading="lazy" />}
                    <span className="co-line__qty" aria-label={`Quantity ${l.count}`}>{l.count}</span>
                  </span>
                  <span className="co-line__title">{l.product?.title || "Unavailable item"}</span>
                  <span className="co-line__price">{inr((l.product?.price || 0) * l.count)}</span>
                </li>
              ) : (
                <li key={i} className="co-line co-line--skeleton" aria-hidden="true"><span className="co-line__media" /><span /><span /></li>
              )
            )}
          </ul>

          {discounted === null ? (
            <form className="co__coupon" onSubmit={applyCoupon}>
              <label htmlFor="co-coupon" className="co-sr">Coupon code</label>
              <input id="co-coupon" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" autoComplete="off" />
              <button type="submit" className="text-link" disabled={!coupon.trim()}>Apply</button>
              {couponMsg && <span className="co-field__err">{couponMsg}</span>}
            </form>
          ) : (
            <div className="co__coupon co__coupon--on">
              <span>Coupon <strong>{coupon.trim().toUpperCase()}</strong> applied</span>
              <button type="button" className="text-link" onClick={removeCoupon}>Remove</button>
            </div>
          )}

          <dl>
            <div><dt>Subtotal</dt><dd>{inr(total)}</dd></div>
            {discounted !== null && <div className="co__discount"><dt>Discount</dt><dd>−{inr(total - discounted)}</dd></div>}
            {total >= 20000 && <div><dt>Delivery</dt><dd className="co__free">Free</dd></div>}
            <div className="bag__total"><dt>Total</dt><dd>{inr(payable)}</dd></div>
          </dl>
          <p className="bag__note">Prices include GST{gst ? ` (${inr(gst)})` : ""}.</p>

          <button type="button" className="ink-btn bag__cta" onClick={proceed} disabled={!lines || busy}>
            Continue to payment
          </button>
          <button type="button" className="text-link co__empty" onClick={emptyBag} disabled={busy}>Empty bag</button>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
