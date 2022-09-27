import React from "react";

import Jumbotron from "../components/cards/Jumbotron";
import RazorpayCheckout from "../components/cards/RazorpayCheckout";
import CategoryList from "../components/category/CategoryList";
import BestSellers from "../components/home/BestSellers";
import NewArrivals from "../components/home/NewArrivals";
import Announcement from "../components/homeComponents/Announcement";
import Background from "../components/homeComponents/background";
import Slider from "../components/homeComponents/Slider";

const Home = () => {
  return (
    <>
    <Background />
     <Slider />
      <h4 className="text-center p-3 mt-5 mb-5 display-4 jumbotron text-danger">
        New Arrivals
      </h4>
      <NewArrivals />
     
      <br />
      <h4 className="text-center p-3 mt-5 mb-5 display-4 jumbotron text-danger">
        Best Sellers
      </h4>
      <BestSellers />
      <h4 className="text-center p-3 mt-5 mb-5 display-4 jumbotron text-danger">
        Categories
      </h4>
      <CategoryList />
      
      <br />
    </>
  );
};

export default Home;
