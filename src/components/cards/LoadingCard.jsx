import React from "react";

/*
 * Placeholder grid shaped exactly like the product cards, so the page keeps
 * its height (and the footer stays put) while products load.
 */
const LoadingCard = ({ count = 8, title = false }) => (
  <div className="skeleton-block" aria-busy="true" aria-label="Loading products">
    {title && <div className="skeleton skeleton--title" />}
    <div className="product-grid">
      {Array.from({ length: count }, (_, i) => (
        <div className="pcard" key={i} aria-hidden="true">
          <div className="pcard__media skeleton" />
          <div className="pcard__body">
            <div className="pcard__row">
              <div className="skeleton skeleton--line" style={{ width: "58%" }} />
              <div className="skeleton skeleton--line" style={{ width: "18%" }} />
            </div>
            <div className="skeleton skeleton--line" style={{ width: "30%", marginTop: 10 }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default LoadingCard;
