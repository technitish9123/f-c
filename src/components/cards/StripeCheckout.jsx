import React, { useEffect, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { createPaymentsIntent } from "../../functions/stripe";
import { createOrder, emptyUserCart } from "../../functions/user";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// Stripe's card field, styled to match the site (fonts are passed to <Elements>).
const CARD_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: {
      color: "#1c1b19",
      fontFamily: "Jost, system-ui, sans-serif",
      fontSize: "16px",
      fontWeight: "300",
      letterSpacing: "0.02em",
      "::placeholder": { color: "#9a958c" },
    },
    invalid: { color: "#a33a2b", iconColor: "#a33a2b" },
  },
};

const Steps = () => (
  <ol className="co__steps" aria-label="Checkout steps">
    <li className="is-done">Bag</li>
    <li className="is-done">Delivery</li>
    <li className="is-current" aria-current="step">Payment</li>
  </ol>
);

const StripeCheckout = () => {
  const { user, coupon, pageState, shippingAdd } = useSelector((s) => s);
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();

  const [intent, setIntent] = useState(null); // { clientSecret, cartTotal, totalAfterDiscount, payable }
  const [cardReady, setCardReady] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    if (!pageState) return;
    createPaymentsIntent(user.token, coupon, shippingAdd)
      .then((res) => setIntent(res.data))
      // e.g. "Only 2 left of Seiichi J-1158." when stock ran out
      .catch((err) => setError(err.response?.data?.err || "Could not start the payment. Please try again."));
  }, []);

  const clearBag = () => {
    localStorage.removeItem("cart");
    localStorage.removeItem("shippingAddress");
    dispatch({ type: "ADD_TO_CART", payload: [] });
    dispatch({ type: "COUPON_APPLIED", payload: false });
    dispatch({ type: "SESSION", payload: false });
    emptyUserCart(user.token).catch(() => {});
  };

  const pay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !intent || processing) return;
    setProcessing(true);
    setError("");

    const { error: payError, paymentIntent } = await stripe.confirmCardPayment(intent.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name: shippingAdd?.name || user.name, email: shippingAdd?.email || user.email },
      },
    });

    if (payError) {
      setError(payError.message);
      setProcessing(false);
      return;
    }
    if (paymentIntent.status === "succeeded") {
      // The order is also recorded by Stripe's webhook if this request never arrives.
      await createOrder(
        { shippingAdd, paymentInfo: { id: paymentIntent.id, status: paymentIntent.status } },
        user.token
      ).catch(() => {});
      clearBag();
      setSucceeded(true);
    }
    setProcessing(false);
  };

  if (succeeded) {
    return (
      <div className="bag bag--empty pay-done">
        <div className="eyebrow">Payment received</div>
        <h1>Thank you{shippingAdd?.name ? `, ${shippingAdd.name.split(" ")[0]}` : ""}</h1>
        <p>
          Your order is confirmed. A receipt is on its way to {shippingAdd?.email || user.email}, and our team will
          call you to arrange delivery.
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

  const discounted = coupon && intent && intent.totalAfterDiscount && intent.totalAfterDiscount < intent.cartTotal;

  return (
    <div className="bag co pay">
      <header className="bag__head">
        <Link to="/checkout" className="text-link">← Back to delivery</Link>
        <h1>Payment</h1>
        <Steps />
      </header>

      <div className="bag__body">
        <form className="co__form" onSubmit={pay}>
          <div className="co__section">
            <span className="co__num">02</span>
            <div>
              <h2 className="co__title">Card details</h2>
              <p className="co__hint">Visa, Mastercard, RuPay and American Express, processed securely by Stripe.</p>
            </div>
          </div>

          <div className="pay__card">
            <span className="pay__label">Card number · Expiry · CVC</span>
            <div className={`pay__field${error ? " is-invalid" : ""}`}>
              <CardElement
                options={CARD_OPTIONS}
                onReady={() => setCardReady(true)}
                onChange={(e) => setError(e.error ? e.error.message : "")}
              />
            </div>
            {error && <p className="co-field__err" role="alert">{error}</p>}

            <button type="submit" className="ink-btn pay__btn" disabled={!intent || !cardReady || processing}>
              {processing ? <span className="pay__spinner" aria-label="Processing" /> : intent ? `Pay ${inr(intent.payable / 100)}` : "Preparing payment…"}
            </button>
            <p className="pay__secure">
              <svg width="11" height="13" viewBox="0 0 12 14" aria-hidden="true">
                <path d="M2 6V4a4 4 0 0 1 8 0v2h1v8H1V6h1Zm1.5 0h5V4a2.5 2.5 0 0 0-5 0v2Z" fill="currentColor" />
              </svg>
              Encrypted by Stripe. Please keep this page open until the payment completes.
            </p>
          </div>
        </form>

        <aside className="bag__summary co__summary" aria-label="Order summary">
          <div className="eyebrow">Order summary</div>
          <dl>
            <div><dt>Subtotal</dt><dd>{intent ? inr(intent.cartTotal) : "—"}</dd></div>
            {discounted && <div className="co__discount"><dt>Coupon</dt><dd>−{inr(intent.cartTotal - intent.totalAfterDiscount)}</dd></div>}
            {intent?.cartTotal >= 20000 && <div><dt>Delivery</dt><dd className="co__free">Free</dd></div>}
            <div className="bag__total"><dt>To pay</dt><dd>{intent ? inr(intent.payable / 100) : "—"}</dd></div>
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
              </p>
              {shippingAdd.specialMessage && <p className="pay__note">“{shippingAdd.specialMessage}”</p>}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default StripeCheckout;
