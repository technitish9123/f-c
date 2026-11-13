/*
 * Shop filter labels and colour swatches. Mapping products to facet values
 * (and counting them) happens on the server: backend/lib/facets.js.
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

// Facets in display order. Values and counts come from the server (GET /catalogue).
export const FACETS = [
  { key: "type", label: "Product type" },
  { key: "use", label: "Use" },
  { key: "colour", label: "Colour", swatch: true },
  { key: "pattern", label: "Pattern" },
  { key: "composition", label: "Composition" },
];

export const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];
