import axios from "axios";

export const getOrders = async (authtoken) =>
  await axios.get(`${import.meta.env.REACT_APP_API}/admin/orders`, {
    headers: {
      authtoken,
    },
  });

export const updateOrderStatus = async (authtoken, orderId, orderStatus) =>
  await axios.put(
    `${import.meta.env.REACT_APP_API}/admin/order-status`,
    {
      orderId,
      orderStatus,
    },
    {
      headers: {
        authtoken,
      },
    }
  );

  // sliderImages

  export const uploadSliderImg = async (sliderImages, authtoken) =>
  await axios.put(
    `${import.meta.env.REACT_APP_API}/admin/uploadSliderImage`,
    { sliderImages },
    { headers: { authtoken } }
  );