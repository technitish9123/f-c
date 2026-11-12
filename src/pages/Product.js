import React, { useEffect, useState } from "react";
import {
  getProduct,
  productStar,
  getRelatedProduct,
} from "../functions/product";
import SingleProduct from "../components/cards/SingleProduct";
import { useSelector } from "react-redux";
import LoadingCard from "../components/cards/LoadingCard";
import ProductCard from "../components/cards/ProductCard";

const Product = ({ match }) => {
  const [product, setProduct] = useState({});
  const [rating, setRating] = useState(0);
  const [relatedProduct, setRelatedProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const { slug } = match.params;

  const { user } = useSelector((state) => ({ ...state }));

  useEffect(() => {
    loadProduct();
  }, [slug]);

  useEffect(() => {
    if (product.ratings && user) {
      let existingRatingObject = product.ratings.find(
        (ele) => ele.postedBy.toString() === user._id.toString()
      );

      existingRatingObject && setRating(existingRatingObject.star); // current logged in user's star rating on the product
    }
  });

  const loadProduct = () => {
    setLoading(true);
    getProduct(slug).then((res) => {
      setProduct(res.data);
      getRelatedProduct(res.data._id).then((res) => {
        setLoading(false);
        setRelatedProduct(res.data);
      });
    });
  };

  const onStarClick = (newRating, name) => {
    setRating(newRating);
    productStar(name, newRating, user.token).then((res) => {
      loadProduct();
    });
  };

  return (
    <div className="container page-product">
      <div className="row pt-4">
        <SingleProduct
          product={product}
          rating={rating}
          onStarClick={onStarClick}
        />
      </div>
      <h4 className="section-title">Related Products</h4>
      <div className="pb-5">
        <div>
          {loading ? (
            <LoadingCard count={3} />
          ) : (
            <div className="row product-grid">
              {relatedProduct.length ? (
                relatedProduct.map((p) => (
                  <div className="col-md-4" key={p._id}>
                    <ProductCard product={p} />
                  </div>
                ))
              ) : (
                <div className="text-center col">
                  No Related Products Found{" "}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
