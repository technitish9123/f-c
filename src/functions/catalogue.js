import { getProductsByCount } from "./product";

/*
 * The whole catalogue (~370 products, ~27 KB gzipped) is fetched once and
 * shared by the product finder, category pages and product pages.
 */
let request = null;

export const getCatalogue = () => {
  if (!request) {
    request = getProductsByCount(1000)
      .then((res) => res.data || [])
      .catch((err) => {
        request = null; // allow a retry after a failure
        throw err;
      });
  }
  return request;
};

// "Seiichi J-1158" and "Seiichi J-1163" are colourways of one design.
export const familyOf = (title = "") =>
  title
    .trim()
    .split(/\s+(?=[A-Z]{0,3}[-\s]?\d)/)[0]
    .replace(/[\s\-–:]+$/, "")
    .toLowerCase();
