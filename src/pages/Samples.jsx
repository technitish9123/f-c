import React, { useState } from "react";
import { Link } from "react-router-dom";
import { samples, SAMPLE_LIMIT } from "../functions/localList";
import { SampleForm } from "../components/product/LeadForms";

// The sample basket: up to five free swatches, sent by post.
const Samples = () => {
  const items = samples.use();
  const [sent, setSent] = useState(false);

  return (
    <div className="bag samples">
      <header className="bag__head">
        <div className="eyebrow">Free samples</div>
        <h1>Your sample request</h1>
        <p className="samples__intro">
          See and feel the fabric before you order. Choose up to {SAMPLE_LIMIT} swatches; we post them free within India.
        </p>
      </header>

      {!items.length && !sent ? (
        <div className="samples__empty">
          <p>No samples chosen yet. Open any product and choose “Request a free sample”.</p>
          <div className="bag__empty-links">
            <Link to="/category/fabrics" className="ink-btn">Fabrics</Link>
            <Link to="/category/wallpaper" className="ink-btn ink-btn--ghost">Wallpaper</Link>
          </div>
        </div>
      ) : (
        <div className="bag__body">
          <div>
            <ul className="bag__lines">
              {items.map((p) => (
                <li key={p._id} className="bag-line">
                  <Link to={`/product/${p.slug}`} className="bag-line__media">
                    {p.images?.[0] && <img src={p.images[0].url} alt="" loading="lazy" />}
                  </Link>
                  <div className="bag-line__info">
                    <Link to={`/product/${p.slug}`} className="bag-line__title">{p.title}</Link>
                    <div className="bag-line__meta">{[p.category?.name, p.color].filter(Boolean).join(" · ")}</div>
                    {!sent && (
                      <div className="bag-line__controls">
                        <button type="button" className="text-link" onClick={() => samples.remove(p._id)}>Remove</button>
                      </div>
                    )}
                  </div>
                  <div className="bag-line__total samples__free">Free</div>
                </li>
              ))}
            </ul>
            {!sent && items.length < SAMPLE_LIMIT && (
              <Link to="/shop" className="link-line samples__more">Add more ({SAMPLE_LIMIT - items.length} left)</Link>
            )}
          </div>
          <aside className="bag__summary" aria-label="Where to send them">
            <div className="eyebrow">Where should we send them?</div>
            <SampleForm items={items} onDone={() => { setSent(true); samples.clear(); }} />
          </aside>
        </div>
      )}
    </div>
  );
};

export default Samples;
