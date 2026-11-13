import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserOrders } from "../../functions/user";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Invoice from "../../components/order/Invoice";
import AccountLayout from "../../components/nav/AccountLayout";
import laptop from "../../images/laptop.png";

const STEPS = ["Not Processed", "Processing", "Dispatched", "Delivered"];
const STEP_LABEL = {
  "Not Processed": "Order placed",
  Processing: "Processing",
  Dispatched: "Dispatched",
  Delivered: "Delivered",
};

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";

// Prefer the amount actually charged (includes coupons); fall back to item prices.
const orderTotal = (order) => {
  const charged =
    order.paymentIntent &&
    order.paymentIntent.paymentInfo &&
    order.paymentIntent.paymentInfo.stripeResponse &&
    order.paymentIntent.paymentInfo.stripeResponse.amount;
  if (charged) return charged / 100;
  return order.products.reduce((sum, p) => sum + (p.product ? p.product.price * p.count : 0), 0);
};

const shortDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const StatusTimeline = ({ order }) => {
  const status = order.orderStatus;
  if (status === "Cancelled") {
    const r = order.refund;
    return (
      <div className="order__cancelled">
        This order was cancelled
        {r?.amount ? ` · ${inr(r.amount)} refunded to your original payment method on ${formatDate(r.at)} (allow 5–7 working days)` : ""}
      </div>
    );
  }
  const current = Math.max(0, STEPS.indexOf(status));
  // When each step happened (orders from before history was kept show none).
  const when = Object.fromEntries((order.statusHistory || []).map((h) => [h.status, h.at]));
  if (!when["Not Processed"] && order.createdAt) when["Not Processed"] = order.createdAt;
  return (
    <ol className="order__steps" aria-label={`Status: ${STEP_LABEL[status] || status}`}>
      {STEPS.map((s, i) => (
        <li
          key={s}
          className={i < current ? "is-done" : i === current ? "is-current" : ""}
          aria-current={i === current ? "step" : undefined}
        >
          <span>{STEP_LABEL[s]}</span>
          {when[s] && i <= current && <small>{shortDate(when[s])}</small>}
        </li>
      ))}
    </ol>
  );
};

const OrderCard = ({ order }) => (
  <article className="order">
    <header className="order__head">
      <div>
        <div className="eyebrow">Order</div>
        <div className="order__id">№ {String(order._id).slice(-8).toUpperCase()}</div>
        {order.invoiceNo && <div className="order__inv">{order.invoiceNo}</div>}
      </div>
      <div>
        <div className="eyebrow">Placed on</div>
        <div>{formatDate(order.createdAt)}</div>
      </div>
      <div>
        <div className="eyebrow">Total</div>
        <div className="order__total">{orderTotal(order) ? inr(orderTotal(order)) : "—"}</div>
      </div>
    </header>

    <StatusTimeline order={order} />
    {order.tracking && (order.tracking.number || order.tracking.courier) && order.orderStatus !== "Cancelled" && (
      <div className="order__tracking">
        <span className="eyebrow">Shipment</span>
        <span>{[order.tracking.courier, order.tracking.number].filter(Boolean).join(" · ")}</span>
        {order.tracking.url && (
          <a href={order.tracking.url} target="_blank" rel="noopener noreferrer" className="link-line">Track parcel</a>
        )}
      </div>
    )}

    <ul className="order__items">
      {order.products.map((p, i) => {
        const prod = p.product;
        if (!prod) {
          return (
            <li key={i} className="order__item order__item--missing">
              This item is no longer available.
            </li>
          );
        }
        const img = prod.images && prod.images.length ? prod.images[0].url : laptop;
        return (
          <li key={i} className="order__item">
            <Link to={`/product/${prod.slug}`} className="order__thumb">
              <img src={img} alt={prod.title} loading="lazy" />
            </Link>
            <div className="order__info">
              <Link to={`/product/${prod.slug}`} className="order__title">
                {prod.title}
              </Link>
              <div className="order__meta">
                {[prod.brand, p.color || prod.color].filter(Boolean).join(" · ")}
              </div>
              <div className="order__meta">Qty {p.count}</div>
            </div>
            <div className="order__price">{inr(prod.price * p.count)}</div>
          </li>
        );
      })}
    </ul>

    <footer className="order__foot">
      <PDFDownloadLink
        document={<Invoice order={order} />}
        fileName={`first-impression-invoice-${String(order._id).slice(-8)}.pdf`}
        className="link-line"
      >
        {({ loading }) => (loading ? "Preparing invoice…" : "Download invoice")}
      </PDFDownloadLink>
    </footer>
  </article>
);

const History = () => {
  const user = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user || !user.token) return;
    setLoading(true);
    getUserOrders(user.token)
      .then((res) => setOrders(res.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <AccountLayout
      title="Your orders"
      intro={
        !loading && orders.length
          ? `${orders.length} ${orders.length === 1 ? "order" : "orders"}, most recent first.`
          : null
      }
    >
      {loading ? (
        <div className="account__loading">Loading your orders…</div>
      ) : error ? (
        <div className="empty-state">
          <p>We couldn't load your orders.</p>
          <button className="buybox__cta" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>You haven't placed an order yet.</p>
          <Link to="/shop" className="buybox__cta">
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="order-list">
          {[...orders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
        </div>
      )}
    </AccountLayout>
  );
};

export default History;
