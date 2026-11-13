import React, { useEffect, useState } from "react";
import { getCategory } from "../../functions/category";
import LoadingCard from "../../components/cards/LoadingCard";
import ProductCard from "../../components/cards/ProductCard";
import { Spin } from "antd";

const CategoryHome = ({ match }) => {
  const [category, setCategory] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { slug } = match.params;

  useEffect(() => {
    setLoading(true);
    getCategory(slug).then((res) => {
      setCategory(res.data.category);
      setProducts(res.data.products);
      setLoading(false);
    });
  }, []);
  return (
    <div className="container">
      <div className="row">
        <div className="col">
          {loading ? (
            <LoadingCard count={8} title />
          ) : (
            <h4 className="section-title">
              {products.length} Products in "{category.name}" Category
            </h4>
          )}
          <div className="row product-grid">
            {products &&
              products.map((p) => (
                <div className="col-md-4" key={p._id}>
                  <ProductCard product={p} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryHome;
