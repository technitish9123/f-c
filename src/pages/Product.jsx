import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getProduct } from "../functions/product";
import { getCatalogue, familyOf } from "../functions/catalogue";
import { colourOf } from "../functions/facets";
import { samples, recentlyViewed, SAMPLE_LIMIT } from "../functions/localList";
import QuantityCalculator from "../components/product/QuantityCalculator";
import { EnquiryForm, NotifyForm } from "../components/product/LeadForms";
import Dialog from "../components/ui/Dialog";
import ProductRail from "../components/home/ProductRail";
import { toast } from "react-toastify";
import { addToCart } from "../functions/cart";
import { useFavourites } from "../functions/useFavourites";
import ProductCard from "../components/cards/ProductCard";
import LoadingCard from "../components/cards/LoadingCard";
import fallbackImg from "../images/laptop.png";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const words = (s) => String(s || "").toLowerCase().split(/[\s,]+/).filter(Boolean);

const WHATSAPP = "917777045811";
const whatsapp = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

// Other categories in the same colour family: fabric + wallpaper + trims that go together.
const completeTheLook = (product, catalogue, limit = 8) => {
  const family = colourOf(product)[0];
  const cat = product.category && product.category._id;
  if (!family) return [];
  return catalogue
    .filter((p) => p._id !== product._id && p.category && p.category._id !== cat && colourOf(p)[0] === family && p.quantity !== 0)
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, limit);
};

// Rank other products by how much they share with this one (O(n) over the catalogue).
const relatedTo = (product, catalogue, limit = 8) => {
  const family = familyOf(product.title);
  const uses = new Set(words(product.application));
  const catId = product.category && product.category._id;
  return catalogue
    .filter((p) => p._id !== product._id && familyOf(p.title) !== family)
    .map((p) => ({
      p,
      score:
        (p.category && p.category._id === catId ? 3 : 0) +
        (p.design && p.design.trim().toLowerCase() === String(product.design || "").trim().toLowerCase() ? 2 : 0) +
        (p.color && p.color === product.color ? 2 : 0) +
        words(p.application).filter((w) => uses.has(w)).length * 0.2,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
};

const Gallery = ({ images, title }) => {
  const urls = images.length ? images.map((i) => i.url) : [fallbackImg];
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(null);
  const current = urls[Math.min(index, urls.length - 1)];

  useEffect(() => setIndex(0), [images]);

  const onKey = (e) => {
    if (e.key === "ArrowRight") setIndex((i) => (i + 1) % urls.length);
    if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + urls.length) % urls.length);
  };
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div className="pdp__gallery" onKeyDown={onKey}>
      <div
        className={`pdp__stage${zoom ? " is-zoomed" : ""}`}
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
        tabIndex={0}
        aria-label={`${title}, image ${index + 1} of ${urls.length}. Use arrow keys to browse.`}
      >
        <img src={current} alt={title} style={zoom ? { transformOrigin: zoom } : undefined} />
      </div>
      {urls.length > 1 && (
        <div className="pdp__thumbs">
          {urls.map((u, i) => (
            <button
              key={u + i}
              type="button"
              className={i === index ? "is-on" : ""}
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
            >
              <img src={u} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Product = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const fav = useFavourites();
  const sampleBasket = samples.use();
  const recent = recentlyViewed.use();
  const [enquire, setEnquire] = useState(false);
  const [product, setProduct] = useState(null);
  const [catalogue, setCatalogue] = useState([]);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    getCatalogue().then(setCatalogue).catch(() => {});
  }, []);

  // Render instantly from the cached catalogue when possible; the API gives the full record.
  useEffect(() => {
    let current = true;
    setMissing(false);
    window.scrollTo(0, 0);
    const cached = catalogue.find((p) => p.slug === slug);
    setProduct(cached || null);
    getProduct(slug)
      .then((res) => current && (res.data ? setProduct(res.data) : setMissing(true)))
      .catch(() => current && !cached && setMissing(true));
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Remember this product once its full record is in.
  useEffect(() => {
    if (product && product.slug === slug && product.title) recentlyViewed.push(product);
  }, [product, slug]);

  useEffect(() => {
    if (product && product.title) document.title = `${product.title} | First Impression`;
    return () => {
      document.title = "First Impression";
    };
  }, [product]);

  const colourways = useMemo(() => {
    if (!product) return [];
    const family = familyOf(product.title);
    return catalogue.filter((p) => familyOf(p.title) === family);
  }, [product, catalogue]);

  const related = useMemo(() => (product ? relatedTo(product, catalogue) : []), [product, catalogue]);
  const look = useMemo(() => (product ? completeTheLook(product, catalogue) : []), [product, catalogue]);
  const recentOthers = useMemo(() => recent.filter((p) => p.slug !== slug).slice(0, 10), [recent, slug]);

  if (missing) {
    return (
      <div className="pdp pdp--missing empty-state">
        <p>This piece is no longer available.</p>
        <Link to="/shop" className="buybox__cta">
          Back to the collection
        </Link>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="pdp">
        <LoadingCard count={2} />
      </div>
    );
  }

  const { title, price, images = [], category, material, application, design, color, brand, width, rollLength,
    style, instruction, description, property, quantity } = product;
  const out = quantity === 0;
  const quality = [category && category.name, style, design].filter(Boolean).join(", ");
  const link = `https://firstimp.in/product/${product.slug}`;
  const inBasket = sampleBasket.some((p) => p._id === String(product._id));
  const addSample = () => {
    if (!samples.add(product)) {
      toast.info(`You can request up to ${SAMPLE_LIMIT} samples at a time.`);
      return;
    }
    toast.success(`Sample of ${title} added. Request it from your sample list.`);
  };

  const spec = [
    ["Article", title],
    ["Brand", brand],
    ["Colour", color],
    ["Composition", material],
    ["Pattern", design],
    ["Weave / finish", style],
    ["Width", width ? `${width} cm` : null],
    ["Roll length", rollLength ? `${rollLength} m` : null],
    ["Suitable for", application && application.split(",").map((s) => s.trim()).filter(Boolean).join(", ")],
    ["Properties", property],
    ["Care", instruction],
  ].filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "");

  return (
    <div className="pdp">
      <nav className="pdp__crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Product finder</Link>
        {category && category.slug && (
          <>
            <span>/</span>
            <Link to={`/category/${category.slug}`}>{category.name}</Link>
          </>
        )}
        <span>/</span>
        <span aria-current="page">{title}</span>
      </nav>

      <div className="pdp__main">
        <Gallery images={images} title={title} />

        <section className="pdp__info">
          <div className="pdp__title-row">
            <h1>{title}</h1>
            <button
              type="button"
              className={`pdp__fav${fav.has(product._id) ? " is-on" : ""}`}
              onClick={() => fav.toggle(product)}
              aria-pressed={fav.has(product._id)}
              aria-label={fav.has(product._id) ? "Remove from favourites" : "Save to favourites"}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M12 20.5s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.6c0 5.7-7.5 10.3-7.5 10.3z" />
              </svg>
            </button>
          </div>
          {(quality || material) && <p className="pdp__quality">{[quality, material].filter(Boolean).join("; ")}</p>}
          <div className="pdp__price">{inr(price)}</div>

          {colourways.length > 1 && (
            <div className="pdp__colourways">
              <div className="eyebrow">
                {colourways.length} colourways{color ? ` · ${color}` : ""}
              </div>
              <div className="pdp__swatches">
                {colourways.map((p) => (
                  <Link
                    key={p._id}
                    to={`/product/${p.slug}`}
                    className={p._id === product._id ? "is-on" : ""}
                    title={[p.title, p.color].filter(Boolean).join(" · ")}
                    aria-current={p._id === product._id ? "true" : undefined}
                  >
                    <img src={(p.images && p.images[0] && p.images[0].url) || fallbackImg} alt={p.title} loading="lazy" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="pdp__actions">
            {out ? (
              <NotifyForm product={product} />
            ) : (
              <button type="button" className="buybox__cta" onClick={() => addToCart(dispatch, product)}>
                Add to bag
              </button>
            )}
            {category?.slug !== "tassle" && (
              <QuantityCalculator
                product={product}
                onAdd={(count) => {
                  addToCart(dispatch, product, count);
                  toast.success(`${count} ${category?.slug === "wallpaper" ? "rolls" : "m"} of ${title} in your bag.`);
                }}
              />
            )}
            <div className="pdp__actions-row">
              {inBasket ? (
                <Link className="ink-btn ink-btn--ghost" to="/samples">
                  Sample added · view ({sampleBasket.length})
                </Link>
              ) : (
                <button type="button" className="ink-btn ink-btn--ghost" onClick={addSample}>
                  Request a free sample
                </button>
              )}
              <button type="button" className="ink-btn ink-btn--ghost" onClick={() => setEnquire(true)}>
                Enquire
              </button>
            </div>
            <p className="pdp__help">
              <a href={whatsapp(`Hello, I'm interested in ${title}: ${link}`)} target="_blank" rel="noopener noreferrer" className="pdp__wa">
                WhatsApp us
              </a>{" "}
              · call <a href="tel:+917777045811">7777045811</a> · <Link to="/contact#visit">book a showroom visit</Link>
            </p>
          </div>
          <Dialog open={enquire} onClose={() => setEnquire(false)} title={`Enquire about ${title}`}>
            <EnquiryForm product={product} onDone={() => setEnquire(false)} />
          </Dialog>

          <details className="pdp__data" open>
            <summary>Data</summary>
            <dl>
              {spec.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </details>
          {description && (
            <details className="pdp__data">
              <summary>Description</summary>
              <p>{description}</p>
            </details>
          )}
          <p className="pdp__note">
            Product images are for illustration. We take care to show colours faithfully, but screens vary; ask for a
            sample before ordering.
          </p>
        </section>
      </div>

      {look.length > 0 && (
        <section className="pdp__related">
          <h2 className="section-title">Complete the look</h2>
          <ProductRail items={look} label="Complete the look" />
        </section>
      )}

      {related.length > 0 && (
        <section className="pdp__related">
          <h2 className="section-title">You might also like</h2>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {recentOthers.length > 0 && (
        <section className="pdp__related">
          <h2 className="section-title">Recently viewed</h2>
          <ProductRail items={recentOthers} label="Recently viewed" />
        </section>
      )}
    </div>
  );
};

export default Product;
