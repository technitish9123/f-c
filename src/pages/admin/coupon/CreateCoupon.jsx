import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import AdminPage, { inr, shortDate } from "../../../components/admin/AdminPage";
import { createCoupon, deleteCoupon, getCoupons } from "../../../functions/coupon";

const inAMonth = () => new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
const blank = { name: "", discount: "", expiry: inAMonth(), minOrder: "", maxUses: "", firstOrderOnly: false };

// Coupons with optional rules: minimum bag value, usage limit, first order only.
const CreateCoupon = () => {
  const { user } = useSelector((s) => s);
  const [form, setForm] = useState(blank);
  const [coupons, setCoupons] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => getCoupons(user.token).then((r) => setCoupons(r.data)).catch(() => setCoupons([]));
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const name = form.name.trim().toUpperCase();
  const problem =
    !/^[A-Z0-9]{6,12}$/.test(name) ? "Code: 6-12 letters or numbers." :
    !(Number(form.discount) >= 1 && Number(form.discount) <= 100) ? "Discount: 1-100%." :
    !form.expiry || form.expiry <= new Date().toISOString().slice(0, 10) ? "Expiry must be in the future." : "";

  const submit = async (e) => {
    e.preventDefault();
    if (problem) return toast.error(problem);
    setBusy(true);
    try {
      const { data } = await createCoupon(user.token, {
        name, discount: Number(form.discount), expiry: new Date(`${form.expiry}T23:59:59+05:30`).toISOString(),
        ...(form.minOrder && { minOrder: Number(form.minOrder) }), ...(form.maxUses && { maxUses: Number(form.maxUses) }),
        firstOrderOnly: form.firstOrderOnly,
      });
      toast.success(`${data.name} created.`);
      setForm(blank);
      load();
    } catch (err) {
      toast.error(err.response?.data?.err || "Couldn't create the coupon.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete coupon ${c.name}? Customers won't be able to use it any more.`)) return;
    try {
      await deleteCoupon(user.token, c._id);
      toast.success(`${c.name} deleted.`);
      load();
    } catch {
      toast.error("Couldn't delete the coupon.");
    }
  };

  const status = (c) => (new Date(c.expiry) < new Date() ? "Expired" : c.maxUses && c.usedCount >= c.maxUses ? "Used up" : "Active");

  return (
    <AdminPage title="Coupons">
      <form className="adm-card adm-coupon" onSubmit={submit} noValidate>
        <div className="adm-coupon__grid">
          <label className="co-field"><span className="adm-label">Code</span>
            <input value={form.name} onChange={set("name")} placeholder="WELCOME10" maxLength={12} style={{ textTransform: "uppercase" }} /></label>
          <label className="co-field"><span className="adm-label">Discount %</span>
            <input type="number" min="1" max="100" value={form.discount} onChange={set("discount")} /></label>
          <label className="co-field"><span className="adm-label">Expires on</span>
            <input type="date" value={form.expiry} onChange={set("expiry")} /></label>
          <label className="co-field"><span className="adm-label">Minimum bag (₹, optional)</span>
            <input type="number" min="0" value={form.minOrder} onChange={set("minOrder")} placeholder="No minimum" /></label>
          <label className="co-field"><span className="adm-label">Total uses (optional)</span>
            <input type="number" min="0" value={form.maxUses} onChange={set("maxUses")} placeholder="Unlimited" /></label>
          <label className="adm-inline adm-coupon__check"><input type="checkbox" checked={form.firstOrderOnly} onChange={set("firstOrderOnly")} /> First order only</label>
        </div>
        <button type="submit" className="ink-btn" disabled={busy}>{busy ? "Creating…" : "Create coupon"}</button>
      </form>

      {!coupons ? <div className="account__loading">Loading…</div> : !coupons.length ? <p className="co__hint">No coupons yet.</p> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Code</th><th>Discount</th><th>Rules</th><th>Used</th><th>Expires</th><th>Status</th><th /></tr></thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.discount}%</td>
                  <td>{[c.minOrder ? `min ${inr(c.minOrder)}` : "", c.firstOrderOnly ? "first order" : ""].filter(Boolean).join(", ") || "—"}</td>
                  <td>{c.usedCount || 0}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                  <td>{shortDate(c.expiry)}</td>
                  <td><span className={`adm-badge${status(c) === "Active" ? " adm-badge--delivered" : ""}`}>{status(c)}</span></td>
                  <td><button type="button" className="text-link" onClick={() => remove(c)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPage>
  );
};

export default CreateCoupon;
