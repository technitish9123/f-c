/*
 * GST invoice maths, shared by the PDF invoice and the admin's GST export so
 * the two can never disagree. Site prices include GST: each line's taxable
 * value is worked back out of the price.
 */
export const SELLER_STATE = "Maharashtra";

// Per category: HSN code and selling unit. Edit here if a category changes.
export const CATEGORY = {
  fabrics: { hsn: "5801", unit: "Mtr." },
  wallpaper: { hsn: "4814", unit: "Roll" },
  tassle: { hsn: "5808", unit: "Nos." },
};
const DEFAULT_CATEGORY = { hsn: "5801", unit: "Mtr." };

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Puducherry", "Chandigarh", "Andaman and Nicobar", "Dadra and Nagar Haveli", "Daman and Diu", "Lakshadweep",
];
// Cities that commonly appear without a state name.
const CITY_STATE = { mumbai: "Maharashtra", pune: "Maharashtra", thane: "Maharashtra", bangalore: "Karnataka",
  bengaluru: "Karnataka", chennai: "Tamil Nadu", hyderabad: "Telangana", kolkata: "West Bengal",
  ahmedabad: "Gujarat", "new delhi": "Delhi", gurgaon: "Haryana", gurugram: "Haryana", noida: "Uttar Pradesh" };


export const round2 = (n) => Math.round(n * 100) / 100;

// Financial year label for a date, e.g. 6 Jun 2022 -> "22-23"
export const fy = (d) => {
  const y = d.getFullYear() - (d.getMonth() < 3 ? 1 : 0);
  return `${String(y).slice(2)}-${String(y + 1).slice(2)}`;
};
export const placeOfSupply = (address = "") => {
  const a = address.toLowerCase();
  return STATES.find((s) => a.includes(s.toLowerCase())) ||
    Object.entries(CITY_STATE).find(([c]) => a.includes(c))?.[1] || SELLER_STATE;
};

export const computeInvoice = (order) => {
  const pi = order.paymentIntent || {};
  const info = pi.paymentInfo || {};
  const ship = pi.shippingAdd || {};
  const date = order.createdAt ? new Date(order.createdAt) : new Date();
  // Numbered by the server per financial year; orders from before numbering
  // started fall back to a reference built from the order id.
  const invoiceNo = order.invoiceNo || `FIF/WEB-${String(order._id).slice(-6).toUpperCase()}/${fy(date)}`;
  const state = placeOfSupply(ship.add);
  const interState = state !== SELLER_STATE;

  const items = (order.products || []).filter((p) => p.product);
  const listTotal = items.reduce((sum, p) => sum + p.product.price * p.count, 0);
  const charged = info.stripeResponse?.amount ? info.stripeResponse.amount / 100 : null;
  // A coupon shows as the same discount % on every line.
  const disc = charged && charged < listTotal - 0.01 ? (1 - charged / listTotal) * 100 : 0;

  const lines = items.map((p) => {
    const cat = CATEGORY[p.product.category?.slug] || DEFAULT_CATEGORY;
    const hsn = p.product.hsn || cat.hsn; // a product-level HSN wins
    const gst = Number(p.product.gst) || 0;
    const rate = p.product.price / (1 + gst / 100); // price excluding GST
    const taxable = round2(rate * p.count * (1 - disc / 100));
    return { title: p.product.title, color: p.color, ...cat, hsn, gst, rate, count: p.count, taxable, tax: round2((taxable * gst) / 100) };
  });

  // HSN-wise summary (one row per HSN + rate)
  const hsnRows = Object.values(
    lines.reduce((acc, l) => {
      const key = `${l.hsn}|${l.gst}`;
      acc[key] = acc[key] || { hsn: l.hsn, gst: l.gst, taxable: 0, tax: 0 };
      acc[key].taxable = round2(acc[key].taxable + l.taxable);
      acc[key].tax = round2(acc[key].tax + l.tax);
      return acc;
    }, {})
  );
  const taxableTotal = round2(lines.reduce((t, l) => t + l.taxable, 0));
  const taxTotal = round2(lines.reduce((t, l) => t + l.tax, 0));
  return { date, invoiceNo, state, interState, lines, hsnRows, taxableTotal, taxTotal, charged, disc, ship, info };
};
