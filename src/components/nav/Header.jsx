import React, { useState, useEffect } from "react";
import { Badge, Dropdown } from "antd";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useDispatch, useSelector } from "react-redux";
import { useLegacyHistory as useHistory } from "../routes/legacy";
import Search from "../forms/Search";
import { useFavourites } from "../../functions/useFavourites";
import "./nav.css";
import WeaveMark from "../brand/WeaveMark";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const fav = useFavourites();

  let dispatch = useDispatch();
  let { user, cart } = useSelector((state) => ({ ...state }));

  let history = useHistory();

  const logout = () => {
    signOut(auth);
    dispatch({
      type: "LOGOUT",
      payload: null,
    });
    history.push("/login");
  };

  const dashboard =
    user && (user.role === "admin" ? "/admin/dashboard" : "/user/history");

  const userMenu = {
    items: [
      dashboard && { key: "dash", label: <Link to={dashboard}>Account</Link> },
      { key: "wish", label: <Link to="/favourites">Favourites</Link> },
      { key: "logout", label: "Sign out", onClick: logout },
    ].filter(Boolean),
  };

  const close = () => setOpen(false);

  // lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

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
          <WeaveMark size={20} threads={4} className="site-header__mark" />
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
            <Dropdown menu={userMenu} trigger={["click"]}>
              <button className="u site-header__hide-m">Account</button>
            </Dropdown>
          ) : (
            <Link to="/login" className="u site-header__hide-m">
              Sign in
            </Link>
          )}
          <Link to="/favourites" className="u site-header__fav" onClick={close} aria-label={`Favourites (${fav.count})`}>
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path d="M12 20.5s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.6c0 5.7-7.5 10.3-7.5 10.3z" />
            </svg>
            {fav.count > 0 && <span className="site-header__fav-n">{fav.count}</span>}
          </Link>
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
        <Link to="/favourites" onClick={close}>Favourites{fav.count ? ` (${fav.count})` : ""}</Link>
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
