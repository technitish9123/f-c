import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { Slider } from "antd";
import { getCatalogue } from "../functions/catalogue";
import LoadingCard from "../components/cards/LoadingCard";
import ProductCard from "../components/cards/ProductCard";
import finderImg from "../components/assets/images/s8.jpg";
import {
  FACETS,
  COLOUR_FAMILIES,
  SORTS,
  indexProducts,
  filterItems,
  facetCounts,
  sortItems,
  searchItems,
} from "../functions/facets";

const PAGE = 24;
const swatchHex = Object.fromEntries(COLOUR_FAMILIES.map((f) => [f.key, f.hex]));
const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const emptySelection = () => Object.fromEntries(FACETS.map((f) => [f.key, []]));

// Also serves /category/:slug and /sub/:slug, scoped to that category.
const Shop = () => {
  const dispatch = useDispatch();
  const { slug } = useParams();
  const { pathname } = useLocation();
  const scope = slug ? (pathname.startsWith("/sub/") ? "sub" : "category") : null;
  const searchText = useSelector((state) => state.search.text);

  const [items, setItems] = useState([]); // indexed products
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(emptySelection);
  const [price, setPrice] = useState(null); // [min, max] or null = any
  const [sort, setSort] = useState("featured");
  const [visible, setVisible] = useState(PAGE);
  const [sheetOpen, setSheetOpen] = useState(false);

  // The catalogue is loaded once and shared; search, filters and sorting run client-side.
  useEffect(() => {
    let cancelled = false;
    getCatalogue()
      .then((list) => !cancelled && setItems(indexProducts(list)))
      .catch(() => !cancelled && setItems([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Moving between categories starts fresh.
  useEffect(() => {
    setSelected(emptySelection());
    setPrice(null);
    window.scrollTo(0, 0);
  }, [slug]);

  const scoped = useMemo(() => {
    if (!scope) return items;
    return items.filter(({ product: p }) =>
      scope === "category"
        ? p.category && p.category.slug === slug
        : (p.subs || []).some((s) => s && s.slug === slug)
    );
  }, [items, scope, slug]);
  const scopeName = useMemo(() => {
    const p = scoped[0] && scoped[0].product;
    if (!p) return slug ? slug.replace(/-/g, " ") : "";
    return scope === "category" ? p.category.name : ((p.subs || []).find((s) => s.slug === slug) || {}).name || slug;
  }, [scoped, scope, slug]);

  const searched = useMemo(() => searchItems(scoped, searchText), [scoped, searchText]);

  // Reset paging whenever the result set changes.
  useEffect(() => setVisible(PAGE), [selected, price, sort, searchText]);

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

  const priceBounds = useMemo(() => {
    if (!scoped.length) return [0, 0];
    let lo = Infinity;
    let hi = -Infinity;
    for (const { price: p } of scoped) {
      if (p < lo) lo = p;
      if (p > hi) hi = p;
    }
    return [lo, hi];
  }, [scoped]);

  const results = useMemo(
    () => sortItems(filterItems(searched, selected, price), sort),
    [searched, selected, price, sort]
  );
  const counts = useMemo(() => facetCounts(searched, selected, price), [searched, selected, price]);

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
              value={price || priceBounds}
              onChange={(v) => setPrice(v)}
              tooltip={{ formatter: (v) => inr(v) }}
            />
            <div className="price-range__values">
              <span>{inr((price || priceBounds)[0])}</span>
              <span>{inr((price || priceBounds)[1])}</span>
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
              Show {results.length.toLocaleString("en-IN")} {results.length === 1 ? "product" : "products"}
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
              {loading ? "Loading…" : `${results.length.toLocaleString("en-IN")} ${results.length === 1 ? "product" : "products"}`}
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
          ) : results.length === 0 ? (
            <div className="empty-state">
              <p>No pieces match these filters.</p>
              <button type="button" className="buybox__cta" onClick={clearAll}>
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {results.slice(0, visible).map(({ product }) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              {visible < results.length && (
                <div className="shop__more">
                  <p className="eyebrow">
                    Showing {visible} of {results.length}
                  </p>
                  <button type="button" className="ink-btn ink-btn--ghost" onClick={() => setVisible((v) => v + PAGE)}>
                    Load more
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
