import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { userCart } from "../functions/user";
import { Button, Card } from "antd";
import ProductCartTable from "../components/cards/ProductCartTable";

const Cart = ({ history }) => {
  const { user, cart } = useSelector((state) => ({ ...state }));
  const dispatch = useDispatch();

  const saveOrderToDB = () => {
    userCart(cart, user.token).then((res) => {
      if (res.data.ok) {
        history.push("/checkout");
      }
    });
  };

  const showProductsTable = () => (
    <table className="table cart-table">
      <thead className="thead-light">
        <tr>
          <th>Image</th>
          <th>Title</th>
          <th>Price</th>
          <th>Brand</th>
          <th>Color</th>
          <th>Quantity</th>
          <th>Shipping</th>
          <th>Remove</th>
        </tr>
      </thead>

      {cart.map((p) => (
        <ProductCartTable product={p} key={p._id} />
      ))}
    </table>
  );

  const getTotal = () => {
    let sum = cart.reduce((currentValue, nextValue) => {
      return currentValue + nextValue.count * nextValue.price;
    }, 0);
    return sum;
  };

  return (
    <div className="container page-cart">
      <h4 className="section-title">
        Your Bag ({cart.length})
      </h4>
      <div className="row">
        <div className="col-md-8">
          {cart.length === 0 ? (
            <div className="empty-state">
              <p>Your bag is empty.</p>
              <Link to="/shop" className="buybox__cta">Continue shopping</Link>
            </div>
          ) : (
            showProductsTable()
          )}
        </div>
        <div className="col-md-4">
          <Card className="summary-card">
            <h4 className="summary-card__title">Order Summary</h4>
            <div className="pt-4 pb-4">
              {cart.length > 0 ? (
                cart.map((c, i) => (
                  <div key={i}>
                    <p className="cart-details">
                      {c.title} x {c.count} = ₹ {c.price * c.count}{" "}
                    </p>
                  </div>
                ))
              ) : (
                <p>Your Cart Is Empty</p>
              )}
            </div>
            <hr />
            <h5>
              <span className="text-secondary">Total :</span>
              <strong> ₹ {getTotal()} </strong>
            </h5>
            <hr />
          </Card>

          {user ? (
            <Button
              block
              className="btn btn-primary btn-raised mt-4"
              onClick={saveOrderToDB}
              disabled={cart.length === 0}
            >
              <strong>Proceed to Checkout</strong>
            </Button>
          ) : (
            <Link
              className="mt-2"
              to={{
                pathname: "/login",
                state: { from: "/cart" },
              }}
            >
              <Button block className="btn btn-primary btn-raised">
                Log in to Checkout
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
