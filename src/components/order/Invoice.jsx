import React, { useEffect, useState } from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./pdfStyles";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  DataTableCell,
} from "@david.kucsai/react-pdf-table";

const Invoice = ({ order }) => {
  // Orders can lack payment/shipping details or reference deleted products;
  // never let one bad field crash the account page.
  const pi = order.paymentIntent || {};
  const info = pi.paymentInfo || {};
  const ship = pi.shippingAdd || {};
  const paid = info.stripeResponse && info.stripeResponse.amount;
  return (
  <Document>
    <Page size="A4" style={styles.body}>
      <View>
        <Text style={styles.header} fixed>
          {" "}
          ~ {new Date().toLocaleString()} ~{" "}
        </Text>
        <Text style={styles.title}>Order Invoice</Text>
        <Text style={styles.author}>First impression</Text>
        <Text style={styles.subtitle}>Order Summary</Text>

        <Table>
          <TableHeader>
            <TableCell>Title</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Brand</TableCell>
            <TableCell>Color</TableCell>
          </TableHeader>
        </Table>
        <Table data={order.products}>
          <TableBody>
            <DataTableCell getContent={(x) => (x.product ? x.product.title : "Item no longer available")} />
            <DataTableCell getContent={(x) => x.product ? ` ₹ ${x.product.price}` : ""} />
            <DataTableCell getContent={(x) => x.count} />
            <DataTableCell getContent={(x) => (x.product ? x.product.brand : "")} />
            <DataTableCell getContent={(x) => (x.product ? x.product.color : "")} />
          </TableBody>
        </Table>

        <Text style={styles.text}>
        <Text>Payment Status: {"                         "} { info.status || "—"} </Text>{"\n"}
          <Text>Date: {"                             "} {new Date(order.createdAt).toLocaleDateString()}</Text>{"\n"}
          <Text>Order ID: {"                         "} { info.id || order._id} </Text>{"\n"}
         
          <Text>STATUS: {"                           "} {order.orderStatus}</Text>{"\n"}
          <Text>
            Total Paid: {"                           "} {"₹"}

           
            {paid ? (paid / 100).toLocaleString("en-IN") : "—"}
          </Text>{"\n"}{"\n"}
        </Text>
        <Text>Name:{"                         "}{ship.name || ""}</Text>
        <Text>Mobile Num:{"                   "}{ship.mobileNum || ""}</Text>
        <Text>Email:{"                        "}{ship.email || ""}</Text>
        
        <Text>Delivery Address: {"                   "}{ship.add || ""}</Text>
        <Text style={styles.footer} >Thank You For Shopping With Us</Text>
      </View>
    </Page>
  </Document>
  );
};

export default Invoice;
