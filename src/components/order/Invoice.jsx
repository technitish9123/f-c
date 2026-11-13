import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

/*
 * GST tax invoice in the firm's existing (Tally) layout. Site prices include
 * GST, so each line's taxable value is worked back out of the price.
 */

const SELLER = {
  name: "First Impression Furnishings LLP",
  lines: [
    "8-11 Om Chambers, Gr. Floor",
    "Kemps Corner, Mumbai",
    "IEC Code : AAFFF3194H",
    "GSTIN/UIN: 27AAFFF3194H1ZB",
    "State Name : Maharashtra, Code : 27",
    "Contact : 022-23631490 / 4167 / 66642030, 7777045811",
    "Fax : 022-66642031",
    "E-Mail : firstimp777@gmail.com",
    "www.firstimp.in",
  ],
  state: "Maharashtra",
  pan: "AAFFF3194H",
  bank: [
    ["Bank Name", "IDFC First Bank"],
    ["A/c No.", "10070352003"],
    ["Branch & IFS Code", "Prabhadevi - Cnergy Branch & IDFB0040154"],
  ],
};

// Per category: HSN code and selling unit. Edit here if a category changes.
const CATEGORY = {
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

const placeOfSupply = (address = "") => {
  const a = address.toLowerCase();
  return STATES.find((s) => a.includes(s.toLowerCase())) ||
    Object.entries(CITY_STATE).find(([c]) => a.includes(c))?.[1] || SELLER.state;
};

const money = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const round2 = (n) => Math.round(n * 100) / 100;
const qty = (n) => Number(n).toFixed(2);

// Indian numbering in words: 84525 -> "Eighty Four Thousand Five Hundred Twenty Five"
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
  "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const twoDigits = (n) => (n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]} ${ONES[n % 10]}`.trim());
const threeDigits = (n) =>
  [n >= 100 ? `${ONES[Math.floor(n / 100)]} Hundred` : "", twoDigits(n % 100)].filter(Boolean).join(" ");
const inWords = (amount) => {
  let n = Math.floor(amount);
  const paise = Math.round((amount - n) * 100);
  const parts = [];
  for (const [size, name] of [[1e7, "Crore"], [1e5, "Lakh"], [1e3, "Thousand"]]) {
    if (n >= size) {
      parts.push(`${threeDigits(Math.floor(n / size))} ${name}`);
      n %= size;
    }
  }
  if (n) parts.push(threeDigits(n));
  const rupees = parts.join(" ") || "Zero";
  return `INDIAN RUPEES ${rupees}${paise ? ` and ${twoDigits(paise)} Paise` : ""} Only`;
};

// Financial year label for a date, e.g. 6 Jun 2022 -> "22-23"
const fy = (d) => {
  const y = d.getFullYear() - (d.getMonth() < 3 ? 1 : 0);
  return `${String(y).slice(2)}-${String(y + 1).slice(2)}`;
};
const longDate = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).replace(/ /g, "-");

const B = 0.75; // border width
const s = StyleSheet.create({
  page: { paddingTop: 28, paddingHorizontal: 30, paddingBottom: 46, fontSize: 7.5, fontFamily: "Helvetica", color: "#000" },
  title: { fontWeight: "bold", fontSize: 11, textAlign: "center", marginBottom: 6 },
  box: { borderWidth: B, borderColor: "#000", flexGrow: 1 },
  row: { flexDirection: "row" },
  bb: { borderBottomWidth: B, borderColor: "#000" },
  br: { borderRightWidth: B, borderColor: "#000" },
  pad: { padding: 4 },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  boldItalic: { fontWeight: "bold", fontStyle: "italic" },
  small: { fontSize: 6.5 },
  sellerName: { fontWeight: "bold", fontSize: 9.5 },
  kv: { flexDirection: "row" },
  k: { width: 62 },
  metaCell: { flex: 1, padding: 3, minHeight: 25 },
  metaValue: { fontWeight: "bold", marginTop: 1 },
  // item table columns
  cSl: { width: "4%" }, cDesc: { width: "33%" }, cHsn: { width: "9%" }, cGst: { width: "7%" },
  cQty: { width: "11%" }, cRate: { width: "10%" }, cPer: { width: "5%" }, cDisc: { width: "7%" }, cAmt: { width: "14%" },
  th: { padding: 3, textAlign: "center" },
  td: { paddingHorizontal: 3, paddingVertical: 2 },
  right: { textAlign: "right" },
  // HSN summary columns
  hHsn: { width: "38%" }, hVal: { width: "14%" }, hRate: { width: "8%" }, hAmt: { width: "11%" }, hTot: { width: "10%" },
  foot: { position: "absolute", left: 30, right: 30, bottom: 16, textAlign: "center", fontSize: 7 },
});

const Cell = ({ style, children, last }) => <View style={[style, !last && s.br]}>{children}</View>;

const Invoice = ({ order }) => {
  // Old orders can lack payment or shipping details, or reference deleted products.
  const pi = order.paymentIntent || {};
  const info = pi.paymentInfo || {};
  const ship = pi.shippingAdd || {};
  const date = order.createdAt ? new Date(order.createdAt) : new Date();
  // Numbered by the server per financial year; orders from before numbering
  // started fall back to a reference built from the order id.
  const invoiceNo = order.invoiceNo || `FIF/WEB-${String(order._id).slice(-6).toUpperCase()}/${fy(date)}`;
  const state = placeOfSupply(ship.add);
  const interState = state !== SELLER.state;

  const items = (order.products || []).filter((p) => p.product);
  const listTotal = items.reduce((sum, p) => sum + p.product.price * p.count, 0);
  const charged = info.stripeResponse?.amount ? info.stripeResponse.amount / 100 : null;
  // A coupon shows as the same discount % on every line.
  const disc = charged && charged < listTotal - 0.01 ? (1 - charged / listTotal) * 100 : 0;

  const lines = items.map((p) => {
    const cat = CATEGORY[p.product.category?.slug] || DEFAULT_CATEGORY;
    const gst = Number(p.product.gst) || 0;
    const rate = p.product.price / (1 + gst / 100); // price excluding GST
    const taxable = round2(rate * p.count * (1 - disc / 100));
    return { title: p.product.title, color: p.color, ...cat, gst, rate, count: p.count, taxable, tax: round2((taxable * gst) / 100) };
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
  const half = (n) => round2(n / 2);
  const computed = round2(taxableTotal + taxTotal);
  const grand = charged ?? computed;
  const roundOff = round2(grand - computed);
  const units = [...new Set(lines.map((l) => l.unit))];
  const totalQty = units.length === 1 ? `${qty(lines.reduce((t, l) => t + l.count, 0))} ${units[0]}` : "";

  const party = (label) => (
    <View style={[s.pad, label === "Consignee" && s.bb]}>
      <Text>{label}</Text>
      <Text style={s.bold}>{ship.name || order.userEmail || "Customer"}</Text>
      {ship.add ? <Text>{ship.add}</Text> : null}
      {ship.mobileNum ? <View style={s.kv}><Text style={s.k}>Contact</Text><Text>: {ship.mobileNum}</Text></View> : null}
      {(ship.email || order.userEmail) ? <View style={s.kv}><Text style={s.k}>E-Mail</Text><Text>: {ship.email || order.userEmail}</Text></View> : null}
      <View style={s.kv}><Text style={s.k}>State Name</Text><Text>: {state}</Text></View>
      {label !== "Consignee" ? <View style={s.kv}><Text style={s.k}>Place of Supply</Text><Text>: {state}</Text></View> : null}
    </View>
  );

  const meta = [
    [["Invoice No.", invoiceNo], ["Dated", longDate(date)]],
    [["Delivery Note", ""], ["Mode/Terms of Payment", charged ? "Paid online (Card)" : ""]],
    [["Supplier's Ref.", invoiceNo], ["Other Reference(s)", info.id || ""]],
    [["Buyer's Order No.", String(order._id).slice(-8).toUpperCase()], ["Dated", longDate(date)]],
    [["Despatch Document No.", ""], ["Delivery Note Date", ""]],
    [["Despatched through", ""], ["Destination", ""]],
  ];

  return (
    <Document title={`Tax Invoice ${invoiceNo}`} author={SELLER.name}>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>Tax Invoice</Text>

        <View style={s.box}>
          {/* Parties | invoice details */}
          <View style={[s.row, s.bb]}>
            <View style={[{ width: "50%" }, s.br]}>
              <View style={[s.pad, s.bb]}>
                <Text style={s.sellerName}>{SELLER.name}</Text>
                {SELLER.lines.map((l) => <Text key={l} style={s.small}>{l}</Text>)}
              </View>
              {party("Consignee")}
              {party("Buyer (if other than consignee)")}
            </View>
            <View style={{ width: "50%" }}>
              {meta.map((pair, i) => (
                <View key={i} style={[s.row, s.bb]}>
                  {pair.map(([k, v], j) => (
                    <View key={k + j} style={[s.metaCell, j === 0 && s.br]}>
                      <Text>{k}</Text>
                      {v ? <Text style={s.metaValue}>{v}</Text> : null}
                    </View>
                  ))}
                </View>
              ))}
              <View style={[s.pad, { flexGrow: 1 }]}>
                <Text>Terms of Delivery</Text>
              </View>
            </View>
          </View>

          {/* Items */}
          <View style={[s.row, s.bb]}>
            <Cell style={[s.cSl, s.th]}><Text>Sl{"\n"}No.</Text></Cell>
            <Cell style={[s.cDesc, s.th]}><Text>Description of Goods</Text></Cell>
            <Cell style={[s.cHsn, s.th]}><Text>HSN/SAC</Text></Cell>
            <Cell style={[s.cGst, s.th]}><Text>GST{"\n"}Rate</Text></Cell>
            <Cell style={[s.cQty, s.th]}><Text>Quantity</Text></Cell>
            <Cell style={[s.cRate, s.th]}><Text>Rate</Text></Cell>
            <Cell style={[s.cPer, s.th]}><Text>per</Text></Cell>
            <Cell style={[s.cDisc, s.th]}><Text>Disc. %</Text></Cell>
            <Cell style={[s.cAmt, s.th]} last><Text>Amount</Text></Cell>
          </View>

          <View style={[s.row, s.bb, { flexGrow: 1, minHeight: 150 }]}>
            <Cell style={s.cSl}>{lines.map((l, i) => <Text key={i} style={[s.td, { minHeight: 20 }]}>{i + 1}</Text>)}</Cell>
            <Cell style={s.cDesc}>
              {lines.map((l, i) => (
                <View key={i} style={[s.td, { minHeight: 20 }]}>
                  <Text style={[s.bold, { fontSize: 8.5 }]}>{l.title}</Text>
                  {l.color ? <Text style={[s.italic, s.small]}>{l.color}</Text> : null}
                </View>
              ))}
              <View style={{ marginTop: 14 }}>
                {(interState ? ["IGST"] : ["CGST", "SGST"]).map((t) => (
                  <Text key={t} style={[s.td, s.boldItalic, s.right, { fontSize: 8.5 }]}>{t}</Text>
                ))}
                {roundOff ? <Text style={[s.td, s.boldItalic, s.right, { fontSize: 8.5 }]}>Round Off</Text> : null}
              </View>
            </Cell>
            <Cell style={s.cHsn}>{lines.map((l, i) => <Text key={i} style={[s.td, { minHeight: 20 }]}>{l.hsn}</Text>)}</Cell>
            <Cell style={s.cGst}>{lines.map((l, i) => <Text key={i} style={[s.td, s.right, { minHeight: 20 }]}>{l.gst} %</Text>)}</Cell>
            <Cell style={s.cQty}>{lines.map((l, i) => <Text key={i} style={[s.td, s.right, s.bold, { minHeight: 20 }]}>{qty(l.count)} {l.unit}</Text>)}</Cell>
            <Cell style={s.cRate}>{lines.map((l, i) => <Text key={i} style={[s.td, s.right, { minHeight: 20 }]}>{money(l.rate)}</Text>)}</Cell>
            <Cell style={s.cPer}>{lines.map((l, i) => <Text key={i} style={[s.td, { minHeight: 20 }]}>{l.unit}</Text>)}</Cell>
            <Cell style={s.cDisc}>{lines.map((l, i) => <Text key={i} style={[s.td, s.right, { minHeight: 20 }]}>{disc ? `${disc.toFixed(2)} %` : ""}</Text>)}</Cell>
            <Cell style={s.cAmt} last>
              {lines.map((l, i) => <Text key={i} style={[s.td, s.right, s.bold, { minHeight: 20 }]}>{money(l.taxable)}</Text>)}
              <View style={{ marginTop: 14 }}>
                {(interState ? [taxTotal] : [half(taxTotal), round2(taxTotal - half(taxTotal))]).map((v, i) => (
                  <Text key={i} style={[s.td, s.right, s.bold, { fontSize: 8.5 }]}>{money(v)}</Text>
                ))}
                {roundOff ? <Text style={[s.td, s.right, s.bold, { fontSize: 8.5 }]}>{money(roundOff)}</Text> : null}
              </View>
            </Cell>
          </View>

          <View style={[s.row, s.bb]}>
            <Cell style={s.cSl}><Text> </Text></Cell>
            <Cell style={s.cDesc}><Text style={[s.td, s.right]}>Total</Text></Cell>
            <Cell style={s.cHsn}><Text> </Text></Cell>
            <Cell style={s.cGst}><Text> </Text></Cell>
            <Cell style={s.cQty}><Text style={[s.td, s.right, s.bold]}>{totalQty}</Text></Cell>
            <Cell style={s.cRate}><Text> </Text></Cell>
            <Cell style={s.cPer}><Text> </Text></Cell>
            <Cell style={s.cDisc}><Text> </Text></Cell>
            <Cell style={s.cAmt} last><Text style={[s.td, s.right, s.bold, { fontSize: 10 }]}>Rs. {money(grand)}</Text></Cell>
          </View>

          <View style={[s.pad, s.bb]}>
            <View style={[s.row, { justifyContent: "space-between" }]}>
              <Text style={s.small}>Amount Chargeable (in words)</Text>
              <Text style={s.italic}>E. & O.E</Text>
            </View>
            <Text style={[s.bold, { fontSize: 9 }]}>{inWords(grand)}</Text>
          </View>

          {/* HSN summary */}
          <View style={[s.row, s.bb]}>
            <Cell style={[s.hHsn, s.th]}><Text>HSN/SAC</Text></Cell>
            <Cell style={[s.hVal, s.th]}><Text>Taxable{"\n"}Value</Text></Cell>
            {(interState ? ["Integrated Tax"] : ["Central Tax", "State Tax"]).map((t) => (
              <View key={t} style={[{ width: interState ? "38%" : "19%" }, s.br]}>
                <Text style={[s.th, s.bb]}>{t}</Text>
                <View style={s.row}>
                  <Text style={[s.th, s.br, { width: interState ? "42%" : "42%" }]}>Rate</Text>
                  <Text style={[s.th, { width: "58%" }]}>Amount</Text>
                </View>
              </View>
            ))}
            <Cell style={[s.hTot, s.th]} last><Text>Total{"\n"}Tax Amount</Text></Cell>
          </View>
          {hsnRows.map((r) => {
            const parts = interState ? [[r.gst, r.tax]] : [[r.gst / 2, half(r.tax)], [r.gst / 2, round2(r.tax - half(r.tax))]];
            return (
              <View key={r.hsn + r.gst} style={[s.row, s.bb]}>
                <Cell style={s.hHsn}><Text style={s.td}>{r.hsn}</Text></Cell>
                <Cell style={s.hVal}><Text style={[s.td, s.right]}>{money(r.taxable)}</Text></Cell>
                {parts.map(([rate, amt], i) => (
                  <View key={i} style={[s.row, { width: interState ? "38%" : "19%" }, s.br]}>
                    <Text style={[s.td, s.right, s.br, { width: "42%" }]}>{rate}%</Text>
                    <Text style={[s.td, s.right, { width: "58%" }]}>{money(amt)}</Text>
                  </View>
                ))}
                <Cell style={s.hTot} last><Text style={[s.td, s.right]}>{money(r.tax)}</Text></Cell>
              </View>
            );
          })}
          <View style={[s.row, s.bb]}>
            <Cell style={s.hHsn}><Text style={[s.td, s.right, s.bold]}>Total</Text></Cell>
            <Cell style={s.hVal}><Text style={[s.td, s.right, s.bold]}>{money(taxableTotal)}</Text></Cell>
            {(interState ? [taxTotal] : [half(taxTotal), round2(taxTotal - half(taxTotal))]).map((v, i) => (
              <View key={i} style={[s.row, { width: interState ? "38%" : "19%" }, s.br]}>
                <Text style={[s.td, s.br, { width: "42%" }]}> </Text>
                <Text style={[s.td, s.right, s.bold, { width: "58%" }]}>{money(v)}</Text>
              </View>
            ))}
            <Cell style={s.hTot} last><Text style={[s.td, s.right, s.bold]}>{money(taxTotal)}</Text></Cell>
          </View>

          <View style={[s.pad, s.row, s.bb]}>
            <Text>Tax Amount (in words) :  </Text>
            <Text style={[s.bold, { fontSize: 9 }]}>{inWords(taxTotal)}</Text>
          </View>

          {/* Remarks, declaration | bank */}
          <View style={[s.row, s.bb]}>
            <View style={[s.pad, { width: "50%" }]}>
              <Text style={[s.small, s.italic]}>Remarks:</Text>
              <Text style={s.small}>
                No guarantee against wearing, fading or exact matching of colour. Exposure to sun will cause fading.
                Drycleaning advised for all fabrics.
              </Text>
              <View style={[s.kv, { marginTop: 3 }]}><Text style={[s.small, { width: 80 }]}>Company's PAN</Text><Text style={[s.small, s.bold]}>: {SELLER.pan}</Text></View>
              <Text style={[s.small, { textDecoration: "underline", marginTop: 3 }]}>Declaration</Text>
              <Text style={s.small}>
                Within mentioned goods are to our rights of lien and resale as unpaid vendors & the purchasers & their
                assigns on taking delivery shall hold the same in trust for us and on our behalf till full value thereof
                is paid to us. Interest at 24% per annum will be charged on all overdue accounts. Only official receipt on
                printed and numbered form will be recognized by the company. Payment before delivery / against invoice /
                dispatch
              </Text>
            </View>
            <View style={[s.pad, { width: "50%", justifyContent: "flex-end" }]}>
              <Text>Company's Bank Details</Text>
              {SELLER.bank.map(([k, v]) => (
                <View key={k} style={s.kv}><Text style={{ width: 78 }}>{k}</Text><Text style={s.bold}>: {v}</Text></View>
              ))}
            </View>
          </View>

          {/* Signatures */}
          <View style={[s.row, { minHeight: 48 }]}>
            <View style={[s.pad, s.br, { width: "50%" }]}>
              <Text>Customer's Seal and Signature</Text>
            </View>
            <View style={[s.pad, { width: "50%", justifyContent: "space-between" }]}>
              <Text style={[s.bold, s.right]}>for {SELLER.name}</Text>
              <View style={[s.row, { justifyContent: "space-between" }]}>
                <Text>Prepared by</Text>
                <Text>Verified by</Text>
                <Text>Authorised Signatory</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={s.foot} fixed>
          <Text>SUBJECT TO MUMBAI JURISDICTION</Text>
          <Text style={{ marginTop: 3 }}>This is a Computer Generated Invoice</Text>
        </View>
      </Page>
    </Document>
  );
};

export default Invoice;
