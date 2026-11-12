import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../functions/category";
import { Spin } from "antd";
import styled from "styled-components";
import tileA from "../assets/images/s6.jpg";
import tileB from "../assets/images/s7.jpg";
import tileC from "../assets/images/s1.jpg";


const Container = styled.div`
  display: flex;
  padding: 20px;
  justify-content: space-between;
  flex-wrap: wrap;
  @media (max-width: 620px) {
    padding: 0px;
    flex-direction: column;
  }
  
  
`;
const ContainerSub = styled.div`
  flex: 1;
  margin: 3px;
  height: 70vh;
  position: relative;
  flex-wrap: wrap;
  background:#dbe4d4 ;
`;


const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  

`;

const Info = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
    color: #1a1c1d;
    margin-bottom: 20px;
`;

const Button = styled.button`
    border:none;
    padding: 10px;
    background-color: white;
    color:gray;
    cursor: pointer;
    font-weight: 600;
`;


const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCategories().then((c) => {
      setCategories(c.data);
      setLoading(false);
    });
    return () => getCategories();
  }, []);

  const tileImages = [tileA, tileB, tileC];

  return loading ? (
    <div style={{ textAlign: "center", padding: 48 }}>
      <Spin />
    </div>
  ) : (
    <div className="mosaic">
      {categories.map((c, i) => (
        <Link
          to={`/category/${c.slug}`}
          className="mosaic__tile reveal"
          key={c._id}
        >
          <img src={tileImages[i % tileImages.length]} alt="" loading="lazy" />
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
