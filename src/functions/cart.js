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

// One bag line per product, or per product and colour for products with colour options.
export const lineKey = (p) => (p.variant ? `${p._id}:${p.variant}` : String(p._id));

// "Ivory · CH1249/069": how a colour option is named in the bag and on the invoice.
export const colourLabel = (v) => [v.colour, v.code].filter(Boolean).join(" · ");

// Adds a product (one, or `count` from the quantity calculator) in the chosen
// colour and opens the bag drawer. Without a count, a line already in the bag
// is left as it is.
export const addToCart = (dispatch, product, count, variant) => {
  // The bag keeps a light copy: never the whole colour list or description.
  const { variants, description, idx, ratings, ...item } = product; // eslint-disable-line no-unused-vars
  if (variant) {
    Object.assign(item, { variant: variant.code, color: colourLabel(variant), quantity: variant.quantity });
    if (variant.image) item.images = [{ url: variant.image }];
  }
  const cart = readCart();
  const line = cart.find((p) => lineKey(p) === lineKey(item));
  if (!line) cart.push({ ...item, count: count || 1 });
  else if (count) line.count = count;
  writeCart(dispatch, cart);
  dispatch({ type: "DRAWER_VISIBILITY", payload: true });
};
