import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { userCart } from "../functions/user";
import laptop from "../images/laptop.png";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const MAX_QTY = 999;

// The bag lives in localStorage + redux; keep both in step.
const writeCart = (dispatch, cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
  dispatch({ type: "ADD_TO_CART", payload: cart });
};
const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch (e) {
    return [];
  }
};

const BagLine = ({ item, onQty, onRemove }) => {
  const img = item.images && item.images.length ? item.images[0].url : laptop;
  const qty = Number(item.count) || 1;
  const meta = [item.category && item.category.name, item.color].filter(Boolean).join(" · ");

  return (
    <li className="bag-line">
      <Link to={`/product/${item.slug}`} className="bag-line__media">
        <img src={img} alt={item.title} loading="lazy" />
      </Link>
      <div className="bag-line__info">
        <Link to={`/product/${item.slug}`} className="bag-line__title">
          {item.title}
        </Link>
        {meta && <div className="bag-line__meta">{meta}</div>}
        <div className="bag-line__meta">{inr(item.price)} each</div>
        <div className="bag-line__controls">
          <div className="qty" role="group" aria-label={`Quantity for ${item.title}`}>
            <button type="button" onClick={() => onQty(qty - 1)} disabled={qty <= 1} aria-label="Decrease quantity">
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_QTY}
              value={qty}
              onChange={(e) => onQty(e.target.value)}
              aria-label="Quantity"
            />
            <button type="button" onClick={() => onQty(qty + 1)} disabled={qty >= MAX_QTY} aria-label="Increase quantity">
              +
            </button>
          </div>
          <button type="button" className="text-link" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
      <div className="bag-line__total">{inr(item.price * qty)}</div>
    </li>
  );
};

const Cart = ({ history }) => {
  const user = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);

  const setQty = (id, value) => {
    const n = Math.min(MAX_QTY, Math.max(1, Math.floor(Number(value) || 1)));
    writeCart(dispatch, readCart().map((p) => (p._id === id ? { ...p, count: n } : p)));
  };

  const remove = (id, title) => {
    writeCart(dispatch, readCart().filter((p) => p._id !== id));
    toast(`${title} removed from your bag`);
  };

  const pieces = cart.reduce((n, p) => n + (Number(p.count) || 1), 0);
  const subtotal = cart.reduce((sum, p) => sum + (Number(p.count) || 1) * p.price, 0);

  const proceed = () => {
    setSaving(true);
    userCart(cart, user.token)
      .then((res) => {
        if (res.data.ok) history.push("/checkout");
      })
      .catch(() => toast.error("We couldn't save your bag. Please try again."))
      .finally(() => setSaving(false));
  };

  if (!cart.length) {
    return (
      <div className="bag bag--empty">
        <div className="eyebrow">Your bag</div>
        <h1>Your bag is empty</h1>
        <p>Begin with our fabrics or wallcoverings, or visit the showroom at Kemps Corner.</p>
        <div className="bag__empty-links">
          <Link to="/category/fabrics" className="ink-btn">Fabrics</Link>
          <Link to="/category/wallpaper" className="ink-btn ink-btn--ghost">Wallpaper</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bag">
      <header className="bag__head">
        <div className="eyebrow">Your bag</div>
        <h1>
          {pieces} {pieces === 1 ? "piece" : "pieces"}
        </h1>
      </header>

      <div className="bag__body">
        <ul className="bag__lines">
          {cart.map((item) => (
            <BagLine
              key={item._id}
              item={item}
              onQty={(v) => setQty(item._id, v)}
              onRemove={() => remove(item._id, item.title)}
            />
          ))}
        </ul>

        <aside className="bag__summary" aria-label="Order summary">
          <div className="eyebrow">Summary</div>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{inr(subtotal)}</dd>
            </div>
            <div className="bag__total">
              <dt>Total</dt>
              <dd>{inr(subtotal)}</dd>
            </div>
          </dl>
          <p className="bag__note">Have a coupon? You can apply it at checkout.</p>

          {user && user.token ? (
            <button type="button" className="ink-btn bag__cta" onClick={proceed} disabled={saving}>
              {saving ? "Saving…" : "Proceed to checkout"}
            </button>
          ) : (
            <Link to="/login" state={{ from: "/cart" }} className="ink-btn bag__cta">
              Sign in to checkout
            </Link>
          )}
          <Link to="/shop" className="link-line bag__continue">
            Continue shopping
          </Link>

          <div className="bag__help">
            <div className="eyebrow">Need help?</div>
            <p>
              Call <a href="tel:7777045811">7777045811</a> or visit our showroom at Kemps Corner, Mumbai, to see
              fabrics in person.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
