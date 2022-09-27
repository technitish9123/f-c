import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../functions/category";
import { Spin } from "antd";
import styled from "styled-components";
import { mobile } from "../../responsive";


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

  const showCategories = () =>
    categories.map((c) => (
      <ContainerSub key={c._id}>
        <Link to={`category/${c.slug}`}>
        {/* <Image src="https://mp.jab.de/share/7e1ae4cc-eb2a-4c9a-babc-9f57921f82d5/api/modules/file/objects/d9acd625-55cb-4dc7-b29e-41ac4ef681de/media/medium?index=0&t=1640014446557" /> */}
        <Info> 
        <Title  key={c._id}>{c.name}</Title>
        <Button>SHOP NOW</Button>
        </Info>
          {/* <div
            className="btn btn-outlined-primary btn-lg btn-block btn-raised m-4 text-primary"
            key={c._id}
          >
            {c.name}
          </div> */}
        
        </Link>
      </ContainerSub>
        
      
    ));
  return (
    <Container>
      
        {loading ? <Spin className="text-center" /> : showCategories()}
     
      </Container>
  );
};

export default CategoryList;
