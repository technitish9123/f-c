import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// The PDF's built-in fonts have no ₹ glyph, so amounts use "Rs."
const rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

const ink = "#1c1b19";
const stone = "#8b847a";
const line = "#ddd6cb";

const s = StyleSheet.create({
  page: { padding: 48, fontSize: 10, color: ink, fontFamily: "Helvetica" },
  brand: { fontFamily: "Times-Roman", fontSize: 20, letterSpacing: 3, textTransform: "uppercase" },
  brandSub: { fontSize: 7, letterSpacing: 2, color: stone, marginTop: 4, textTransform: "uppercase" },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  title: { fontFamily: "Times-Roman", fontSize: 26, textAlign: "right" },
  label: { fontSize: 7, letterSpacing: 1.5, color: stone, textTransform: "uppercase", marginBottom: 3 },
  metaRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: ink, paddingTop: 12, marginBottom: 24 },
  metaCell: { flex: 1, paddingRight: 8 },
  th: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: ink, paddingBottom: 6 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: line, paddingVertical: 8 },
  cItem: { flex: 4, paddingRight: 6 },
  cSmall: { flex: 1.4, paddingRight: 6 },
  cQty: { flex: 0.8, textAlign: "right", paddingRight: 6 },
  cAmt: { flex: 1.6, textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 14 },
  total: { fontFamily: "Times-Roman", fontSize: 16 },
  shipTo: { marginTop: 32, borderTopWidth: 1, borderTopColor: line, paddingTop: 12 },
  footer: { position: "absolute", left: 48, right: 48, bottom: 32, fontSize: 7, color: stone, textAlign: "center",
    letterSpacing: 1, borderTopWidth: 1, borderTopColor: line, paddingTop: 8 },
});

const Invoice = ({ order }) => {
  // Orders can lack payment/shipping details or reference deleted products;
  // never let one bad field break the invoice.
  const pi = order.paymentIntent || {};
  const info = pi.paymentInfo || {};
  const ship = pi.shippingAdd || {};
  const charged = info.stripeResponse && info.stripeResponse.amount;
  const itemsTotal = order.products.reduce(
    (sum, p) => sum + (p.product ? p.product.price * p.count : 0),
    0
  );
  const orderNo = String(order._id).slice(-8).toUpperCase();

  return (
    <Document title={`Invoice ${orderNo}`} author="First Impression Furnishing LLP">
      <Page size="A4" style={s.page}>
        <View style={s.headRow}>
          <View>
            <Text style={s.brand}>First Impression</Text>
            <Text style={s.brandSub}>Furnishing LLP · Kemps Corner, Mumbai</Text>
          </View>
          <Text style={s.title}>Invoice</Text>
        </View>

        <View style={s.metaRow}>
          <View style={s.metaCell}>
            <Text style={s.label}>Order</Text>
            <Text>{orderNo}</Text>
          </View>
          <View style={s.metaCell}>
            <Text style={s.label}>Date</Text>
            <Text>{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "-"}</Text>
          </View>
          <View style={s.metaCell}>
            <Text style={s.label}>Status</Text>
            <Text>{order.orderStatus || "-"}</Text>
          </View>
          <View style={s.metaCell}>
            <Text style={s.label}>Payment</Text>
            <Text>{info.status || "-"}</Text>
          </View>
        </View>

        <View style={s.th}>
          <Text style={[s.label, s.cItem]}>Item</Text>
          <Text style={[s.label, s.cSmall]}>Brand</Text>
          <Text style={[s.label, s.cSmall]}>Colour</Text>
          <Text style={[s.label, s.cQty]}>Qty</Text>
          <Text style={[s.label, s.cAmt]}>Amount</Text>
        </View>
        {order.products.map((p, i) => (
          <View style={s.tr} key={i} wrap={false}>
            <Text style={s.cItem}>{p.product ? p.product.title : "Item no longer available"}</Text>
            <Text style={s.cSmall}>{(p.product && p.product.brand) || ""}</Text>
            <Text style={s.cSmall}>{p.color || (p.product && p.product.color) || ""}</Text>
            <Text style={s.cQty}>{p.count}</Text>
            <Text style={s.cAmt}>{p.product ? rs(p.product.price * p.count) : "-"}</Text>
          </View>
        ))}

        <View style={s.totalRow}>
          <View>
            <Text style={[s.label, { textAlign: "right" }]}>{charged ? "Total paid" : "Total"}</Text>
            <Text style={s.total}>{rs(charged ? charged / 100 : itemsTotal)}</Text>
          </View>
        </View>

        {(ship.name || ship.add) && (
          <View style={s.shipTo}>
            <Text style={s.label}>Ship to</Text>
            {ship.name ? <Text>{ship.name}</Text> : null}
            {ship.add ? <Text>{ship.add}</Text> : null}
            {ship.mobileNum ? <Text>{ship.mobileNum}</Text> : null}
            {ship.email ? <Text>{ship.email}</Text> : null}
          </View>
        )}

        <Text style={s.footer} fixed>
          First Impression · 8-11 Om Chambers, Kemps Corner, Mumbai 400036 · meher@firstimp.in · 7777045811
          {info.id ? `  ·  Ref ${info.id}` : ""}
        </Text>
      </Page>
    </Document>
  );
};

export default Invoice;
