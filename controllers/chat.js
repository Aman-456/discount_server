const Chats = require("../models/chats");
const Customer = require("../models/customer");
const Order = require("../models/orders");
const Vendor = require("../models/vendor");
const Firebase = require("../firebase/firebase");
const mongoose = require("../db/connect");

exports.SendMessage = async (req, res) => {
  try {
    const data = req.body;
    var data_Chat;
    const chat = await Chats.find({
      customer: data.customer,
      vendor: data.vendor,
    });
    if (chat.length === 0) {
      const newChat = new Chats({
        customer: data.customer,
        vendor: data.vendor,
        messages: [{ by: data.from, text: data.text, read: true }],
      });
      await newChat.save();
      const vendor = await Vendor.findById(data.vendor);
      const customer = await Customer.findById(data.customer);
      const order = await Order.find({
        customer: customer._id,
        vendor: vendor._id,
        orderStatus: "accepted",
      })
        .limit(1)
        .sort({ $natural: -1 });
      data_Chat = { vendor: { _id: vendor._id } };
      if (data.from === "vendor") {
        await Firebase.NotifyCustomerChat(
          "Message From " + vendor.name,
          data.text,
          customer.fcmToken,
          data_Chat,
          order,
          vendor.name
        );
      }
      if (data.from === "customer") {
        console.log("Msg");
        const vendor = await Vendor.findById(data.vendor);
        vendor.newMessage = true;
        vendor.save();
        await Firebase.NotifyVendorChat(
          "Message From " + customer.name,
          data.text,
          vendor.fcmToken
        );
      }
      res.status(200).json({ type: "success", result: "Message Sent" });
    } else {
      const response = await Chats.findByIdAndUpdate(chat[0]._id, {
        $push: { messages: [{ by: data.from, text: data.text, read: true }] },
      });
      if (response) {
        const vendor = await Vendor.findById(data.vendor);
        const customer = await Customer.findById(data.customer);
        const order = await Order.find({
          customer: customer._id,
          vendor: vendor._id,
          orderStatus: "accepted",
        })
          .limit(1)
          .sort({ $natural: -1 });
        data_Chat = { vendor: { _id: vendor._id } };

        if (data.from === "vendor") {
          await Firebase.NotifyCustomerChat(
            "Message From " + vendor.name,
            data.text,
            customer.fcmToken,
            data_Chat,
            order,
            vendor.name
          );
        }
        if (data.from === "customer") {
          console.log("Msd Vendor");
          const vendor = await Vendor.findById(data.vendor);
          vendor.newMessage = true;
          vendor.save();
          await Firebase.NotifyVendorChat(
            "Message From " + customer.name,
            data.text,
            vendor.fcmToken
          );
        }
        res.status(200).json({ type: "success", result: "Message Sent" });
      } else {
        res.status(500).json({
          type: "failure",
          result: "Server not Responding. Try Again",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetAllChats = async (req, res) => {
  try {
    // console.log(req.body);
    const chats = await Chats.find({ vendor: req.body.vendorId })
      .populate("customer", "name")
      .sort({ updatedAt: 1 });
    res.status(200).json({ type: "success", result: chats });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetGet = async (req, res) => {
  try {
    const data = req.body;
    const chat = await Chats.find(
      { vendor: data.vendor, customer: data.customer },
      "messages"
    );
    res.status(200).json({ type: "success", result: chat });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
