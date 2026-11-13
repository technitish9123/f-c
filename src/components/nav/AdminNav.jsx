import React from "react";
import { NavLink } from "react-router-dom";

const groups = [
  { title: "Store", links: [["/admin/dashboard", "Orders"], ["/admin/products", "Products"], ["/admin/product", "Add product"]] },
  { title: "Catalogue", links: [["/admin/category", "Categories"], ["/admin/sub", "Sub categories"], ["/admin/coupon", "Coupons"], ["/admin/sliderimageupload", "Slider images"]] },
  { title: "Account", links: [["/user/password", "Password"]] },
];

const AdminNav = () => (
  <nav className="admin-nav" aria-label="Admin">
    <div className="admin-nav__brand">Studio</div>
    {groups.map((g) => (
      <div key={g.title} className="admin-nav__group">
        <div className="eyebrow">{g.title}</div>
        {g.links.map(([to, label]) => (
          <NavLink key={to} to={to} end className={({ isActive }) => `account-nav__link${isActive ? " is-active" : ""}`}>
            {label}
          </NavLink>
        ))}
      </div>
    ))}
  </nav>
);

export default AdminNav;
