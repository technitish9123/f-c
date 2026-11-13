import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import AdminPage, { inr, downloadCsv } from "../../../components/admin/AdminPage";
import { getCategories } from "../../../functions/category";
import { importProducts } from "../../../functions/admin";

const COLUMNS = ["title", "description", "price", "gst", "category", "quantity", "color", "brand", "material", "design", "style",
  "application", "property", "instruction", "width", "length", "weight", "repeatLength", "rollLength", "shipping", "hsn", "images"];
const NUMERIC = ["price", "gst", "quantity", "width", "length", "weight", "repeatLength", "rollLength"];

// RFC 4180 CSV: quoted fields, escaped quotes, commas and newlines inside quotes.
export const parseCsv = (text) => {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
};

// One CSV row -> product body, or a list of problems.
const toProduct = (rec, categories) => {
  const problems = [];
  const p = {};
  for (const k of COLUMNS) {
    const v = (rec[k] || "").trim();
    if (!v) continue;
    if (k === "category") {
      const c = categories.find((x) => [x.name.toLowerCase(), x.slug].includes(v.toLowerCase()));
      if (c) p.category = c._id; else problems.push(`unknown category "${v}"`);
    } else if (k === "images") {
      p.images = v.split(/[|\s]+/).filter((u) => /^https:\/\//.test(u)).map((url) => ({ url, public_id: "" }));
    } else if (k === "shipping") {
      p.shipping = /^y/i.test(v) ? "Yes" : "No";
    } else if (NUMERIC.includes(k)) {
      const n = Number(v.replace(/[₹,\s]/g, ""));
      if (Number.isFinite(n) && n >= 0) p[k] = n; else problems.push(`${k} "${v}" is not a number`);
    } else p[k] = v;
  }
  if (!p.title) problems.push("title missing");
  else if (p.title.length > 32) problems.push("title longer than 32 characters");
  if (!p.description) problems.push("description missing");
  if (p.price === undefined) problems.push("price missing");
  if (p.gst === undefined) problems.push("gst missing");
  if (p.hsn && !/^\d{4,8}$/.test(p.hsn)) problems.push("hsn must be 4-8 digits");
  return { p, problems };
};

const ProductImport = () => {
  const { user } = useSelector((s) => s);
  const [categories, setCategories] = useState([]);
  const [rows, setRows] = useState(null);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const read = (file) => {
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    file.text().then((text) => {
      const [head, ...body] = parseCsv(text.replace(/^﻿/, ""));
      if (!head) return toast.error("That file is empty.");
      const keys = head.map((h) => COLUMNS.find((c) => c.toLowerCase() === h.trim().toLowerCase()) || null);
      if (!keys.includes("title")) return toast.error("The first row must be the column names (download the template).");
      if (body.length > 500) return toast.error("Up to 500 products per file, please split it.");
      setRows(body.map((cells) => toProduct(Object.fromEntries(keys.map((k, i) => [k, cells[i]]).filter(([k]) => k)), categories)));
    });
  };

  const valid = (rows || []).filter((r) => !r.problems.length);
  const run = async () => {
    setBusy(true);
    try {
      const { data } = await importProducts(user.token, valid.map((r) => r.p));
      setResult(data);
      toast.success(`${data.created} product${data.created === 1 ? "" : "s"} added.`);
    } catch (err) {
      toast.error(err.response?.data?.err || "Import failed.");
    } finally {
      setBusy(false);
    }
  };

  const template = () => downloadCsv("product-import-template.csv", [
    COLUMNS,
    ["Velvet Noir 01", "Heavy cotton velvet with a soft sheen", "4200", "5", categories[0]?.name || "Fabrics", "30", "Black", "European",
      "100% cotton", "Plain", "Velvet", "Curtains, Upholstery", "Fade resistant", "Dry clean only", "140", "", "", "0", "", "Yes", "5801",
      "https://res.cloudinary.com/your-cloud/image/upload/v1/velvet-noir.jpg"],
  ]);

  return (
    <AdminPage title="Import products" actions={<button type="button" className="ink-btn ink-btn--ghost" onClick={template}>Download template</button>}>
      <p className="co__hint adm-intro">
        Upload a CSV (from Excel: File › Save as › CSV). Required columns: title, description, price (incl. GST), gst. Category is
        matched by name ({categories.map((c) => c.name).join(", ") || "…"}). Images: one or more https links separated by “|”.
        Nothing is saved until you press Import.
      </p>
      <label className="adm-drop">
        <input type="file" accept=".csv,text/csv" onChange={(e) => read(e.target.files[0])} />
        <span>{fileName || "Choose a CSV file"}</span>
      </label>

      {rows && (
        <>
          <p className="co__hint">{rows.length} rows · <strong>{valid.length} ready</strong>{rows.length > valid.length && ` · ${rows.length - valid.length} with problems (skipped)`}</p>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>#</th><th>Title</th><th>Category</th><th>Price</th><th>Stock</th><th>Check</th></tr></thead>
              <tbody>
                {rows.map(({ p, problems }, i) => {
                  const done = result?.results?.find((r) => r.slug && r.slug === p.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                  return (
                    <tr key={i} className={problems.length ? "is-bad" : ""}>
                      <td>{i + 2}</td>
                      <td>{p.title || "—"}</td>
                      <td>{categories.find((c) => c._id === p.category)?.name || "—"}</td>
                      <td>{p.price !== undefined ? inr(p.price) : "—"}</td>
                      <td>{p.quantity ?? "—"}</td>
                      <td>{problems.length ? <span className="co-field__err">{problems.join("; ")}</span> : done ? <Link to={`/product/${done.slug}`}>Added ✓</Link> : "OK"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {result && result.results.some((r) => !r.ok) && (
            <ul className="adm-import-errors">
              {result.results.filter((r) => !r.ok).map((r) => <li key={r.row}>{valid[r.row - 1]?.p.title}: {r.err}</li>)}
            </ul>
          )}
          {!result && (
            <button type="button" className="ink-btn" onClick={run} disabled={busy || !valid.length}>
              {busy ? "Importing…" : `Import ${valid.length} product${valid.length === 1 ? "" : "s"}`}
            </button>
          )}
        </>
      )}
    </AdminPage>
  );
};

export default ProductImport;
