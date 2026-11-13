import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import AdminPage, { inr, downloadCsv } from "../../../components/admin/AdminPage";
import { getCategories } from "../../../functions/category";
import { importProducts } from "../../../functions/admin";

const COLUMNS = ["sku", "articleCode", "title", "description", "price", "gst", "category", "quantity", "color", "brand", "material", "design", "style",
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
      p.images = v.split(/[|\s]+/).filter((u) => /^https?:\/\/\S+$/.test(u)).map((url) => ({ url, public_id: "" }));
    } else if (k === "shipping") {
      p.shipping = /^y/i.test(v) ? "Yes" : "No";
    } else if (NUMERIC.includes(k)) {
      const n = Number(v.replace(/[₹,\s]/g, ""));
      if (Number.isFinite(n) && n >= 0) p[k] = n; else problems.push(`${k} "${v}" is not a number`);
    } else p[k] = v;
  }
  if (!p.title) problems.push("title missing");
  else if (p.title.length > 80) problems.push("title longer than 80 characters");
  if (!p.description) problems.push("description missing");
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
  // Fabrics with no price in the file are sold at this flat price (empty = price on request).
  const [fabricPrice, setFabricPrice] = useState("10000");

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

  const fabricId = categories.find((c) => c.slug === "fabrics")?._id;
  const flat = Number(fabricPrice);
  const priceOf = (p) => (p.price !== undefined ? p.price : p.category === fabricId && flat > 0 ? flat : undefined);
  const valid = (rows || []).filter((r) => !r.problems.length);
  const articles = new Set(valid.map((r, i) => (r.p.articleCode ? `a:${r.p.articleCode.toLowerCase()}` : `r:${i}`))).size;
  const run = async () => {
    setBusy(true);
    try {
      const { data } = await importProducts(user.token, valid.map((r) => {
        const price = priceOf(r.p);
        return price === undefined ? r.p : { ...r.p, price };
      }));
      setResult(data);
      toast.success(`${data.products} product${data.products === 1 ? "" : "s"} saved (${data.created} rows added, ${data.updated} updated).`);
    } catch (err) {
      toast.error(err.response?.data?.err || "Import failed.");
    } finally {
      setBusy(false);
    }
  };

  const example = (code, colour) => [`CH1249/${code}`, "CH1249", "Hot Madison Reboot", "Woven, tabby weave upholstery fabric", "", "5", "Fabrics",
    "", colour, "Chivasso", "63% cotton, 37% linen", "Plain", "Tabby weave", "Curtains, Upholstery", "Martindale 55,000",
    "Dry clean only", "140", "", "", "0", "", "Yes", "5801", `https://assets.jab.de/preview/fabrics/article/CH12/CH1249-${code}-article-ratio1.jpg`];
  const template = () => downloadCsv("product-import-template.csv", [COLUMNS, example("069", "Beige"), example("420", "Navy")]);

  return (
    <AdminPage title="Import products" actions={<button type="button" className="ink-btn ink-btn--ghost" onClick={template}>Download template</button>}>
      <p className="co__hint adm-intro">
        Upload a CSV (from Excel: File › Save as › CSV). Required columns: title, description, gst. <strong>One row per
        colour:</strong> rows with the same articleCode (e.g. JAB “CH1249”) become one product, and each row is a colour
        customers pick on the product page: sku is the colour's code (“CH1249/069”), color its name, the first image its
        picture and quantity its stock. Title, description, price and the other details come from the article's first row.
        Re-importing updates the same products, so a file can be loaded again safely. Leave price empty for “price on
        request”. Category is matched by name ({categories.map((c) => c.name).join(", ") || "…"}). Images: links separated by
        “|”. Up to 500 rows per file. Nothing is saved until you press Import.
      </p>
      <label className="adm-inline-field">
        Fabric price when the file has none (₹){" "}
        <input type="number" min="0" step="1" value={fabricPrice} onChange={(e) => setFabricPrice(e.target.value)} disabled={!!result} />
        <small> Empty means “price on request”.</small>
      </label>
      <label className="adm-drop">
        <input type="file" accept=".csv,text/csv" onChange={(e) => read(e.target.files[0])} />
        <span>{fileName || "Choose a CSV file"}</span>
      </label>

      {rows && (
        <>
          <p className="co__hint">{rows.length} rows · <strong>{valid.length} ready</strong> ({articles} product{articles === 1 ? "" : "s"}){rows.length > valid.length && ` · ${rows.length - valid.length} with problems (skipped)`}</p>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>#</th><th>Article</th><th>Colour code</th><th>Title</th><th>Colour</th><th>Category</th><th>Price</th><th>Stock</th><th>Check</th></tr></thead>
              <tbody>
                {rows.map(({ p, problems }, i) => {
                  // Results come back in the order the valid rows were sent.
                  const done = !problems.length && result?.results?.[valid.indexOf(rows[i])];
                  return (
                    <tr key={i} className={problems.length ? "is-bad" : ""}>
                      <td>{i + 2}</td>
                      <td>{p.articleCode || "—"}</td>
                      <td>{p.sku || "—"}</td>
                      <td>{p.title || "—"}</td>
                      <td>{p.color || "—"}</td>
                      <td>{categories.find((c) => c._id === p.category)?.name || "—"}</td>
                      <td>{priceOf(p) !== undefined ? inr(priceOf(p)) : "On request"}</td>
                      <td>{p.quantity ?? "—"}</td>
                      <td>{problems.length ? <span className="co-field__err">{problems.join("; ")}</span> : done ? (done.ok ? <Link to={`/product/${done.slug}`}>{done.updated ? "Updated ✓" : "Added ✓"}</Link> : <span className="co-field__err">{done.err}</span>) : "OK"}</td>
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
              {busy ? "Importing…" : `Import ${articles} product${articles === 1 ? "" : "s"} (${valid.length} rows)`}
            </button>
          )}
        </>
      )}
    </AdminPage>
  );
};

export default ProductImport;
