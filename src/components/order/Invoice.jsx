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

const Invoice = ({ order }) => (
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
            <DataTableCell getContent={(x) => x.product.title} />
            <DataTableCell getContent={(x) => ` ₹ ${x.product.price}`} />
            <DataTableCell getContent={(x) => x.count} />
            <DataTableCell getContent={(x) => x.product.brand} />
            <DataTableCell getContent={(x) => x.product.color} />
          </TableBody>
        </Table>

        <Text style={styles.text}>
        <Text>Payment Status: {"                         "} { order.paymentIntent.paymentInfo.status} </Text>{"\n"}
          <Text>Date: {"                             "} {new Date(order.createdAt).toLocaleDateString()}</Text>{"\n"}
          <Text>Order ID: {"                         "} { order.paymentIntent.paymentInfo.id} </Text>{"\n"}
         
          <Text>STATUS: {"                           "} {order.orderStatus}</Text>{"\n"}
          <Text>
            Total Paid: {"                           "} {"₹"}

           
            {(order.paymentIntent.paymentInfo.stripeResponse.amount / 100).toLocaleString("en-IN")}
          </Text>{"\n"}{"\n"}
        </Text>
        <Text>Name:{"                         "}{order.paymentIntent.shippingAdd.name}</Text>
        <Text>Mobile Num:{"                   "}{order.paymentIntent.shippingAdd.mobileNum}</Text>
        <Text>Email:{"                        "}{order.paymentIntent.shippingAdd.email}</Text>
        
        <Text>Delivery Address: {"                   "}{order.paymentIntent.shippingAdd.add}</Text>
        <Text style={styles.footer} >Thank You For Shopping With Us</Text>
      </View>
    </Page>
  </Document>
);

export default Invoice;
