import axios from "axios";

export const createPaymentsIntent = async (authtoken, coupon) =>
  await axios.post(
    `${import.meta.env.REACT_APP_API}/create-payment-integration`,
    {couponApplied: coupon},
    {
      headers: {
        authtoken,
      },
    }
  );

  export const createPaymentsIntents = async (authtoken, coupon) =>
  await axios.post(
    `${import.meta.env.REACT_APP_API}/create-payment-integrations`,
    {couponApplied: coupon},
    {
      headers: {
        authtoken,
      },
    }
  );
