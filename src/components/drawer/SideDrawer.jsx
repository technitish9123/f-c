import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { Drawer, Button } from "antd";
import laptop from "../../images/laptop.png";

const SideDrawer = () => {
  const dispatch = useDispatch();
  const { drawer, cart } = useSelector((state) => ({ ...state }));
  const { pathname } = useLocation();

  // Close the "added to bag" drawer whenever the page changes.
  useEffect(() => {
    dispatch({ type: "DRAWER_VISIBILITY", payload: false });
  }, [pathname, dispatch]);

  const handleCloseDrawer = () => {
    dispatch({
      type: "DRAWER_VISIBILITY",
      payload: false,
    });
  };

  return (
    <Drawer
      open={drawer}
      onClose={handleCloseDrawer}
      title={`Your bag (${cart.length})`}
      placement="right"
      closable={true}
    >
      {cart.map((p) => (
        <div className="row" key={p._id}>
          <div className="col">
            {p.images[0] ? (
              <>
                <img src={p.images[0].url} className="sidedrawer-image" />
                <p className="text-center bg-secondary text-light">
                  {p.title} x {p.count}
                </p>
              </>
            ) : (
              <>
                <img src={laptop} className="sidedrawer-image" />
                <p className="text-center bg-secondary text-light">
                  {p.title} x {p.count} h
                </p>
              </>
            )}
          </div>
        </div>
      ))}
      <Link to="/cart">
        <Button
          block
          className="btn btn-primary btn-raised"
          onClick={() => {
            dispatch({
              type: "DRAWER_VISIBILITY",
              payload: false,
            });
          }}
        >
          View bag
        </Button>
      </Link>
    </Drawer>
  );
};

export default SideDrawer;
