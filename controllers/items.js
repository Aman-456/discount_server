const { validationResult } = require("express-validator");
const Item = require("../models/item");
const Order = require("../models/orders");
const fs = require("fs");
const mongoose = require("../db/connect");
require("dotenv").config();

exports.AddItem = async (req, res) => {
  try {
    const item = new Item(req.body);
    item.status = "Accepted";
    const errors = validationResult(req);
    if (errors.errors.length != 0) {
      console.log(errors);
      fs.unlinkSync(item.image);
      res.json({ type: "failure", result: errors.errors[0].msg });
      return;
    } else {
      const response = await item.save();
      if (!response) {
        res.status(500).json({
          type: "failure",
          result: "Server not Responding. Try Again",
        });
        return;
      }
      res.status(200).json({
        type: "success",
        result: "Item added successfully",
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetItem = async (req, res) => {
  try {
    const itemId = req.query.itemId;
    const item = await Item.findById(itemId);
    res.status(200).json({ type: "success", result: item });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.DeleteItem = async (req, res) => {
  try {
    const itemId = req.query.itemId;
    console.log(itemId);
    const item = await Item.findOne({ _id: itemId });
    console.log(item);
    console.log(item.image);
    fs.unlinkSync(item.image);
    const response = await item.remove();
    if (!response) {
      res.status(500).json({
        type: "failure",
        result: "Server not Responding. Try Again",
      });
      return;
    }

    res
      .status(200)
      .json({ type: "success", result: "Item Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
exports.GetItemsByVendor = async (req, res) => {
  console.log("object");
  try {
    const vendorId = req.query.vendorId;
    const items = await Item.find(
      { vendor: vendorId, status: "Accepted" },
    );
    const average = await Order.aggregate([
      {
        $match: {
          review: { $ne: null },
          vendor: mongoose.Types.ObjectId(vendorId),
        },
      },
      { $group: { _id: "$vendor", average: { $avg: "$review.rating" } } },
    ]);
    if (average.length === 0) {
      res.status(200).json({ type: "success", result: items, average: 0 });
    } else {
      res
        .status(200)
        .json({ type: "success", result: items, average: average[0].average });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.UpdateItem = async (req, res) => {
  try {
    console.log(req.body);
    const itemId = req.query.itemId;
    const newItem = new Item(req.body);
    const item = await Item.findById(itemId);
    fs.unlinkSync(item.image);
    const response = await Item.findByIdAndUpdate(itemId, {
      $set: {
        name: newItem.name,
        price: newItem.price,
        category: newItem.category,
        description: newItem.description,
        image: newItem.image,
        soldOut: newItem.soldOut,
        discount: newItem.discount,
      },
    });
    if (!response) {
      res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
      return;
    }
    res
      .status(200)
      .json({ type: "success", result: "Item Updated Successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};




exports.UpdateItemWithoutImage = async (req, res) => {
  try {
    console.log(req.body);
    const newItem = new Item(req.body);
    const item = await Item.findById(newItem.id);
    const response = await Item.findByIdAndUpdate(item._id, {
      $set: {
        name: newItem.name,
        price: newItem.price,
        category: newItem.category,
        description: newItem.description,
        discount: newItem.discount,
        soldOut: newItem.soldOut,
      },
    });
    if (!response) {
      res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
      return;
    }
    res
      .status(200)
      .json({ type: "success", result: "Item Updated Successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};