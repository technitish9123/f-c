import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import AdminPage, { inr } from "../../components/admin/AdminPage";
import { getStats } from "../../functions/admin";
import { updateProduct } from "../../functions/product";

const monthLabel = (ym) => new Date(`${ym}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

// Overview: sales, best sellers, stock running low, leads waiting.
const AdminDashboard = () => {
  const { user } = useSelector((s) => s);
  const [stats, setStats] = useState(null);
  const [threshold, setThreshold] = useState(5);
  const [stock, setStock] = useState({});

  const load = () => getStats(user.token, threshold).then((r) => setStats(r.data)).catch(() => toast.error("Couldn't load the overview."));
  useEffect(() => {
    load();
  }, [threshold]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveStock = async (p) => {
    const quantity = Number(stock[p._id]);
    if (!Number.isFinite(quantity) || quantity < 0) return toast.error("Enter a stock number of 0 or more.");
    try {
      await updateProduct(p.slug, { quantity }, user.token);
      toast.success(`${p.title}: stock set to ${quantity}.${p.quantity === 0 && quantity > 0 ? " Waiting customers have been emailed." : ""}`);
      setStock((s) => ({ ...s, [p._id]: undefined }));
      load();
    } catch {
      toast.error("Couldn't update stock.");
    }
  };

  if (!stats) return <AdminPage title="Overview"><div className="account__loading">Loading…</div></AdminPage>;

  const months = [...stats.monthly].reverse();
  const max = Math.max(1, ...months.map((m) => m.revenue));
  const thisMonth = stats.monthly[0];
  const open = (stats.statusCounts["Not Processed"] || 0) + (stats.statusCounts.Processing || 0);

  return (
    <AdminPage title="Overview">
      <div className="adm-kpis">
        <Link to="/admin/orders" className="adm-kpi">
          <span className="eyebrow">To fulfil</span>
          <strong>{open}</strong>
          <span>orders not yet dispatched</span>
        </Link>
        <Link to="/admin/leads" className="adm-kpi">
          <span className="eyebrow">New leads</span>
          <strong>{stats.openLeads}</strong>
          <span>samples, enquiries & visits</span>
        </Link>
        <div className="adm-kpi">
          <span className="eyebrow">This month</span>
          <strong>{inr(thisMonth?.revenue || 0)}</strong>
          <span>{thisMonth?.orders || 0} paid orders</span>
        </div>
        <div className="adm-kpi">
          <span className="eyebrow">Low stock</span>
          <strong>{stats.lowStock.length}</strong>
          <span>products at {threshold} or fewer</span>
        </div>
      </div>

      <section className="adm-card">
        <h2 className="adm-card__title">Sales, last 12 months</h2>
        {months.length ? (
          <div className="adm-bars" role="img" aria-label="Monthly sales">
            {months.map((m) => (
              <div key={m._id} className="adm-bars__col" title={`${monthLabel(m._id)}: ${inr(m.revenue)} from ${m.orders} orders`}>
                <span className="adm-bars__val">{m.revenue >= 1e5 ? `${(m.revenue / 1e5).toFixed(1)}L` : `${Math.round(m.revenue / 1e3)}k`}</span>
                <div className="adm-bars__bar" style={{ height: `${Math.max(2, (m.revenue / max) * 100)}%` }} />
                <span className="adm-bars__label">{monthLabel(m._id)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="co__hint">No paid orders yet.</p>
        )}
      </section>

      <div className="adm-split">
        <section className="adm-card">
          <h2 className="adm-card__title">Best sellers</h2>
          <ol className="adm-list">
            {stats.top.map((p) => (
              <li key={p._id}><Link to={`/product/${p.slug}`}>{p.title}</Link><span>{p.sold} sold</span></li>
            ))}
            {!stats.top.length && <li className="co__hint">Nothing sold yet.</li>}
          </ol>
        </section>

        <section className="adm-card">
          <div className="adm-card__row">
            <h2 className="adm-card__title">Low stock</h2>
            <label className="adm-inline">
              at or below
              <select value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}>
                {[0, 2, 5, 10, 20].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
          <ul className="adm-stock">
            {stats.lowStock.map((p) => (
              <li key={p._id}>
                {p.image && <img src={p.image} alt="" loading="lazy" />}
                <Link to={`/admin/product/${p.slug}`}>{p.title}</Link>
                <span className={p.quantity === 0 ? "adm-badge adm-badge--red" : "adm-badge"}>{p.quantity === 0 ? "Sold out" : `${p.quantity} left`}</span>
                <form onSubmit={(e) => { e.preventDefault(); saveStock(p); }} className="adm-stock__edit">
                  <input type="number" min="0" aria-label={`New stock for ${p.title}`} placeholder="Stock" value={stock[p._id] ?? ""}
                    onChange={(e) => setStock((s) => ({ ...s, [p._id]: e.target.value }))} />
                  <button type="submit" className="text-link" disabled={stock[p._id] === undefined || stock[p._id] === ""}>Set</button>
                </form>
              </li>
            ))}
            {!stats.lowStock.length && <li className="co__hint">All products are above {threshold}.</li>}
          </ul>
        </section>
      </div>
    </AdminPage>
  );
};

export default AdminDashboard;
