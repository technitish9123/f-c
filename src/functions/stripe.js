import axios from "axios";

export const createPaymentsIntent = async (authtoken, coupon, shippingAdd) =>
  await axios.post(
    `${import.meta.env.REACT_APP_API}/create-payment-integration`,
    { couponApplied: !!coupon, ...(shippingAdd && { shippingAdd }) },
    { headers: { authtoken } }
  );
