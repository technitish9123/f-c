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
const API = import.meta.env.REACT_APP_API;
const auth = (authtoken) => ({ headers: { authtoken } });

export const setOrderStatus = (authtoken, orderId, orderStatus, tracking) =>
  axios.put(`${API}/admin/order-status`, { orderId, orderStatus, ...(tracking && { tracking }) }, auth(authtoken));
export const refundOrder = (authtoken, orderId) => axios.post(`${API}/admin/orders/${orderId}/refund`, {}, auth(authtoken));
export const getStats = (authtoken, threshold = 5) => axios.get(`${API}/admin/stats?threshold=${threshold}`, auth(authtoken));
export const getCustomers = (authtoken) => axios.get(`${API}/admin/customers`, auth(authtoken));
export const importProducts = (authtoken, products) => axios.post(`${API}/admin/products/import`, { products }, auth(authtoken));
