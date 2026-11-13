import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../functions/category";
import tileA from "../assets/images/s6.jpg";
import tileB from "../assets/images/s7.jpg";
import tileC from "../assets/images/s1.jpg";

const TILES = [tileA, tileB, tileC];

// Home page category mosaic.
const CategoryList = () => {
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    let current = true;
    getCategories()
      .then((res) => current && setCategories(res.data || []))
      .catch(() => current && setCategories([]));
    return () => {
      current = false;
    };
  }, []);

  if (!categories) return <div className="mosaic mosaic--loading skeleton" aria-busy="true" />;

  return (
    <div className="mosaic">
      {categories.map((c, i) => (
        <Link to={`/category/${c.slug}`} className="mosaic__tile reveal" key={c._id}>
          <img src={TILES[i % TILES.length]} alt="" loading="lazy" />
          <div className="mosaic__label">
            <span>Shop now</span>
            <strong>{c.name}</strong>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CategoryList;
