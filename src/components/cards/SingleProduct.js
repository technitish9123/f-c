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
import StarRating from "react-star-ratings";
import RatingModal from "../modal/RatingModal";
import { showAverage } from "../../functions/rating";
import lodash from "lodash";
import { useSelector, useDispatch } from "react-redux";
import { addItemToWishlist } from "../../functions/user";
import { useHistory } from "react-router-dom";
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
      <div className="col-md-7 display-1">
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
        <h2 className=" p-3  ">{title}</h2>

        {/*rating */}
        {product && product.ratings && product.ratings.length > 0 ? (
          showAverage(product)
        ) : (
          <div className="text-center pt-1 pb-3">No Rating Yet.</div>
        )}

        <Card
          actions={[
            <Tooltip title={tooltip}>
              <a onClick={() => handleAddToCart()}>
                <ShoppingCartOutlined className="text-primary" /> <br />{" "}
                {product.quantity === 0 ? (
                  <div className="text-danger">Out Of Stock</div>
                ) : (
                  "Add to Cart"
                )}
              </a>
            </Tooltip>,
            <Tooltip title={wishlistTooltip}>
              <div onClick={handleWishlist}>
                <HeartOutlined className="text-success" /> <br /> Add to
                Wishlist
              </div>
            </Tooltip>,
            <RatingModal>
              <StarRating
                name={_id}
                numberOfStars={5}
                rating={rating}
                changeRating={onStarClick}
                isSelectable={true}
                starRatedColor="red"
              />
            </RatingModal>,
          ]}
        >
          <ProductListItems product={product} />
        </Card>
      </div>
    </>
  );
};

export default SingleProduct;
