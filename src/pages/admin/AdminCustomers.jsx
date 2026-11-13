import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import AdminPage, { inr, shortDate, downloadCsv } from "../../components/admin/AdminPage";
import { getCustomers } from "../../functions/admin";

const SORTS = { spent: (a, b) => b.spent - a.spent, orders: (a, b) => b.orders - a.orders, recent: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) };

// Everyone with an account, with their orders and lifetime spend.
const AdminCustomers = () => {
  const { user } = useSelector((s) => s);
  const [list, setList] = useState(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("spent");
  const [buyersOnly, setBuyersOnly] = useState(false);

  useEffect(() => {
    getCustomers(user.token).then((r) => setList(r.data)).catch(() => toast.error("Couldn't load customers."));
  }, [user.token]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (list || [])
      .filter((c) => (!buyersOnly || c.orders > 0) && (!needle || [c.name, c.email, c.phone].some((v) => String(v || "").toLowerCase().includes(needle))))
      .sort(SORTS[sort]);
  }, [list, q, sort, buyersOnly]);
  const total = shown.reduce((t, c) => t + c.spent, 0);

  return (
    <AdminPage
      title="Customers"
      actions={<button type="button" className="ink-btn ink-btn--ghost" disabled={!shown.length} onClick={() => downloadCsv("customers.csv", [
        ["Name", "Email", "Phone", "Joined", "Orders", "Spent", "Last order", "Role"],
        ...shown.map((c) => [c.name, c.email, c.phone, shortDate(c.createdAt), c.orders, c.spent.toFixed(2), c.lastOrder ? shortDate(c.lastOrder) : "", c.role]),
      ])}>Export CSV</button>}
    >
      <div className="adm-filters">
        <input type="search" placeholder="Search name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search customers" />
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="spent">Highest spend</option>
          <option value="orders">Most orders</option>
          <option value="recent">Newest</option>
        </select>
        <label className="adm-inline"><input type="checkbox" checked={buyersOnly} onChange={(e) => setBuyersOnly(e.target.checked)} /> Buyers only</label>
      </div>
      {!list ? <div className="account__loading">Loading…</div> : (
        <>
          <p className="co__hint">{shown.length} customers · {inr(total)} lifetime spend</p>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Customer</th><th>Phone</th><th>Joined</th><th>Orders</th><th>Spent</th><th>Last order</th></tr></thead>
              <tbody>
                {shown.map((c) => (
                  <tr key={c._id}>
                    <td><strong>{c.name || "—"}</strong>{c.role === "admin" && <span className="adm-badge"> admin</span>}<small><a href={`mailto:${c.email}`}>{c.email}</a></small></td>
                    <td>{c.phone ? <a href={`tel:${c.phone}`}>{c.phone}</a> : "—"}</td>
                    <td>{shortDate(c.createdAt)}</td>
                    <td>{c.orders}</td>
                    <td>{c.spent ? inr(c.spent) : "—"}</td>
                    <td>{c.lastOrder ? shortDate(c.lastOrder) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminPage>
  );
};

export default AdminCustomers;
