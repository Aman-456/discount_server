const { validationResult } = require("express-validator");
const Item = require("../models/item");
const Order = require("../models/orders");
const fs = require("fs");
const mongoose = require("../db/connect");
require("dotenv").config();

exports.AddItem = async (req, res) => {
  try {
    const item = new Item(req.body);

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

  } catch (error) {
    fs.unlinkSync(req.body.image);

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
    const itemId = req.body.id;
    const item = await Item.findOneAndDelete({ _id: itemId });
    if (!item) {
      res.status(500).json({
        type: "failure",
        result: "Server not Responding. Try Again",
      });
      return;
    }
    fs.unlinkSync(item.image);
    const items = await Item.find({
      vendor: req.body.vendor
    })
    res
      .status(200)
      .json({ type: "success", result: "Item Deleted Successfully", data: items });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
exports.GetItemsByVendor = async (req, res) => {
  try {
    const vendorId = req.body.vendor;
    const items = await Item.find(
      { vendor: vendorId },
    ).populate("vendor")

    if (items) {
      res.status(200).json({ type: "success", result: items });
    } else {
      res
        .status(200)
        .json({ type: "failure", result: "no items found" });
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
    const itemId = req.body.id;
    const item = await Item.findById(itemId);
    if (req.body.image)
      fs.unlinkSync(item.image);
    const response = await Item.findByIdAndUpdate(itemId, { $set: req.body });
    if (!response) {
      res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
      return;
    }
    const items = await Item.find({
      vendor: req.body.vendor
    })
    res
      .status(200)
      .json({ type: "success", result: "Item Updated Successfully", data: items });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};



