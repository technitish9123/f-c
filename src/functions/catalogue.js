import axios from "axios";

const API = import.meta.env.REACT_APP_API;

/*
 * The catalogue is searched, filtered and paged on the server, so it can hold
 * tens of thousands of products. params: q, category, sub, type, use, colour,
 * pattern, composition (comma lists), min, max, sort, page, limit, ids.
 */
export const searchCatalogue = (params, { signal } = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && !v.length))
      .map(([k, v]) => [k, Array.isArray(v) ? v.join(",") : v])
  );
  return axios.get(`${API}/catalogue`, { params: clean, signal }).then((r) => r.data);
};

// Colourways of the same design, related designs and "complete the look".
export const getMore = (slug) => axios.get(`${API}/product/${encodeURIComponent(slug)}/more`).then((r) => r.data);
