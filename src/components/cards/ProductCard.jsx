import React, { useState } from "react";
import { Tooltip } from "antd";
import { Link } from "react-router-dom";
import laptop from "../../images/laptop.png";
import { showAverage } from "../../functions/rating";
import lodash from "lodash";
import { useSelector, useDispatch } from "react-redux";
import { useFavourites } from "../../functions/useFavourites";

const ProductCard = ({ product }) => {
  const [tooltip, setTooltip] = useState("Click To Add");
  const { user, cart } = useSelector((state) => ({ ...state }));
  const dispatch = useDispatch();
  const fav = useFavourites();

  const handleAddToCart = () => {
    //check whether the window for saving the product in local storage exists
    let cart = [];

    if (typeof window !== undefined) {
      //getting if any previous item exists in local storage
      if (localStorage.getItem("cart")) {
        cart = JSON.parse(localStorage.getItem("cart"));
      }
      // spreading the product and adding a default value count
      cart.push({
        ...product,
        count: 1,
      });

      //removing duplicates using lodash
      let uniqueCartArray = lodash.uniqWith(cart, lodash.isEqualWith);

      localStorage.setItem("cart", JSON.stringify(uniqueCartArray));

      //dispatch to the redux store
      dispatch({
        type: "ADD_TO_CART",
        payload: uniqueCartArray,
      });
      setTooltip("Added");
    }
    // when item added to cart the drawer state should be true to be shown
    dispatch({
      type: "DRAWER_VISIBILITY",
      payload: true,
    });
  };

  const { images, slug, title, price } = product;
  const out = product.quantity === 0;
  return (
    <div className="pcard" style={{ position: "relative" }}>
      <Link to={`/product/${slug}`} className="pcard__media">
        <img
          src={images && images.length > 0 ? images[0].url : laptop}
          alt={title}
          loading="lazy"
        />
        {images && images.length > 1 && (
          <img className="pcard__alt" src={images[1].url} alt="" loading="lazy" />
        )}
        {out && <span className="pcard__badge">Sold out</span>}
      </Link>
      <button
        type="button"
        className={`pcard__fav${fav.has(product._id) ? " is-on" : ""}`}
        onClick={() => fav.toggle(product)}
        aria-pressed={fav.has(product._id)}
        aria-label={fav.has(product._id) ? `Remove ${title} from favourites` : `Save ${title} to favourites`}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M12 20.5s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.6c0 5.7-7.5 10.3-7.5 10.3z" />
        </svg>
      </button>
      <div className="pcard__body">
        <div className="pcard__row">
          <Link to={`/product/${slug}`} className="pcard__title">
            {title}
          </Link>
          <span className="pcard__price">₹{price}</span>
        </div>
        <Tooltip title={tooltip}>
          <button
            className="pcard__btn"
            disabled={out}
            onClick={() => handleAddToCart()}
          >
            {out ? "Sold out" : "Add to bag"}
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ProductCard;
