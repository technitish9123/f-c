import axios from "axios";

const API = import.meta.env.REACT_APP_API;

export const createRazorpayOrder = (authtoken, coupon, shippingAdd) =>
  axios.post(`${API}/razorpay/order`, { couponApplied: !!coupon, ...(shippingAdd && { shippingAdd }) }, { headers: { authtoken } });

export const verifyRazorpayPayment = (authtoken, response) => axios.post(`${API}/razorpay/verify`, response, { headers: { authtoken } });

// Razorpay's checkout script, loaded once, only on the payment page.
let loading;
export const loadRazorpay = () =>
  window.Razorpay
    ? Promise.resolve(window.Razorpay)
    : (loading ||= new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.async = true;
        s.onload = () => resolve(window.Razorpay);
        s.onerror = () => {
          loading = null;
          reject(new Error("Razorpay could not load"));
        };
        document.body.appendChild(s);
      }));
