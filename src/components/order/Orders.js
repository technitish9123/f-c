import React, { useState } from "react";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Invoice from "../../components/order/Invoice";
import { Col, Select, Row } from "antd";
import moment from "moment";

const { Option } = Select;

const statusOptions = [
  "Not Processed",
  "Processing",
  "Dispatched",
  "Delivered",
  "Cancelled",
];

const Orders = ({ orders, handleStatusChange }) => {
  const [option, setOptions] = useState("Not Processed");
  console.log(orders);

  const showOrderInTable = (order) => (
    <table className="table table-bordered">
      <thead className="thead-light">
        <tr>
          <th scope="col">Title</th>
          <th scope="col">Price</th>
          <th scope="col">Brand</th>
          <th scope="col">Color</th>
          <th scope="col">Quantity</th>
          <th scope="col">Shipping</th>
        </tr>
      </thead>

      <tbody>
        {order.products.map((p, i) => (
          <tr key={i}>
            <td>
              <strong>{p.product.title}</strong>
            </td>
            <td>{p.product.price}</td>
            <td>{p.product.brand}</td>
            <td>{p.product.color}</td>
            <td>{p.count}</td>

            <td>
              {p.product.shipping === "Yes" ? (
                <CheckCircleOutlined style={{ color: "green" }} />
              ) : (
                <CloseCircleOutlined className="text-danger" />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const showDowloadLink = (order) => (
    <PDFDownloadLink
      document={<Invoice order={order} />}
      fileName="invoice.pdf"
      className="btn btn-sm btn-outline-primary"
    >
      Download Invoice
    </PDFDownloadLink>
  );

  const showEachOrders = () =>
    orders.map((order, i) => (
      <div key={order._id}>
        <div className="m-5 p-3 card">
          {/* <ShowPaymentInfo order={order} /> */}

          <Row>
            <Col lg={12}>
              <div className=" p-3 ">
                <p style={{ fontSize: "25px" }}>Shipping Info:</p>
                <div>Name: {order.paymentIntent.shippingAdd.name}</div> <br />
                <div>
                  Mobile Number: {order.paymentIntent.shippingAdd.mobileNum}
                </div>{" "}
                <br />
                <div>Email: {order.paymentIntent.shippingAdd.email}</div>
                <br />
                <div>
                  Shipping Address: {order.paymentIntent.shippingAdd.add}
                </div>{" "}
                <br />
                {order.paymentIntent.shippingAdd.specialMessage ? (
                  <div>
                    Special message:{" "}
                    {order.paymentIntent.shippingAdd.specialMessage}
                  </div>
                ) : (
                  <div> </div>
                )}
                {/* <div>Special message: {order.paymentIntent.shippingAdd.specialMessage}</div> <br/> */}
              </div>
            </Col>
            <Col lg={12}>
              <div className=" p-3 ">
                <p style={{ fontSize: "25px" }}>Payment Info:</p>
                <div>
                  Status:{" "}
                  {order.paymentIntent.paymentInfo.stripeResponse.status}
                </div>{" "}
                <br />
                <div>
                  PaymentID: {order.paymentIntent.paymentInfo.stripeResponse.id}
                </div>{" "}
                <br />
                <div>
                  Amount:{" "}
                  {order.paymentIntent.paymentInfo.stripeResponse.amount / 100}
                </div>{" "}
                <br />
                <div>
                  Date:{" "}
                  {moment
                    .unix(
                      order.paymentIntent.paymentInfo.stripeResponse.created
                    )
                    .format("MMMM Do YYYY, h:mm:ss a")}
                </div>{" "}
                <br />
              </div>
            </Col>
          </Row>
          {showOrderInTable(order)}
          <div className="row">
            <div className="col">
              <div className="text-left">{showDowloadLink(order)}</div>
              <div className="text-right">
                <span className="h5">Delivery Status: </span>
                <Select
                  defaultValue={order.orderStatus}
                  onChange={(value) => {
                    handleStatusChange(order._id, value);
                  }}
                >
                  {statusOptions.map((op) => (
                    <Option value={op} key={op}>
                      {op}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));

  return <>{showEachOrders()}</>;
};

export default Orders;
