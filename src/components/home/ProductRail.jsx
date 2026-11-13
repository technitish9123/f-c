import React, { useEffect, useRef, useState } from "react";
import { getCatalogue } from "../../functions/catalogue";
import ProductCard from "../cards/ProductCard";
import LoadingCard from "../cards/LoadingCard";

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
const byBestSelling = (a, b) => (b.sold || 0) - (a.sold || 0) || byNewest(b, a);
export const RAIL_SORTS = { newest: byNewest, bestselling: byBestSelling };

/*
 * A horizontally scrolling row of products (scroll-snap, swipe on touch,
 * arrow buttons on desktop). Uses the shared catalogue: no extra requests.
 */
const ProductRail = ({ sort = "newest", limit = 12, label, items }) => {
  const [loaded, setProducts] = useState(null);
  const products = items || loaded;
  const [edges, setEdges] = useState({ start: true, end: false });
  const track = useRef(null);

  useEffect(() => {
    if (items) return undefined; // a ready list was passed in
    let current = true;
    getCatalogue()
      .then((list) => current && setProducts([...list].sort(RAIL_SORTS[sort]).slice(0, limit)))
      .catch(() => current && setProducts([]));
    return () => {
      current = false;
    };
  }, [sort, limit, items]);

  const updateEdges = () => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };
  useEffect(updateEdges, [products]);

  const scroll = (dir) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  if (!products) return <LoadingCard count={4} />;
  if (!products.length) return null;

  return (
    <div className="rail">
      <div className="rail__track" ref={track} onScroll={updateEdges} role="region" aria-label={label} tabIndex={0}>
        {products.map((p) => (
          <div className="rail__item" key={p._id}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <div className="rail__controls">
        <button type="button" onClick={() => scroll(-1)} disabled={edges.start} aria-label="Previous">
          ‹
        </button>
        <button type="button" onClick={() => scroll(1)} disabled={edges.end} aria-label="Next">
          ›
        </button>
      </div>
    </div>
  );
};

export default ProductRail;
