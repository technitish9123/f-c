import React from "react";
import { useSelector } from "react-redux";
import UserNav from "./UserNav";

// Shared frame for the signed-in customer pages.
const AccountLayout = ({ title, intro, children }) => {
  const user = useSelector((state) => state.user);
  const name = user && (user.name || (user.email && user.email.split("@")[0]));

  return (
    <div className="account">
      <header className="account__head">
        <div className="eyebrow">My account{name ? ` · ${name}` : ""}</div>
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </header>
      <div className="account__body">
        <aside className="account__aside">
          <UserNav />
        </aside>
        <main className="account__main">{children}</main>
      </div>
    </div>
  );
};

export default AccountLayout;
