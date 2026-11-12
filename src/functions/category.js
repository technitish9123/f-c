import axios from "axios";

export const getCategories = async () =>
  await axios.get(`${import.meta.env.REACT_APP_API}/categories`);

export const getCategory = async (slug) =>
  await axios.get(`${import.meta.env.REACT_APP_API}/category/${slug}`);

export const removeCategory = async (slug, authtoken) =>
  await axios.delete(`${import.meta.env.REACT_APP_API}/category/${slug}`, {
    headers: {
      authtoken,
    },
  });

export const updateCategory = async (slug, category, authtoken) =>
  await axios.put(`${import.meta.env.REACT_APP_API}/category/${slug}`, category, {
    headers: {
      authtoken,
    },
  });

export const createCategory = async (category, authtoken) =>
  await axios.post(`${import.meta.env.REACT_APP_API}/category`, category, {
    headers: {
      authtoken,
    },
  });

export const getSubs = async (_id) =>
  await axios.get(`${import.meta.env.REACT_APP_API}/product/subs/${_id}`);
