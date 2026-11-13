import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getUserCart, emptyUserCart } from "../functions/user";
import { createRazorpayOrder, verifyRazorpayPayment, loadRazorpay } from "../functions/razorpay";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const Steps = () => (
  <ol className="co__steps" aria-label="Checkout steps">
    <li className="is-done">Bag</li>
    <li className="is-done">Delivery</li>
    <li className="is-current" aria-current="step">Payment</li>
  </ol>
);

/*
 * Review and pay with Razorpay Checkout (UPI, cards, net banking, wallets).
 * The server creates the Razorpay order and verifies the payment's signature
 * before the order is recorded.
 */
const Payment = () => {
  const { user, coupon, pageState, shippingAdd } = useSelector((s) => s);
  const dispatch = useDispatch();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (pageState) getUserCart(user.token).then((res) => setCart(res.data)).catch(() => setCart({ products: [] }));
    loadRazorpay().catch(() => {}); // warm up so the window opens instantly
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = (data) => {
    localStorage.removeItem("cart");
    localStorage.removeItem("shippingAddress");
    dispatch({ type: "ADD_TO_CART", payload: [] });
    dispatch({ type: "COUPON_APPLIED", payload: false });
    dispatch({ type: "SESSION", payload: false });
    emptyUserCart(user.token).catch(() => {});
    setDone(data);
  };

  const pay = async () => {
    setError("");
    setBusy(true);
    try {
      const [{ data: o }, Razorpay] = await Promise.all([createRazorpayOrder(user.token, coupon, shippingAdd), loadRazorpay()]);
      const rzp = new Razorpay({
        key: o.key,
        order_id: o.orderId,
        amount: o.amount,
        currency: o.currency,
        name: "First Impression",
        description: "Furnishing · Kemps Corner, Mumbai",
        prefill: { name: shippingAdd?.name || o.name, email: o.email, contact: shippingAdd?.mobileNum || "" },
        theme: { color: "#1c1b19" },
        modal: { ondismiss: () => setBusy(false), confirm_close: true },
        handler: async (response) => {
          try {
            const { data } = await verifyRazorpayPayment(user.token, response);
            finish(data);
          } catch (err) {
            setError(err.response?.data?.err || "We couldn't confirm the payment yet. If money was taken, your order will be recorded automatically; check My account › Orders.");
            setBusy(false);
          }
        },
      });
      rzp.on("payment.failed", (r) => setError(`Payment failed: ${r.error?.description || "please try another method"}. No money was taken.`));
      rzp.open();
    } catch (err) {
      const body = err.response?.data || {};
      if (body.couponRemoved) {
        dispatch({ type: "COUPON_APPLIED", payload: false });
        getUserCart(user.token).then((res) => setCart(res.data));
      }
      setError(body.err || (err.message === "Razorpay could not load"
        ? "The payment window couldn't load. Please check your connection and try again."
        : "Could not start the payment. Please try again."));
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="bag bag--empty pay-done">
        <div className="eyebrow">Payment received</div>
        <h1>Thank you{shippingAdd?.name ? `, ${shippingAdd.name.split(" ")[0]}` : ""}</h1>
        <p>
          {done.pending
            ? "Your payment went through. We're finishing your order and will email you shortly."
            : `Your order is confirmed${done.invoiceNo ? ` (invoice ${done.invoiceNo})` : ""}. A receipt is on its way to ${done.email || user.email}, and our team will call you to arrange delivery.`}
        </p>
        <div className="bag__empty-links">
          <Link to="/user/history" className="ink-btn">View your order</Link>
          <Link to="/shop" className="ink-btn ink-btn--ghost">Continue shopping</Link>
        </div>
      </div>
    );
  }

  if (!pageState) {
    return (
      <div className="bag bag--empty">
        <div className="eyebrow">Payment</div>
        <h1>This session has ended</h1>
        <p>For your security, the payment page can't be reopened. Your bag is still saved.</p>
        <div className="bag__empty-links">
          <Link to="/checkout" className="ink-btn">Return to checkout</Link>
        </div>
      </div>
    );
  }

  const total = cart?.cartTotal || 0;
  const discounted = coupon && cart?.totalAfterDiscount && cart.totalAfterDiscount < total;
  const payable = discounted ? cart.totalAfterDiscount : total;

  return (
    <div className="bag co pay">
      <header className="bag__head">
        <Link to="/checkout" className="text-link">← Back to delivery</Link>
        <h1>Payment</h1>
        <Steps />
      </header>

      <div className="bag__body">
        <div className="co__form">
          <div className="co__section">
            <span className="co__num">02</span>
            <div>
              <h2 className="co__title">Pay securely</h2>
              <p className="co__hint">UPI, cards, net banking or wallets, through Razorpay's secure window. Your payment details never reach our servers.</p>
            </div>
          </div>

          <div className="pay__card">
            <ul className="pay__lines">
              {(cart?.products || []).map((l, i) => (
                <li key={i}>
                  <span>{l.product?.title || "Item"}{l.variant && l.color ? ` (${l.color})` : ""} <em>× {l.count}</em></span>
                  <span>{inr((l.product?.price || 0) * l.count)}</span>
                </li>
              ))}
            </ul>
            {error && <p className="co-field__err" role="alert">{error}</p>}
            <button type="button" className="ink-btn pay__btn" onClick={pay} disabled={!cart || !cart.products?.length || busy}>
              {busy ? <span className="pay__spinner" aria-label="Processing" /> : cart ? `Pay ${inr(payable)}` : "Loading…"}
            </button>
            <p className="pay__secure">
              <svg width="11" height="13" viewBox="0 0 12 14" aria-hidden="true">
                <path d="M2 6V4a4 4 0 0 1 8 0v2h1v8H1V6h1Zm1.5 0h5V4a2.5 2.5 0 0 0-5 0v2Z" fill="currentColor" />
              </svg>
              Secured by Razorpay. Please keep this page open until the payment completes.
            </p>
          </div>
        </div>

        <aside className="bag__summary co__summary" aria-label="Order summary">
          <div className="eyebrow">Order summary</div>
          <dl>
            <div><dt>Subtotal</dt><dd>{cart ? inr(total) : "—"}</dd></div>
            {discounted && <div className="co__discount"><dt>Coupon</dt><dd>−{inr(total - cart.totalAfterDiscount)}</dd></div>}
            {total >= 20000 && <div><dt>Delivery</dt><dd className="co__free">Free</dd></div>}
            <div className="bag__total"><dt>To pay</dt><dd>{cart ? inr(payable) : "—"}</dd></div>
          </dl>
          <p className="bag__note">Prices include GST.</p>

          {shippingAdd && (
            <div className="pay__ship">
              <div className="pay__ship-head">
                <span className="eyebrow">Delivering to</span>
                <Link to="/checkout" className="text-link">Edit</Link>
              </div>
              <p>
                <strong>{shippingAdd.name}</strong><br />
                {shippingAdd.add}<br />
                {shippingAdd.mobileNum}{shippingAdd.email ? ` · ${shippingAdd.email}` : ""}
                {shippingAdd.gstin ? <><br />GSTIN {shippingAdd.gstin}</> : null}
              </p>
              {shippingAdd.specialMessage && <p className="pay__note">“{shippingAdd.specialMessage}”</p>}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Payment;
