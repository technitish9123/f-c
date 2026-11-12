import axios from "axios";

export const userCart = async (cart, authtoken) =>
  await axios.post(
    `${import.meta.env.REACT_APP_API}/user/cart`,
    { cart },
    {
      headers: {
        authtoken,
      },
    }
  );

export const getUserCart = async (authtoken) =>
  await axios.get(`${import.meta.env.REACT_APP_API}/user/cart`, {
    headers: {
      authtoken,
    },
  });

export const emptyUserCart = async (authtoken) =>
  await axios.delete(`${import.meta.env.REACT_APP_API}/user/cart`, {
    headers: {
      authtoken,
    },
  });

export const saveUserAddress = async (authtoken, address) =>
  await axios.put(
    `${import.meta.env.REACT_APP_API}/user/address`,
    { address },
    {
      headers: {
        authtoken,
      },
    }
  );

export const applyDiscount = async (coupon, authtoken) =>
  await axios.post(`${import.meta.env.REACT_APP_API}/user/cart/coupon`, coupon, {
    headers: {
      authtoken,
    },
  });

export const createOrder = async (paymentIntent, authtoken) =>
  await axios.post(
    `${import.meta.env.REACT_APP_API}/user/order`,
    { paymentIntent },
   
    {
      headers: {
        authtoken,
      },
    },
   // {address},
  );

export const getUserOrders = async (authtoken) =>
  await axios.get(`${import.meta.env.REACT_APP_API}/user/orders`, {
    headers: {
      authtoken,
    },
  });

export const addItemToWishlist = async (productId, authtoken) =>
  await axios.post(
    `${import.meta.env.REACT_APP_API}/user/wishlist`,
    { productId },
    {
      headers: {
        authtoken,
      },
    }
  );

export const getUserWishlist = async (authtoken) =>
  await axios.get(`${import.meta.env.REACT_APP_API}/user/wishlist`, {
    headers: {
      authtoken,
    },
  });

export const removeProductFromWishlist = async (authtoken, productId) =>
  await axios.put(
    `${import.meta.env.REACT_APP_API}/user/wishlist/${productId}`,
    {},
    {
      headers: {
        authtoken,
      },
    }
  );
