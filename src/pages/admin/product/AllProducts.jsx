import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import AdminPage, { inr } from "../../../components/admin/AdminPage";
import { searchCatalogue } from "../../../functions/catalogue";
import { deleteProduct } from "../../../functions/product";
import { getCategories } from "../../../functions/category";

const LIMIT = 50;

// The whole catalogue, searchable and paged on the server (scales to imported ranges).
const AllProducts = () => {
  const { user } = useSelector((s) => s);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const load = () =>
    searchCatalogue({ q, category, sort, page, limit: LIMIT }).then(setData).catch(() => toast.error("Couldn't load products."));
  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [q, category, sort, page]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setPage(1), [q, category, sort]);

  const remove = async (p) => {
    if (!window.confirm(`Delete ${p.title}${p.sku ? ` (${p.sku})` : ""}? This can't be undone.`)) return;
    try {
      await deleteProduct(p.slug, user.token);
      toast.success(`${p.title} deleted.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.err || "Couldn't delete the product.");
    }
  };

  return (
    <AdminPage
      title="Products"
      actions={<><Link to="/admin/product" className="ink-btn">Add product</Link> <Link to="/admin/products/import" className="ink-btn ink-btn--ghost">Import CSV</Link></>}
    >
      <div className="adm-filters">
        <input type="search" placeholder="Search title, code, colour, material" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="newest">Newest</option>
          <option value="bestselling">Best selling</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>
      {!data ? <div className="account__loading">Loading…</div> : (
        <>
          <p className="co__hint">{data.total.toLocaleString("en-IN")} products{data.pages > 1 ? ` · page ${data.page} of ${data.pages}` : ""}</p>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th /><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th><th /></tr></thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p._id}>
                    <td className="adm-thumb">{p.images?.[0] && <img src={p.images[0].url} alt="" loading="lazy" />}</td>
                    <td><Link to={`/product/${p.slug}`}><strong>{p.title}</strong></Link>{p.sku && <small>{p.sku}</small>}{p.colours > 0 && <small>{p.colours} colours</small>}</td>
                    <td>{p.category?.name || "—"}</td>
                    <td>{p.priceOnRequest || !(p.price > 0) ? <span className="adm-badge adm-badge--sample">On request</span> : inr(p.price)}</td>
                    <td>{p.quantity === 0 ? <span className="adm-badge adm-badge--red">Sold out</span> : p.quantity ?? "—"}</td>
                    <td>{p.sold || 0}</td>
                    <td className="adm-row-actions">
                      <Link to={`/admin/product/${p.slug}`} className="text-link">Edit</Link>
                      <button type="button" className="text-link" onClick={() => remove(p)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.pages > 1 && (
            <div className="adm-pager">
              <button type="button" className="text-link" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Previous</button>
              <span>{page} / {data.pages}</span>
              <button type="button" className="text-link" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </AdminPage>
  );
};

export default AllProducts;
