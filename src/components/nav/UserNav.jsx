import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/user/history", label: "Orders" },
  { to: "/user/wishlist", label: "Wishlist" },
  { to: "/user/password", label: "Password" },
];

const UserNav = () => (
  <nav className="account-nav" aria-label="Account">
    {links.map((l) => (
      <NavLink
        key={l.to}
        to={l.to}
        className={({ isActive }) => `account-nav__link${isActive ? " is-active" : ""}`}
      >
        {l.label}
      </NavLink>
    ))}
  </nav>
);

export default UserNav;
