const Order = require("../models/orders");
const Customer = require("../models/customer");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
exports.GetOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const order = await Order.findById(orderId).populate("items.item");
    res.status(200).json({ type: "success", result: order });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetAllOrder = async (req, res) => {
  try {
    const order = await Order.find({})
      .populate("items.item vendor customer")
      .sort({ $natural: -1 });
    res.status(200).json({ type: "success", result: order });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetUserOrders = async (req, res) => {
  try {
    const customerId = req.query.customerId;
    if (req.query.orderStatus === "pending") {
      const orders = await Order.find({
        customer: customerId,

        $or: [
          { orderStatus: "requested" },
          { orderStatus: "accepted" },
          { orderStatus: "scheduled" },
        ],
      })
        .populate("items.item")
        .populate("vendor", "name latitude longitude phone banner")
        .sort({ createdAt: -1 });
      // console.log("Ordersss " + orders);
      res.status(200).json({ type: "success", result: orders });
    } else {
      const orders = await Order.find({
        customer: customerId,
        orderStatus: req.query.orderStatus,
      })
        .populate("items.item")
        .populate("vendor", "name latitude longitude phone banner")
        .sort({ createdAt: -1 });
      res.status(200).json({ type: "success", result: orders });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetOrdersByVendorForWebsite = async (req, res) => {
  try {
    const vendorId = req.query.vendorId;
    const orders = await Order.aggregate([
      {
        $match: {
          vendor: ObjectId(vendorId),
          $or: [
            { orderStatus: "accepted" },
            { orderStatus: "delivered" },
            { orderStatus: "requested" },
            { orderStatus: "scheduled" },
          ],
        },
      },
      {
        $lookup: {
          from: "customers", // other table name
          localField: "customer", // name of users table field
          foreignField: "_id", // name of userinfo table field
          as: "customer", // alias for userinfo table
        },
      },
      { $unwind: "$customer" },
      {
        $lookup: {
          from: "notifications", // other table name
          localField: "_id", // name of users table field
          foreignField: "order", // name of userinfo table field
          as: "notification", // alias for userinfo table
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({ type: "success", result: orders });
  } catch (error) {
    console.log(error);
    // res
    //   .status(500)
    //   .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
exports.GetUserOrdersDelivered = async (req, res) => {
  try {
    const customerId = req.query.customerId;
    if (req.query.orderStatus === "pending") {
      const orders = await Order.find({
        customer: customerId,
        orderStatus: "delivered",
      })
        .populate("items.item")
        .populate("vendor", "name latitude longitude phone")
        .sort({ createdAt: -1 });
      // console.log("Ordersss " + orders);
      res.status(200).json({ type: "success", result: orders });
    } else {
      const orders = await Order.find({
        customer: customerId,
        orderStatus: req.query.orderStatus,
      })
        .populate("items.item")
        .populate("vendor", "name latitude longitude phone")
        .sort({ createdAt: -1 });
      res.status(200).json({ type: "success", result: orders });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetReviewsByVendor = async (req, res) => {
  try {
    const vendorId = req.query.vendorId;
    const orders = await Order.find(
      {
        vendor: vendorId,
        paid: true,
        orderStatus: "delivered",
        review: { $ne: null },
      },
      "review"
    ).populate("customer", "name");
    res.status(200).json({ type: "success", result: orders });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.UpdateOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const orderStatus = req.query.status;
    const response = await Order.findByIdAndUpdate(orderId, {
      $set: { orderStatus: orderStatus },
    });
    if (!response) {
      res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
      return;
    }
    return res
      .status(200)
      .json({ type: "success", result: "Order Updated Successfuly" });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetVendorByEarning = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $match: { orderStatus: "delivered", paid: true } },
      {
        $group: {
          _id: "$vendor",
          earning: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "_id",
          foreignField: "_id",
          as: "vendor",
        },
      },
    ]);
    res.status(200).json({ type: "success", result: result });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.OrderDelivered = async (req, res) => {
  try {
    const response = await Order.findByIdAndUpdate(req.query.orderId, {
      $set: { orderStatus: "delivered" },
    });
    const order = await Order.findById(req.query.orderId)
      .populate("customer")
      .populate("vendor")
      .sort({ $natural: -1 });
    if (!response) {
      return res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
    }


    var result = await Customer.findById(order.customer._id);
    result.newNotification = true;
    await result.save();

    const orders_data = await Order.findOne({ _id: req.query.orderId })
      .populate("items.item")
      .populate("vendor", "name latitude longitude phone banner");
    console.log(orders_data);


    const vendorId = req.query.vendorId;
    const orders = await Order.aggregate([
      {
        $match: {
          vendor: ObjectId(vendorId),
          $or: [
            { orderStatus: "accepted" },
            { orderStatus: "delivered" },
            { orderStatus: "requested" },
            { orderStatus: "scheduled" },
          ],
        },
      },
      {
        $lookup: {
          from: "customers", // other table name
          localField: "customer", // name of users table field
          foreignField: "_id", // name of userinfo table field
          as: "customer", // alias for userinfo table
        },
      },
      { $unwind: "$customer" },
      {
        $lookup: {
          from: "notifications", // other table name
          localField: "_id", // name of users table field
          foreignField: "order", // name of userinfo table field
          as: "notification", // alias for userinfo table
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({ type: "success", result: orders });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GiveReview = async (req, res) => {
  try {
    const { review, rating } = req.body;
    const response = await Order.findByIdAndUpdate(req.body.orderId, {
      $set: { review: { description: review, rating: rating } },
    });
    if (!response) {
      res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
    }
    const order = await Order.findById(req.body.orderId)
      .populate("customer")
      .populate("vendor");
    const n = new Notification({
      vendor: order.vendor._id,
      customer: order.customer._id,
      sentBy: "customer",
      type: "rating",
      text: "you have recieved new rating from " + order.customer.name,
      order: order._id,
      readStatus: false,
    });
    n.save();
    // var result = await Customer.findById(order.customer._id);
    // result.newNotification = true;
    // await result.save();
    res
      .status(200)
      .json({ type: "success", result: "Review Saved Successdfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetDeliveredOrdersByVendor = async (req, res) => {
  try {
    const vendorId = req.query.vendorId;
    const orders = await Order.find({
      vendor: vendorId,
      paid: true,
      orderStatus: "delivered",
    })
      .populate("customer", "name")
      .populate("items.item")
      .sort([["createdAt", -1]]);
    res.status(200).json({ type: "success", result: orders });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
