import React from "react";
import { useSelector } from "react-redux";
import LoadingToRedirect from "./LoadingToRedirect";

// Renders its children only for a signed-in user.
const UserRoute = ({ children }) => {
  const user = useSelector((state) => state.user);

  return user && user.token ? children : <LoadingToRedirect />;
};

export default UserRoute;
