/*
 * Normalises the catalogue's free-text fields into clean, filterable facets.
 * The product data was entered by hand over the years (misspellings, trailing
 * spaces, comma lists), so every facet goes through a small mapping here.
 */

// ---- Colour families (JAB-style swatches) --------------------------------
export const COLOUR_FAMILIES = [
  { key: "White", hex: "#f4f1ea", names: ["White", "Ivory"] },
  { key: "Beige", hex: "#d9c7a7", names: ["Beige", "PeachPuff", "Bisque", "BurlyWood", "Khaki"] },
  { key: "Brown", hex: "#7a5236", names: ["Brown"] },
  { key: "Grey", hex: "#9a9a96", names: ["Grey", "Gray"] },
  { key: "Black", hex: "#1f1e1c", names: ["Black"] },
  { key: "Red", hex: "#9e2a2b", names: ["Red", "Maroon", "Coral", "OrangeRed"] },
  { key: "Pink", hex: "#d79aa8", names: ["Pink", "Magenta"] },
  { key: "Orange", hex: "#d4772c", names: ["Orange"] },
  { key: "Yellow", hex: "#d9b43c", names: ["Yellow", "Gold"] },
  { key: "Green", hex: "#5f7a46", names: ["Green", "Olive", "Lime", "GreenYellow"] },
  { key: "Blue", hex: "#3b5f86", names: ["Blue", "Navy", "Aqua", "Teal", "Turquoise", "RoyalBlue"] },
  { key: "Purple", hex: "#6c4f7d", names: ["Purple", "Lavender"] },
];
// Every colour name a product may carry (admin dropdown); each maps to one family above.
export const PRODUCT_COLOURS = COLOUR_FAMILIES.flatMap((f) => f.names);
const colourLookup = Object.fromEntries(
  COLOUR_FAMILIES.flatMap((f) => f.names.map((n) => [n.toLowerCase(), f.key]))
);
export const colourOf = (p) => {
  const c = colourLookup[String(p.color || "").trim().toLowerCase()];
  return c ? [c] : [];
};

// ---- Pattern --------------------------------------------------------------
const PATTERNS = [
  ["Plain", /^plain/],
  ["Stripes", /^strip/],
  ["Floral", /^(floral|flower)/],
  ["Geometric", /^geom/],
  ["Graphic", /^gra/],
  ["Checks", /^check/],
  ["Highlight", /^highlight/],
  ["Polo", /^po/],
  ["Ornamental", /^orna/],
  ["Wood", /^wood/],
];
const patternOf = (p) => {
  const v = String(p.design || "").trim().toLowerCase();
  const hit = v && PATTERNS.find(([, re]) => re.test(v));
  return hit ? [hit[0]] : [];
};

// ---- Use (application) ----------------------------------------------------
const USES = [
  ["Curtains", /^curtain/],
  ["Upholstery", /^upholster/],
  ["Blinds", /^blind/],
  ["Cushions", /^cushion/],
  ["Bedcovers", /^bed/],
  ["Table linen", /^dining|^table/],
  ["Wallcovering", /^wallpaper/],
];
const usesOf = (p) => {
  const parts = String(p.application || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const out = new Set();
  parts.forEach((part) => {
    const hit = USES.find(([, re]) => re.test(part));
    if (hit) out.add(hit[0]);
  });
  return [...out];
};

// ---- Composition (fibres) ---------------------------------------------------
const FIBRES = [
  ["Cotton", /cotton/],
  ["Polyester", /polyester/],
  ["Silk", /silk/],
  ["Wool", /wool/],
  ["Linen", /linen/],
  ["Viscose", /viscose/],
  ["Vinyl", /vin[yl]{2}/],
  ["Non-woven", /non[\s-]?woven/],
  ["Paper", /paper/],
];
const fibresOf = (p) => {
  const v = String(p.material || "").toLowerCase();
  return FIBRES.filter(([, re]) => re.test(v)).map(([k]) => k);
};

const typeOf = (p) => (p.category && p.category.name ? [p.category.name.trim()] : []);

// Facets in display order. `values` returns an array (a product can match several).
export const FACETS = [
  { key: "type", label: "Product type", values: typeOf },
  { key: "use", label: "Use", values: usesOf, order: USES.map(([k]) => k) },
  { key: "colour", label: "Colour", values: colourOf, order: COLOUR_FAMILIES.map((f) => f.key), swatch: true },
  { key: "pattern", label: "Pattern", values: patternOf, order: PATTERNS.map(([k]) => k) },
  { key: "composition", label: "Composition", values: fibresOf, order: FIBRES.map(([k]) => k) },
];

// Pre-compute every product's facet values once.
export const indexProducts = (products) =>
  products.map((p) => ({
    product: p,
    facets: Object.fromEntries(FACETS.map((f) => [f.key, f.values(p)])),
    price: Number(p.price) || 0,
  }));

const matchesFacets = (item, selected, skipKey) =>
  FACETS.every(({ key }) => {
    if (key === skipKey) return true;
    const want = selected[key];
    if (!want || want.length === 0) return true;
    return item.facets[key].some((v) => want.includes(v));
  });

const inPrice = (item, price) => !price || (item.price >= price[0] && item.price <= price[1]);

export const filterItems = (items, selected, price) =>
  items.filter((it) => matchesFacets(it, selected) && inPrice(it, price));

// Counts per option, computed against all *other* active filters (standard faceting).
export const facetCounts = (items, selected, price) =>
  Object.fromEntries(
    FACETS.map((f) => {
      const counts = {};
      items.forEach((it) => {
        if (!inPrice(it, price) || !matchesFacets(it, selected, f.key)) return;
        it.facets[f.key].forEach((v) => (counts[v] = (counts[v] || 0) + 1));
      });
      const keys = Object.keys(counts);
      const ordered = f.order ? f.order.filter((k) => keys.includes(k)) : keys.sort();
      return [f.key, ordered.map((v) => ({ value: v, count: counts[v] }))];
    })
  );

export const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

export const sortItems = (items, sort) => {
  const list = [...items];
  if (sort === "newest") list.sort((a, b) => new Date(b.product.createdAt) - new Date(a.product.createdAt));
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  return list;
};

// ---- Free-text search across the fields a customer would type ---------------
const searchableText = (it) => {
  const p = it.product;
  return [
    p.title, p.brand, p.color, p.design, p.material, p.application, p.style,
    p.category && p.category.name,
    ...Object.values(it.facets).flat(),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

// Every word must match somewhere (e.g. "green floral curtain").
export const searchItems = (items, text) => {
  const words = String(text || "").toLowerCase().split(/\s+/).filter(Boolean)
    .map((w) => w.replace(/s$/, "")); // "curtains" matches "curtain"
  if (!words.length) return items;
  return items.filter((it) => {
    if (!it._search) it._search = searchableText(it);
    return words.every((w) => it._search.includes(w));
  });
};
