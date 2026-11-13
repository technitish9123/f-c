import React from "react";
import AdminNav from "../nav/AdminNav";

// Shared admin frame: nav on the left, titled content on the right.
const AdminPage = ({ title, actions, children }) => (
  <div className="container-fluid">
    <div className="row">
      <div className="col-md-2">
        <AdminNav />
      </div>
      <div className="col adm">
        <div className="adm__head">
          <h1>{title}</h1>
          {actions && <div className="adm__actions">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  </div>
);

export const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
export const shortDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");

// Download rows as a CSV file (Excel/Tally friendly).
export const downloadCsv = (filename, rows) => {
  const cell = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(cell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default AdminPage;
