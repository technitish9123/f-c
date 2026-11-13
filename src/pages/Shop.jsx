import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { Slider } from "antd";
import { searchCatalogue } from "../functions/catalogue";
import LoadingCard from "../components/cards/LoadingCard";
import ProductCard from "../components/cards/ProductCard";
import finderImg from "../components/assets/images/s8.jpg";
import { FACETS, COLOUR_FAMILIES, SORTS } from "../functions/facets";

const PAGE = 24;
const swatchHex = Object.fromEntries(COLOUR_FAMILIES.map((f) => [f.key, f.hex]));
const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const emptySelection = () => Object.fromEntries(FACETS.map((f) => [f.key, []]));

// Also serves /category/:slug and /sub/:slug, scoped to that category.
// Search, filters, counts and paging all run on the server (GET /catalogue).
const Shop = () => {
  const dispatch = useDispatch();
  const { slug } = useParams();
  const { pathname } = useLocation();
  const scope = slug ? (pathname.startsWith("/sub/") ? "sub" : "category") : null;
  const searchText = useSelector((state) => state.search.text);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({});
  const [priceBounds, setPriceBounds] = useState([0, 0]);
  const [scopeName, setScopeName] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState(emptySelection);
  const [price, setPrice] = useState(null); // committed [min, max] or null = any
  const [sliding, setSliding] = useState(null); // slider position while dragging
  const [sort, setSort] = useState("featured");
  const [sheetOpen, setSheetOpen] = useState(false);
  const request = useRef(null);

  // Moving between categories starts fresh.
  useEffect(() => {
    setSelected(emptySelection());
    setPrice(null);
    window.scrollTo(0, 0);
  }, [slug]);

  const query = (p) => ({
    q: searchText, ...(scope === "category" && { category: slug }), ...(scope === "sub" && { sub: slug }),
    ...selected, ...(price && { min: price[0], max: price[1] }), sort, page: p, limit: PAGE,
  });

  // First page whenever the question changes; the previous request is cancelled.
  useEffect(() => {
    request.current?.abort();
    const ctrl = (request.current = new AbortController());
    setLoading(true);
    const t = setTimeout(() => {
      searchCatalogue(query(1), { signal: ctrl.signal })
        .then((r) => {
          setItems(r.items);
          setTotal(r.total);
          setCounts(r.facets);
          if (!price) setPriceBounds(r.price ? [r.price.min, r.price.max] : [0, 0]);
          setScopeName(r.scope?.name || (slug ? slug.replace(/-/g, " ") : ""));
          setPage(1);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name === "CanceledError" || err.name === "AbortError") return;
          setItems([]);
          setTotal(0);
          setLoading(false);
        });
    }, 120); // let quick filter clicks settle into one request
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [slug, scope, searchText, selected, price, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = () => {
    setLoadingMore(true);
    searchCatalogue(query(page + 1))
      .then((r) => {
        setItems((list) => [...list, ...r.items]);
        setPage(page + 1);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  // Lock page scroll while the filter drawer is open; Esc closes it.
  useEffect(() => {
    document.body.classList.toggle("menu-open", sheetOpen);
    const onKey = (e) => e.key === "Escape" && setSheetOpen(false);
    if (sheetOpen) window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  const toggle = (key, value) =>
    setSelected((s) => ({
      ...s,
      [key]: s[key].includes(value) ? s[key].filter((v) => v !== value) : [...s[key], value],
    }));

  const activeChips = [
    ...FACETS.flatMap((f) => selected[f.key].map((v) => ({ key: f.key, value: v, label: v }))),
    ...(price ? [{ key: "price", label: `${inr(price[0])} – ${inr(price[1])}` }] : []),
    ...(searchText ? [{ key: "search", label: `“${searchText}”` }] : []),
  ];

  const clearAll = () => {
    setSelected(emptySelection());
    setPrice(null);
    if (searchText) dispatch({ type: "SEARCH_QUERY", payload: { text: "" } });
  };

  const removeChip = (chip) => {
    if (chip.key === "price") setPrice(null);
    else if (chip.key === "search") dispatch({ type: "SEARCH_QUERY", payload: { text: "" } });
    else toggle(chip.key, chip.value);
  };

  const panel = (
    <div className="facets">
      {FACETS.map((f) => {
        const options = counts[f.key] || [];
        if (scope && f.key === "type") return null; // already scoped to one type
        if (options.length < 2 && selected[f.key].length === 0) return null; // nothing to choose
        return (
          <details className="filter" key={f.key} open={f.key !== "composition"}>
            <summary>
              {f.label}
              {selected[f.key].length > 0 && <span className="filter__n">{selected[f.key].length}</span>}
            </summary>
            {f.swatch ? (
              <div className="swatches">
                {options.map(({ value, count }) => (
                  <button
                    key={value}
                    type="button"
                    className={`swatch${selected[f.key].includes(value) ? " is-on" : ""}`}
                    onClick={() => toggle(f.key, value)}
                    aria-pressed={selected[f.key].includes(value)}
                    title={`${value} (${count})`}
                  >
                    <span className="swatch__chip" style={{ background: swatchHex[value] }} />
                    <span className="swatch__label">{value}</span>
                  </button>
                ))}
              </div>
            ) : (
              <ul className="facet-list">
                {options.map(({ value, count }) => (
                  <li key={value}>
                    <label className="facet">
                      <input
                        type="checkbox"
                        checked={selected[f.key].includes(value)}
                        onChange={() => toggle(f.key, value)}
                      />
                      <span className="facet__box" aria-hidden="true" />
                      <span className="facet__label">{value}</span>
                      <span className="facet__count">{count}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </details>
        );
      })}

      {priceBounds[1] > priceBounds[0] && (
        <details className="filter" open>
          <summary>Price</summary>
          <div className="price-range">
            <Slider
              range
              min={priceBounds[0]}
              max={priceBounds[1]}
              step={100}
              value={sliding || price || priceBounds}
              onChange={(v) => setSliding(v)}
              onChangeComplete={(v) => {
                setSliding(null);
                setPrice(v[0] <= priceBounds[0] && v[1] >= priceBounds[1] ? null : v);
              }}
              tooltip={{ formatter: (v) => inr(v) }}
            />
            <div className="price-range__values">
              <span>{inr((sliding || price || priceBounds)[0])}</span>
              <span>{inr((sliding || price || priceBounds)[1])}</span>
            </div>
          </div>
        </details>
      )}
    </div>
  );

  return (
    <div className="shop">
      <header className="shop__head">
        <h1>{searchText ? `Results for “${searchText}”` : scope ? scopeName : "Product finder"}</h1>
        {!searchText && !scope && (
          <p className="shop__tagline">
            Find the fabric
            <br />
            your room has been waiting for
          </p>
        )}
      </header>

      {!searchText && !scope && (
        <section className="finder-intro">
          <figure className="finder-intro__media">
            <img src={finderImg} alt="A living room dressed in First Impression curtains and upholstery" />
            <button type="button" className="finder-intro__cta" onClick={() => setSheetOpen(true)}>
              Start finding
            </button>
          </figure>
          <p className="finder-intro__text">
            Narrow the collection by where it will live, its colour, its pattern and what it is woven from.
            Every curtain, upholstery fabric and wallcovering we carry can be seen and felt at our showroom
            in Kemps Corner.
          </p>
        </section>
      )}

      <div className="shop__body">
        <aside className={`shop__aside${sheetOpen ? " is-open" : ""}`} aria-label="Filters">
          <div className="shop__aside-head">
            <span className="eyebrow">Filter</span>
            {activeChips.length > 0 && (
              <button type="button" className="text-link" onClick={clearAll}>
                Clear all
              </button>
            )}
            <button type="button" className="shop__sheet-close" onClick={() => setSheetOpen(false)} aria-label="Close filters">
              ✕
            </button>
          </div>
          {panel}
          <div className="shop__sheet-foot">
            <button type="button" className="ink-btn" onClick={() => setSheetOpen(false)}>
              Show {total.toLocaleString("en-IN")} {total === 1 ? "product" : "products"}
            </button>
          </div>
        </aside>
        {sheetOpen && <div className="shop__scrim" onClick={() => setSheetOpen(false)} aria-hidden="true" />}

        <section className="shop__results">
          <div className="shop__toolbar">
            <label className="shop__sort">
              <span className="eyebrow">Sorting</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <span className="shop__count">
              {loading ? "Loading…" : `${total.toLocaleString("en-IN")} ${total === 1 ? "product" : "products"}`}
            </span>
            <button type="button" className="shop__filter-btn" onClick={() => setSheetOpen(true)} aria-expanded={sheetOpen}>
              {activeChips.length > 0 && <span className="shop__filter-n">{activeChips.length}</span>}
              Filter
            </button>
          </div>

          {activeChips.length > 0 && (
            <div className="chips">
              {activeChips.map((c) => (
                <button key={`${c.key}:${c.label}`} type="button" className="chip" onClick={() => removeChip(c)}>
                  {c.label} <span aria-hidden="true">✕</span>
                  <span className="sr-only">Remove filter</span>
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <LoadingCard count={9} />
          ) : total === 0 ? (
            <div className="empty-state">
              <p>No pieces match these filters.</p>
              <button type="button" className="buybox__cta" onClick={clearAll}>
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              {items.length < total && (
                <div className="shop__more">
                  <p className="eyebrow">
                    Showing {items.length.toLocaleString("en-IN")} of {total.toLocaleString("en-IN")}
                  </p>
                  <button type="button" className="ink-btn ink-btn--ghost" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Shop;
