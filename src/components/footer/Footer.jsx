import React from "react";
import { Link } from "react-router-dom";
import WeaveMark from "../brand/WeaveMark";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <WeaveMark size={44} threads={5} className="site-footer__mark" />
            First Impression
            <br />
            Furnishing LLP
            <small>Curtains · Upholstery · Wallcoverings</small>
          </div>
          <div>
            <h5>Explore</h5>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Collection</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/terms-and-condition">Terms and Conditions</Link></li>
            </ul>
          </div>
          <div>
            <h5>Client Services</h5>
            <ul>
              <li><Link to="/user/history">My Account</Link></li>
              <li><Link to="/user/history">Tracking</Link></li>
              <li><Link to="/user/wishlist">Favourites</Link></li>
              <li><Link to="/cart">Order</Link></li>
            </ul>
          </div>
          <div>
            <h5>Showroom</h5>
            <address>
              First Impression 8-11, Om Chambers,
              <br />
              Ground floor, Kemps Corner,
              <br />
              Mumbai - 400036
              <br />
              <br />
              <a href="tel:7777045811">7777045811</a>,{" "}
              <a href="tel:+912266642030">+91-22-66642030</a>,{" "}
              <a href="tel:+912266642031">+91-22-66642031</a>
              <br />
              <a href="mailto:meher@firstimp.in">meher@firstimp.in</a>
              <br />
              <a href="mailto:firstimp777@gmail.com">firstimp777@gmail.com</a>
            </address>
          </div>
        </div>
        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} First Impression Furnishing LLP</span>
          <WeaveMark size={240} threads={7} className="site-footer__watermark" />
          <img src="https://i.ibb.co/Qfvn4z6/payment.png" alt="Accepted payment methods" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
