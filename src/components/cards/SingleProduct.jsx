import React, { useState } from "react";
import { Card, Tabs, Tooltip, Button } from "antd";
import { Link } from "react-router-dom";
import {
  HeartOutlined,
  ShoppingCartOutlined,
  StarOutlined,
} from "@ant-design/icons";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import laptop from "../../images/laptop.png";
import ProductListItems from "./ProductListItems";
import StarRating from "../forms/StarRatings";
import RatingModal from "../modal/RatingModal";
import { showAverage } from "../../functions/rating";
import lodash from "lodash";
import { useSelector, useDispatch } from "react-redux";
import { addItemToWishlist } from "../../functions/user";
import { useLegacyHistory as useHistory } from "../routes/legacy";
import { toast } from "react-toastify";
import "./singleProduct.css";

const { Meta } = Card;
const { TabPane } = Tabs;

const SingleProduct = ({ product, rating, onStarClick }) => {
  const {
    title,
    description,
    slug,
    images,
    _id,
    brand,
    width,
    material,
    application,
    design,
    style,
    instruction,
  } = product;

  const [tooltip, setTooltip] = useState("");
  const [wishlistTooltip, setWishlistTooltip] = useState("Add to Wishlist");
  const { user, cart } = useSelector((state) => ({ ...state }));
  const dispatch = useDispatch();
  const history = useHistory();

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
    }
    setTooltip("Added");
  };

  const handleWishlist = () => {
    addItemToWishlist(_id, user.token).then((res) => {
      if (res.data.ok) {
        setTooltip("Added");
        toast.success("Item Added to Wishlist");
        history.push("/user/wishlist");
      }
    });
  };

  return (
    <>
      <div className="col-md-7 pd-gallery">
        {images && images.length ? (
          <Carousel infiniteLoop autoPlay showArrows={true}>
            {images && images.map((i) => <img src={i.url} key={i.public_id} />)}
          </Carousel>
        ) : (
          <Card
            cover={
              <img
                src={images && images.length > 0 ? images[0].url : laptop}
                style={{ height: "450px", objectFit: "cover" }}
                className="p-3"
              />
            }
          />
        )}

        <Tabs type="card">
          <TabPane tab="Specification" key="1">
            <div className="specification">
              <span className="specification_title"> Width:</span>
              {width} cm
              <br />
              <span className="specification_title"> Brand: </span>
              {brand} <br />
              <span className="specification_title"> Fabric Content:</span>
              {material} <br />
              <span className="specification_title"> Application:</span>
              {application} <br />
              <span className="specification_title"> Design:</span>
              {design} <br />
              <span className="specification_title"> Style:</span>
              {style} <br />
              <span className="specification_title"> Instruction:</span>
              {instruction} <br />
            </div>
          </TabPane>
          <TabPane tab="Description" key="2">
            {description && description}
          </TabPane>
          <TabPane tab="More" key="3">
            Call Us on xxx999xx for more updates on the product
          </TabPane>
        </Tabs>
      </div>
      <div className="col-md-5">
        <div className="buybox">
          {product.category && (
            <div className="eyebrow">{product.category.name}</div>
          )}
          <h1 className="buybox__title">{title}</h1>
          {product && product.ratings && product.ratings.length > 0 ? (
            showAverage(product)
          ) : (
            <div className="buybox__muted">No ratings yet</div>
          )}
          <div className="buybox__price">₹{product.price}</div>
          {product.quantity === 0 && (
            <span className="pcard__badge buybox__stock">Sold out</span>
          )}
          <Tooltip title={tooltip}>
            <button
              className="buybox__cta"
              disabled={product.quantity === 0}
              onClick={() => handleAddToCart()}
            >
              {product.quantity === 0 ? "Sold out" : "Add to bag"}
            </button>
          </Tooltip>
          <div className="buybox__row">
            <Tooltip title={wishlistTooltip}>
              <button className="buybox__ghost" onClick={handleWishlist}>
                Add to wishlist
              </button>
            </Tooltip>
            <div className="buybox__ghost buybox__rate">
              <RatingModal>
                <StarRating
                  name={_id}
                  numberOfStars={5}
                  rating={rating}
                  changeRating={onStarClick}
                  isSelectable={true}
                  starRatedColor="#1c1b19"
                />
              </RatingModal>
            </div>
          </div>
          <div className="buybox__details">
            <ProductListItems product={product} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleProduct;
