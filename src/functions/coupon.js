import axios from "axios";

// Admin-only: the coupon list includes every active discount code.
export const getCoupons = async (authtoken) =>
  await axios.get(`${import.meta.env.REACT_APP_API}/coupons`, { headers: { authtoken } });

export const deleteCoupon = async (authtoken, coupon_id) =>
  await axios.delete(`${import.meta.env.REACT_APP_API}/coupon/${coupon_id}`, {
    headers: {
      authtoken,
    },
  });

export const createCoupon = async (authtoken, coupon) =>
  await axios.post(`${import.meta.env.REACT_APP_API}/coupon`, coupon, {
    headers: {
      authtoken,
    },
  });
