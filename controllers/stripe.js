const Order = require("../models/orders");
const stripe = require("stripe");
const uuid4 = require("uuid4");
require("dotenv").config();

const Secret_Key = process.env.STRIPE_SECRET_KEY_NEW;

const Stripe = stripe(Secret_Key);

exports.StripePayment = async (req, res) => {
  try {
    // console.log(req.body.authToken.token.card);
    const brand = req.body.authToken.token.card;
    const country = req.body.authToken.token.country;
    const funding = req.body.authToken.token.funding;
    const { orderId, authToken } = req.body;
    const { id } = authToken.token;
    const order = await Order.findById(orderId)
      .populate("items.item")
      .populate("customer")
      .populate("vendor");

    const customer = await Stripe.customers.create({
      customer: order.customer.name,
      email: order.customer.email,
      description:
        order.customer.name + " contact information is " + order.customer.phone,
      metadata: {
        // customerId: customerDataFromDB._id,
        // order: order
      },
      source: id,
    });
    // console.log(customer);
    console.log("OBJECT OBJECT");
    const response = await Stripe.charges.create(
      {
        amount: order.total * 100,
        currency: "USD",
        customer: customer.id,
        receipt_email: customer.email,
        description:
          order.customer.name +
          " purchased items of " +
          order.total +
          "USD from " +
          order.vendor.name,
        shipping: {
          name: "Brand is " + brand,
          address: {
            line1: "Funded By " + funding,
            country: "Card from " + country,
          },
        },
      },
      { idempotencyKey: uuid4() }
    );

    console.log("Response Sent");
    if (!response) {
      res.send({ type: "failure", result: "Server Not Responding" });
      return;
    } else {
      const result = await Order.findByIdAndUpdate(orderId, {
        $set: { paid: true, orderStatus: "pending", paymentMethod: "Stripe" },
      });
      const order = await Order.findById(orderId)
        .populate("customer")
        .populate("vendor");

      if (!result) {
        res.status(500).json({
          type: "failure",
          result: "Server not Responding. Try Again",
        });
        return;
      }
      res.send({
        type: "Success",
        result: "Payment Transaction Made Succesfully",
      });
      return;
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ type: "failure", result: "Server Not Responding " + error });
  }
};
