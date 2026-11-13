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

// Adds a product (one, or `count` from the quantity calculator) and opens the
// bag drawer. Without a count, a product already in the bag is left as it is.
export const addToCart = (dispatch, product, count) => {
  const cart = readCart();
  const line = cart.find((p) => p._id === product._id);
  if (!line) cart.push({ ...product, count: count || 1 });
  else if (count) line.count = count;
  writeCart(dispatch, cart);
  dispatch({ type: "DRAWER_VISIBILITY", payload: true });
};
