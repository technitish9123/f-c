import React, { useState, useEffect } from "react";
import LoadingCard from "../../components/cards/LoadingCard";
import ProductCard from "../../components/cards/ProductCard";
import { getSub } from "../../functions/sub";
import { Spin } from "antd";

const SubHome = ({ match }) => {
  const [sub, setSub] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { slug } = match.params;

  useEffect(() => {
    getSub(slug).then((res) => {
      setSub(res.data.sub);
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
              {products.length} Products in "{sub.name}" Sub Category
            </h4>
          )}
        </div>
      </div>
      <div className="row product-grid">
        {products.map((p) => (
          <div className="col-md-4" key={p._id}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubHome;
