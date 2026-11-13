import React, { memo } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../functions/cart";
import { useFavourites } from "../../functions/useFavourites";
import fallbackImg from "../../images/laptop.png";

const HEART = "M12 20.5s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.6c0 5.7-7.5 10.3-7.5 10.3z";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const fav = useFavourites();
  const { _id, images = [], slug, title, price } = product;
  const out = product.quantity === 0;
  const onRequest = product.priceOnRequest || !(price > 0);
  const saved = fav.has(_id);
  const colours = product.colours || (product.variants && product.variants.length) || 0;

  return (
    <div className="pcard">
      <Link to={`/product/${slug}`} className="pcard__media">
        <img src={images[0] ? images[0].url : fallbackImg} alt={title} loading="lazy" />
        {images[1] && <img className="pcard__alt" src={images[1].url} alt="" loading="lazy" />}
        {out && <span className="pcard__badge">Sold out</span>}
      </Link>
      <button
        type="button"
        className={`pcard__fav${saved ? " is-on" : ""}`}
        onClick={() => fav.toggle(product)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${title} from favourites` : `Save ${title} to favourites`}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d={HEART} />
        </svg>
      </button>
      <div className="pcard__body">
        <div className="pcard__row">
          <Link to={`/product/${slug}`} className="pcard__title">
            {title}
          </Link>
          <span className="pcard__price">{onRequest ? "On request" : `₹${Number(price).toLocaleString("en-IN")}`}</span>
        </div>
        {colours > 1 && <div className="pcard__colours">{colours} colours</div>}
        {onRequest ? (
          <Link to={`/product/${slug}`} className="pcard__btn">View &amp; enquire</Link>
        ) : colours ? (
          <Link to={`/product/${slug}`} className="pcard__btn">Choose colour</Link>
        ) : (
          <button className="pcard__btn" disabled={out} onClick={() => addToCart(dispatch, product)}>
            {out ? "Sold out" : "Add to bag"}
          </button>
        )}
      </div>
    </div>
  );
};

// Grids re-render often (filters, favourites); skip cards whose product didn't change.
export default memo(ProductCard);
