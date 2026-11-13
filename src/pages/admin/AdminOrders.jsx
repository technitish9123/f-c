import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { PDFDownloadLink } from "@react-pdf/renderer";
import AdminPage, { inr, shortDate, downloadCsv } from "../../components/admin/AdminPage";
import Invoice from "../../components/order/Invoice";
import { getOrders, setOrderStatus, refundOrder } from "../../functions/admin";
import { computeInvoice } from "../../functions/gst";

const STATUSES = ["Not Processed", "Processing", "Dispatched", "Delivered", "Cancelled"];
const COURIERS = ["Blue Dart", "Delhivery", "DTDC", "India Post", "Professional Couriers", "Own delivery"];
const paid = (o) => (o.paymentIntent?.paymentInfo?.stripeResponse?.amount || 0) / 100;
const orderNo = (o) => String(o._id).slice(-8).toUpperCase();
const ship = (o) => o.paymentIntent?.shippingAdd || {};

// GST register for the accountant: one row per invoice.
const exportGst = (orders, from, to) => {
  const rows = [["Invoice No", "Invoice Date", "Order", "Customer", "Email", "GSTIN", "Place of Supply", "Taxable Value",
    "CGST", "SGST", "IGST", "Invoice Total", "Status", "Payment ID"]];
  for (const o of orders) {
    const inv = computeInvoice(o);
    const half = Math.round((inv.taxTotal / 2) * 100) / 100;
    rows.push([
      inv.invoiceNo, shortDate(o.createdAt), orderNo(o), ship(o).name || "", o.userEmail || "", ship(o).gstin || "", inv.state,
      inv.taxableTotal.toFixed(2),
      inv.interState ? "0.00" : half.toFixed(2),
      inv.interState ? "0.00" : (inv.taxTotal - half).toFixed(2),
      inv.interState ? inv.taxTotal.toFixed(2) : "0.00",
      (inv.charged ?? inv.taxableTotal + inv.taxTotal).toFixed(2),
      o.orderStatus + (o.refund?.amount ? ` (refunded ${o.refund.amount})` : ""),
      o.paymentIntent?.paymentInfo?.id || "",
    ]);
  }
  downloadCsv(`gst-register_${from || "start"}_to_${to || "today"}.csv`, rows);
};

const OrderDetail = ({ order, token, onSaved, onClose }) => {
  const [status, setStatus] = useState(order.orderStatus);
  const [tracking, setTracking] = useState({ courier: "", number: "", url: "", ...(order.tracking || {}) });
  const [busy, setBusy] = useState(false);
  const s = ship(order);
  const amount = paid(order);

  const save = async () => {
    if (status === "Cancelled" && amount && !order.refund?.id) {
      return toast.info("To cancel a paid order, use “Refund & cancel” so the customer gets their money back.");
    }
    if (tracking.url && !/^https?:\/\//.test(tracking.url)) return toast.error("The tracking link must start with http:// or https://");
    setBusy(true);
    try {
      const t = Object.fromEntries(Object.entries(tracking).filter(([k, v]) => ["courier", "number", "url"].includes(k) && v));
      const { data } = await setOrderStatus(token, order._id, status, Object.keys(t).length ? t : undefined);
      toast.success(`Order ${orderNo(order)}: ${data.orderStatus}${data.orderStatus !== order.orderStatus ? ". Customer emailed." : "."}`);
      onSaved(data);
    } catch (err) {
      toast.error(err.response?.data?.err || "Couldn't update the order.");
    } finally {
      setBusy(false);
    }
  };

  const refund = async () => {
    if (!window.confirm(`Refund ${inr(amount)} to the customer's card and cancel order ${orderNo(order)}?\n\nThis can't be undone.`)) return;
    setBusy(true);
    try {
      const { data } = await refundOrder(token, order._id);
      toast.success(`Refunded ${inr(data.refund.amount)}. Stock restored and customer emailed.`);
      onSaved(data);
    } catch (err) {
      toast.error(err.response?.data?.err || "Refund failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="adm-detail" aria-label={`Order ${orderNo(order)}`}>
      <div className="adm-detail__head">
        <div>
          <div className="eyebrow">Order {orderNo(order)}{order.invoiceNo ? ` · ${order.invoiceNo}` : ""}</div>
          <h2>{s.name || order.userEmail}</h2>
          <span className="co__hint">{shortDate(order.createdAt)} · {amount ? `${inr(amount)} paid` : "not paid"}{order.coupon ? ` · coupon ${order.coupon}` : ""}</span>
        </div>
        <button type="button" className="fi-dialog__close" onClick={onClose} aria-label="Close">×</button>
      </div>

      <ul className="adm-detail__items">
        {order.products.map((p, i) => (
          <li key={i}>
            <span>{p.product ? <Link to={`/product/${p.product.slug}`}>{p.product.title}</Link> : "Deleted product"}{p.color ? ` · ${p.color}` : ""}</span>
            <span>× {p.count}</span>
            <span>{p.product ? inr(p.product.price * p.count) : "—"}</span>
          </li>
        ))}
      </ul>

      <div className="adm-detail__ship">
        <div className="eyebrow">Deliver to</div>
        <p>
          {s.add || "No address recorded"}<br />
          {s.mobileNum && <a href={`tel:${s.mobileNum}`}>{s.mobileNum}</a>}{s.mobileNum && " · "}
          <a href={`mailto:${s.email || order.userEmail}`}>{s.email || order.userEmail}</a>
          {s.gstin && <><br />GSTIN {s.gstin}</>}
        </p>
        {s.specialMessage && <p className="pay__note">“{s.specialMessage}”</p>}
      </div>

      {order.refund?.id ? (
        <p className="order__cancelled">Refunded {inr(order.refund.amount)} on {shortDate(order.refund.at)}.</p>
      ) : (
        <>
          <div className="adm-detail__status">
            <label className="co-field">
              <span className="adm-label">Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            {(status === "Dispatched" || status === "Delivered") && (
              <div className="lead-form__grid">
                <label className="co-field">
                  <span className="adm-label">Courier</span>
                  <input list="couriers" value={tracking.courier} onChange={(e) => setTracking((t) => ({ ...t, courier: e.target.value }))} maxLength={60} />
                  <datalist id="couriers">{COURIERS.map((c) => <option key={c} value={c} />)}</datalist>
                </label>
                <label className="co-field">
                  <span className="adm-label">Tracking number</span>
                  <input value={tracking.number} onChange={(e) => setTracking((t) => ({ ...t, number: e.target.value }))} maxLength={60} />
                </label>
                <label className="co-field" style={{ gridColumn: "1 / -1" }}>
                  <span className="adm-label">Tracking link (optional)</span>
                  <input type="url" value={tracking.url} onChange={(e) => setTracking((t) => ({ ...t, url: e.target.value }))} placeholder="https://" />
                </label>
              </div>
            )}
          </div>
          <div className="adm-detail__actions">
            <button type="button" className="ink-btn" onClick={save} disabled={busy}>Save{status !== order.orderStatus ? " & email customer" : ""}</button>
            {amount > 0 && <button type="button" className="ink-btn ink-btn--ghost adm-danger" onClick={refund} disabled={busy}>Refund & cancel</button>}
          </div>
        </>
      )}

      {order.statusHistory?.length > 0 && (
        <ol className="adm-detail__history">
          {order.statusHistory.map((h, i) => <li key={i}><span>{h.status}</span><span>{new Date(h.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span></li>)}
        </ol>
      )}

      <PDFDownloadLink document={<Invoice order={order} />} fileName={`invoice-${(order.invoiceNo || orderNo(order)).replace(/\//g, "-")}.pdf`} className="link-line">
        {({ loading }) => (loading ? "Preparing invoice…" : "Download invoice")}
      </PDFDownloadLink>
    </aside>
  );
};

const AdminOrders = () => {
  const { user } = useSelector((s) => s);
  const [orders, setOrders] = useState(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("open");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    getOrders(user.token).then((r) => setOrders(r.data)).catch(() => toast.error("Couldn't load orders."));
  }, [user.token]);

  const filtered = useMemo(() => {
    if (!orders) return [];
    const needle = q.trim().toLowerCase();
    const start = from ? new Date(`${from}T00:00:00`) : null;
    const end = to ? new Date(`${to}T23:59:59`) : null;
    return [...orders]
      .filter((o) => (status === "all" ? true : status === "open" ? ["Not Processed", "Processing"].includes(o.orderStatus) : o.orderStatus === status))
      .filter((o) => (!start || new Date(o.createdAt) >= start) && (!end || new Date(o.createdAt) <= end))
      .filter((o) => !needle || [orderNo(o), o.invoiceNo, o.userEmail, ship(o).name, ship(o).mobileNum, ...o.products.map((p) => p.product?.title)]
        .some((v) => String(v || "").toLowerCase().includes(needle)))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, q, status, from, to]);

  const counts = useMemo(() => (orders || []).reduce((c, o) => ({ ...c, [o.orderStatus]: (c[o.orderStatus] || 0) + 1 }), {}), [orders]);
  const current = orders?.find((o) => o._id === openId);
  const replace = (o) => setOrders((list) => list.map((x) => (x._id === o._id ? { ...x, ...o, products: x.products } : x)));

  return (
    <AdminPage
      title="Orders"
      actions={
        <button type="button" className="ink-btn ink-btn--ghost" disabled={!filtered.length}
          onClick={() => exportGst(filtered.filter((o) => paid(o) > 0), from, to)} title="Paid orders in the current filter">
          Export GST register (CSV)
        </button>
      }
    >
      <div className="adm-filters">
        <input type="search" placeholder="Search order, invoice, name, email, phone, product" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search orders" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="open">To fulfil ({(counts["Not Processed"] || 0) + (counts.Processing || 0)})</option>
          <option value="all">All ({orders?.length || 0})</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s} ({counts[s] || 0})</option>)}
        </select>
        <label className="adm-inline">From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="adm-inline">To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
      </div>

      <div className={`adm-orders${current ? " has-detail" : ""}`}>
        <div className="adm-table-wrap">
          {!orders ? (
            <div className="account__loading">Loading orders…</div>
          ) : !filtered.length ? (
            <p className="co__hint">No orders match.</p>
          ) : (
            <table className="adm-table">
              <thead>
                <tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Paid</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o._id} className={o._id === openId ? "is-on" : ""} onClick={() => setOpenId(o._id)} tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setOpenId(o._id)}>
                    <td><strong>{orderNo(o)}</strong>{o.invoiceNo && <small>{o.invoiceNo}</small>}</td>
                    <td>{shortDate(o.createdAt)}</td>
                    <td>{ship(o).name || o.userEmail}<small>{ship(o).mobileNum}</small></td>
                    <td>{o.products.reduce((t, p) => t + p.count, 0)}</td>
                    <td>{paid(o) ? inr(paid(o)) : "—"}</td>
                    <td><span className={`adm-badge adm-badge--${o.orderStatus.replace(/\s/g, "").toLowerCase()}`}>{o.orderStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {current && <OrderDetail key={current._id + current.orderStatus} order={current} token={user.token} onSaved={replace} onClose={() => setOpenId(null)} />}
      </div>
    </AdminPage>
  );
};

export default AdminOrders;
