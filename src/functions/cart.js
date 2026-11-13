// The bag lives in localStorage and redux; these keep both in step.
export const readCart = () => {
  try {
    const cart = JSON.parse(localStorage.getItem("cart"));
    return Array.isArray(cart) ? cart : [];
  } catch (e) {
    return [];
  }
};

export const writeCart = (dispatch, cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
  dispatch({ type: "ADD_TO_CART", payload: cart });
};

// Adds one of a product (or nothing if it's already in the bag) and opens the bag drawer.
export const addToCart = (dispatch, product, count = 1) => {
  const cart = readCart();
  if (!cart.some((p) => p._id === product._id)) cart.push({ ...product, count });
  writeCart(dispatch, cart);
  dispatch({ type: "DRAWER_VISIBILITY", payload: true });
};
