import React, { useState } from "react";
import { Badge, Dropdown, Menu } from "antd";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import firebase from "firebase";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Search from "../forms/Search";
import "./nav.css";
import logo from "../assets/images/firstimp.png";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  let dispatch = useDispatch();
  let { user, cart } = useSelector((state) => ({ ...state }));

  let history = useHistory();

  const logout = () => {
    firebase.auth().signOut();
    dispatch({
      type: "LOGOUT",
      payload: null,
    });
    history.push("/login");
  };

  const dashboard =
    user && (user.role === "admin" ? "/admin/dashboard" : "/user/history");

  const userMenu = (
    <Menu>
      {dashboard && (
        <Menu.Item key="dash">
          <Link to={dashboard}>Account</Link>
        </Menu.Item>
      )}
      <Menu.Item key="wish">
        <Link to="/user/wishlist">Wishlist</Link>
      </Menu.Item>
      <Menu.Item key="logout" onClick={logout}>
        Sign out
      </Menu.Item>
    </Menu>
  );

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <nav className="site-header__nav">
          <Link to="/shop">Collection</Link>
          <Link to="/category/fabrics">Fabrics</Link>
          <Link to="/category/wallpaper">Wallpaper</Link>
          <Link to="/contact">Showroom</Link>
        </nav>

        <button
          className="site-header__burger"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
          style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}
        >
          {open ? <CloseOutlined /> : <MenuOutlined />}
        </button>

        <Link to="/" className="site-header__logo" onClick={close}>
          <img src={logo} alt="" />
          <span>First Impression</span>
          <small>Furnishing · Mumbai</small>
        </Link>

        <div className="site-header__icons">
          <button
            className="u"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen(!searchOpen)}
          >
            Search
          </button>
          {user ? (
            <Dropdown overlay={userMenu} trigger={["click"]}>
              <button className="u site-header__hide-m">Account</button>
            </Dropdown>
          ) : (
            <Link to="/login" className="u site-header__hide-m">
              Sign in
            </Link>
          )}
          <Link to="/cart" className="u" onClick={close}>
            Bag{" "}
            <Badge
              count={cart.length}
              showZero={false}
              size="small"
              offset={[4, -2]}
            />
          </Link>
        </div>
      </div>

      <div className={`site-header__searchbar ${searchOpen ? "open" : ""}`}>
        <div>
          <Search />
        </div>
      </div>

      <div className={`site-header__drawer ${open ? "open" : ""}`}>
        <Link to="/" onClick={close}>Home</Link>
        <Link to="/shop" onClick={close}>Collection</Link>
        <Link to="/category/fabrics" onClick={close}>Fabrics</Link>
        <Link to="/category/wallpaper" onClick={close}>Wallpaper</Link>
        <Link to="/contact" onClick={close}>Showroom</Link>
        <Link to="/cart" onClick={close}>Bag</Link>
        <div className="eyebrow">Account</div>
        {user ? (
          <>
            <Link to={dashboard} onClick={close}>My account</Link>
            <button onClick={() => { close(); logout(); }}>Sign out</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={close}>Sign in</Link>
            <Link to="/register" onClick={close}>Register</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
