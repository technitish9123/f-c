import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getProduct } from "../functions/product";
import { getMore } from "../functions/catalogue";
import { samples, recentlyViewed, SAMPLE_LIMIT } from "../functions/localList";
import QuantityCalculator from "../components/product/QuantityCalculator";
import { EnquiryForm, NotifyForm } from "../components/product/LeadForms";
import Dialog from "../components/ui/Dialog";
import ProductRail from "../components/home/ProductRail";
import { toast } from "react-toastify";
import { addToCart, colourLabel } from "../functions/cart";
import { useFavourites } from "../functions/useFavourites";
import ProductCard from "../components/cards/ProductCard";
import LoadingCard from "../components/cards/LoadingCard";
import fallbackImg from "../images/laptop.png";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const WHATSAPP = "917777045811";
const whatsapp = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;


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
  const [allColours, setAllColours] = useState(false);
  const [product, setProduct] = useState(null);
  const [more, setMore] = useState({ colourways: [], related: [], look: [] });
  const [missing, setMissing] = useState(false);
  const [params, setParams] = useSearchParams();

  // Products with colour options: the chosen colour lives in the URL (?colour=CODE),
  // so a link or a refresh keeps it. The first colour is shown by default.
  const variants = (product && product.variants) || [];
  const chosen = variants.find((v) => v.code === params.get("colour")) || variants[0] || null;
  const pick = (v) => setParams((prev) => { const next = new URLSearchParams(prev); next.set("colour", v.code); return next; }, { replace: true });
  const galleryImages = useMemo(() => {
    const own = (product && product.images) || [];
    return chosen && chosen.image ? [{ url: chosen.image }, ...own.filter((i) => i.url !== chosen.image)] : own;
  }, [product, chosen]);

  // Start from the card the visitor clicked (if we have it), then load the full record.
  useEffect(() => {
    let current = true;
    setMissing(false);
    setAllColours(false);
    window.scrollTo(0, 0);
    setProduct((p) => (p && p.slug === slug ? p : null));
    getProduct(slug)
      .then((res) => current && (res.data ? setProduct(res.data) : setMissing(true)))
      .catch(() => current && setMissing(true));
    getMore(slug)
      .then((m) => current && setMore(m))
      .catch(() => current && setMore({ colourways: [], related: [], look: [] }));
    return () => {
      current = false;
    };
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

  const { colourways, related, look } = more;
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
  const out = chosen ? chosen.quantity === 0 : quantity === 0;
  // What enquiries, samples and alerts refer to: the product in the chosen colour.
  const shown = chosen ? { ...product, color: colourLabel(chosen), sku: chosen.code, variant: chosen.code, images: galleryImages } : product;
  // Imported articles can be "price on request" until a price list is loaded.
  const onRequest = product.priceOnRequest || !(price > 0);
  const quality = [category && category.name, style, design].filter(Boolean).join(", ");
  const link = `https://firstimp.in/product/${product.slug}`;
  const inBasket = sampleBasket.some((p) => p._id === String(product._id) && (p.variant || null) === (chosen ? chosen.code : null));
  const addSample = () => {
    if (!samples.add(shown)) {
      toast.info(`You can request up to ${SAMPLE_LIMIT} samples at a time.`);
      return;
    }
    toast.success(`Sample of ${title}${chosen ? ` (${colourLabel(chosen)})` : ""} added. Request it from your sample list.`);
  };

  const spec = [
    ["Article", title],
    ["Brand", brand],
    ["Colour", chosen ? colourLabel(chosen) : color],
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
        <Gallery images={galleryImages} title={chosen ? `${title}, ${chosen.colour || chosen.code}` : title} />

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
          <div className="pdp__price">{onRequest ? "Price on request" : inr(price)}</div>
          {chosen ? (
            <div className="pdp__sku">Article {chosen.code}</div>
          ) : (
            product.sku && <div className="pdp__sku">Article {product.sku}</div>
          )}

          {variants.length > 0 && (
            <div className="pdp__colourways">
              <div className="eyebrow">
                {variants.length} {variants.length === 1 ? "colour" : "colours"} · {chosen.colour || chosen.code}
              </div>
              <div className="pdp__swatches" role="radiogroup" aria-label="Colour">
                {(allColours ? variants : variants.slice(0, 24)).map((v) => (
                  <button
                    key={v.code}
                    type="button"
                    role="radio"
                    aria-checked={v === chosen}
                    className={v === chosen ? "is-on" : ""}
                    title={colourLabel(v)}
                    onClick={() => pick(v)}
                  >
                    <img src={v.image || (images[0] && images[0].url) || fallbackImg} alt={colourLabel(v)} loading="lazy" />
                    {v.quantity === 0 && <span className="pdp__swatch-out" aria-hidden="true" />}
                  </button>
                ))}
              </div>
              {variants.length > 24 && (
                <button type="button" className="text-link pdp__all-colours" onClick={() => setAllColours((v) => !v)}>
                  {allColours ? "Show fewer" : `Show all ${variants.length} colours`}
                </button>
              )}
            </div>
          )}

          {!variants.length && colourways.length > 1 && (
            <div className="pdp__colourways">
              <div className="eyebrow">
                {colourways.length} colourways{color ? ` · ${color}` : ""}
              </div>
              <div className="pdp__swatches">
                {(allColours ? colourways : colourways.slice(0, 24)).map((p) => (
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
              {colourways.length > 24 && (
                <button type="button" className="text-link pdp__all-colours" onClick={() => setAllColours((v) => !v)}>
                  {allColours ? "Show fewer" : `Show all ${colourways.length} colours`}
                </button>
              )}
            </div>
          )}

          <div className="pdp__actions">
            {onRequest ? (
              <button type="button" className="buybox__cta" onClick={() => setEnquire(true)}>
                Ask for a price
              </button>
            ) : out ? (
              <NotifyForm product={shown} />
            ) : (
              <button type="button" className="buybox__cta" onClick={() => addToCart(dispatch, product, undefined, chosen)}>
                Add to bag
              </button>
            )}
            {category?.slug !== "tassle" && !onRequest && (
              <QuantityCalculator
                product={product}
                onAdd={(count) => {
                  addToCart(dispatch, product, count, chosen);
                  toast.success(`${count} ${category?.slug === "wallpaper" ? "rolls" : "m"} of ${title}${chosen ? ` (${chosen.colour || chosen.code})` : ""} in your bag.`);
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
              <a href={whatsapp(`Hello, I'm interested in ${title}${chosen ? ` (${colourLabel(chosen)})` : ""}: ${link}${chosen ? `?colour=${encodeURIComponent(chosen.code)}` : ""}`)} target="_blank" rel="noopener noreferrer" className="pdp__wa">
                WhatsApp us
              </a>{" "}
              · call <a href="tel:+917777045811">7777045811</a> · <Link to="/contact#visit">book a showroom visit</Link>
            </p>
          </div>
          <Dialog open={enquire} onClose={() => setEnquire(false)} title={`Enquire about ${title}`}>
            <EnquiryForm product={shown} onDone={() => setEnquire(false)} />
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
