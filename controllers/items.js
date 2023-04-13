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

    if (fs.existsSync(req.body.image)) {
      fs.unlinkSync(req.body.image);
      console.log(`${req.body.image} deleted successfully`);
    } else {
      console.log(`${req.body.image} does not exist`);
    }

    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetItem = async (req, res) => {
  try {
    const itemId = req.body.id;
    const item = await Item.findById(itemId);
    const relative = await Item.find({
      $or: [
        { category: item.category },
        { name: { $regex: item.name, $options: 'i' } }
      ],
      _id: { $ne: item._id }
    }).populate("vendor")

    res.status(200).json({ type: "success", result: item, relative });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
exports.GetLatest6 = async (req, res) => {
  try {
    const item = await Item.find({})
      .sort({ $natural: -1 })
      .populate("vendor");

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
    if (fs.existsSync(item.image)) {
      fs.unlinkSync(item.image);
      console.log(`${item.image} deleted successfully`);
    } else {
      console.log(`${item.image} does not exist`);
    }

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
    )
      .populate("vendor")
      .sort({ $natural: -1 })


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
exports.GetFeaturedProducts = async (req, res) => {
  try {

    // Get a random selection of 16 items
    const items = await Item.aggregate([
      { $sample: { size: 16 } }
    ]);
    return res.json({ type: "success", result: items });

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
      if (fs.existsSync(item.image)) {
        fs.unlinkSync(item.image);
        console.log(`${item.image} deleted successfully`);
      } else {
        console.log(`${item.image} does not exist`);
      }
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

exports.GetAll = async (req, res) => {
  try {
    const item = await Item.find({})
      .sort({ $natural: -1 })
      .populate("vendor")
    res
      .status(200)
      .json({ type: "success", result: "Item Updated Successfully", data: item });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};



