let initialState = [];

if (typeof window !== undefined) {
  //getting if any previous item exists in local storage
  if (localStorage.getItem("shippingAddress")) {
    initialState = JSON.parse(localStorage.getItem("shippingAddress"));
  } else {
    initialState = [];
  }
}
//load cart items from localStorage

export const shippingAddReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SHIPPING_ADDRESS":
      return action.payload;
    default:
      return state;
  }
};
