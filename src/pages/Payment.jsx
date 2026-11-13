import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripeCheckout from "../components/cards/StripeCheckout";

const promise = loadStripe(import.meta.env.REACT_APP_STRIPE_KEY);
// Lets Stripe's card field (an iframe) use the site's typeface.
const fonts = [{ cssSrc: "https://fonts.googleapis.com/css2?family=Jost:wght@300;400&display=swap" }];

const Payment = () => (
  <Elements stripe={promise} options={{ fonts }}>
    <StripeCheckout />
  </Elements>
);

export default Payment;
