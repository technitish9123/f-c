import React from "react";
import logo from "../assets/images/firstimp.png"
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

const LeftNav = () => {
  return (
    <div className="leftnav">
      <img src={logo} alt="logo" height="50" width="50" className="logoimg" />
      <p className="logo">First Impression</p>
      <Link to="/products/Fabric" className="leftnav-item">
        Fabrics
      </Link>
      <Link to="/products/Wallpaper" className="leftnav-item">
        Wallpapers
      </Link>
      <Link to="/products/Sheer" className="leftnav-item">
        Sheers
      </Link>
      <Link to="/products/Tassle" className="leftnav-item">
        Tassels
      </Link>
      <Link to="/products/Madeup" className="leftnav-item">
        Madeups
      </Link>
      {/* <a to="/" className="leftnav-item">
        Fabric Estimator
      </a> */}
      <Link to="/moodboard" className="leftnav-item">
        Mood Boards
      </Link>
      <Link to="/contact" className="leftnav-item">
        Contact
      </Link>
      <span className="social">
        <Link to="/">
          <FaFacebook className="social-icon" />
        </Link>
        <Link to="/">
          <FaInstagram className="social-icon" />
        </Link>
        {/* <Link to="/">
          <FaTwitter className="social-icon" />
        </Link> */}
      </span>
    </div>
  );
};

export default LeftNav;
