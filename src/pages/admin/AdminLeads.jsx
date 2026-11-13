import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import AdminPage, { shortDate, downloadCsv } from "../../components/admin/AdminPage";
import { getLeads, updateLead } from "../../functions/leads";

const TYPES = { sample: "Sample", enquiry: "Enquiry", visit: "Visit", restock: "Back in stock" };
const STATUSES = ["new", "contacted", "converted", "closed"];

const Lead = ({ lead, token, onSaved }) => {
  const [notes, setNotes] = useState(lead.notes || "");
  const save = async (patch) => {
    try {
      const { data } = await updateLead(token, lead._id, patch);
      onSaved(data);
    } catch {
      toast.error("Couldn't update the lead.");
    }
  };
  const v = lead.visit || {};
  const wa = lead.phone && `https://wa.me/${lead.phone.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1")}`;
  return (
    <li className={`adm-lead adm-lead--${lead.status}`}>
      <div className="adm-lead__head">
        <span className={`adm-badge adm-badge--${lead.type}`}>{TYPES[lead.type]}</span>
        <strong>{lead.name || lead.email}</strong>
        <span className="co__hint">{shortDate(lead.createdAt)}</span>
        <select value={lead.status} onChange={(e) => save({ status: e.target.value })} aria-label="Lead status">
          {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <div className="adm-lead__body">
        <p>
          <a href={`mailto:${lead.email}`}>{lead.email}</a>
          {lead.phone && <> · <a href={`tel:${lead.phone}`}>{lead.phone}</a> · <a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a></>}
        </p>
        {v.date && <p><strong>{v.mode === "video" ? "Video call" : "Showroom visit"}</strong> on {new Date(v.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at {v.slot}</p>}
        {lead.products?.length > 0 && (
          <p>{lead.products.map((p, i) => <React.Fragment key={i}>{i > 0 && ", "}<Link to={`/product/${p.slug}`}>{p.title}</Link></React.Fragment>)}</p>
        )}
        {lead.address && <p className="adm-lead__addr">{lead.address}</p>}
        {lead.message && <p className="adm-lead__msg">“{lead.message}”</p>}
        <form className="adm-lead__notes" onSubmit={(e) => { e.preventDefault(); save({ notes }).then(() => toast.success("Note saved.")); }}>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note (posted swatches, called back…)" maxLength={2000} aria-label="Notes" />
          {notes !== (lead.notes || "") && <button type="submit" className="text-link">Save note</button>}
        </form>
      </div>
    </li>
  );
};

// Inbox for sample requests, enquiries, visit bookings and restock requests.
const AdminLeads = () => {
  const { user } = useSelector((s) => s);
  const [leads, setLeads] = useState(null);
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("new");
  const [q, setQ] = useState("");

  useEffect(() => {
    getLeads(user.token).then((r) => setLeads(r.data)).catch(() => toast.error("Couldn't load leads."));
  }, [user.token]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (leads || [])
      .filter((l) => (type === "all" || l.type === type) && (status === "all" || l.status === status))
      .filter((l) => !needle || [l.name, l.email, l.phone, l.message, ...(l.products || []).map((p) => p.title)].some((v) => String(v || "").toLowerCase().includes(needle)));
  }, [leads, type, status, q]);

  const exportCsv = () => downloadCsv("leads.csv", [
    ["Date", "Type", "Status", "Name", "Email", "Phone", "Products", "Visit", "Address", "Message", "Notes"],
    ...shown.map((l) => [shortDate(l.createdAt), TYPES[l.type], l.status, l.name, l.email, l.phone,
      (l.products || []).map((p) => p.title).join("; "), l.visit?.date ? `${l.visit.date} ${l.visit.slot} ${l.visit.mode}` : "", l.address, l.message, l.notes]),
  ]);

  return (
    <AdminPage title="Leads" actions={<button type="button" className="ink-btn ink-btn--ghost" onClick={exportCsv} disabled={!shown.length}>Export CSV</button>}>
      <div className="adm-filters">
        <input type="search" placeholder="Search name, email, phone, product, message" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search leads" />
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Type">
          <option value="all">All types</option>
          {Object.entries(TYPES).map(([k, t]) => <option key={k} value={k}>{t}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="all">Any status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)} ({(leads || []).filter((l) => l.status === s).length})</option>)}
        </select>
      </div>
      {!leads ? <div className="account__loading">Loading leads…</div> : !shown.length ? <p className="co__hint">No leads here.</p> : (
        <ul className="adm-leads">
          {shown.map((l) => <Lead key={l._id} lead={l} token={user.token} onSaved={(d) => setLeads((all) => all.map((x) => (x._id === d._id ? d : x)))} />)}
        </ul>
      )}
    </AdminPage>
  );
};

export default AdminLeads;
