const Event = require("../models/event");
const EventVendors = require("../models/eventVendors");
var voucher_codes = require("voucher-code-generator");
const { validationResult } = require("express-validator");
const { RedeemVoucherFunc } = require("./functions/RedeemVoucher");
const mongoose = require("mongoose");
const moment = require("moment");
const { arrayEquals } = require("./functions/CheckArrayEqual");
const ObjectId = mongoose.Types.ObjectId;

exports.AddEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    event.completeStatus = true;
    event.image = req.files.image[0].path;
    event.imageCover = req.files.imageCover[0].path;
    event.voucher = req.body.voucher;

    if (req.body.voucher === "yes") {
      var dataDates = req.body.dates;
      const dates = dataDates.split(",");
      event.count = req.body.count;
      event.discount = req.body.discount;
      event.dates = dates;
      var dataAry = [];
      const myPromise = new Promise(async (resolve, reject) => {
        for (let i = 0; i < dates.length; i++) {
          const data = voucher_codes.generate({
            prefix: `${moment(dates[i], "YYYY-MM-DD").format("ddd")}-`,
            length: 6,
            count: parseInt(req.body.count),
          });
          const wow = await data.map((item, key) => ({
            code: item,
            redeem: false,
            discount: req.body.discount,
            date: new Date(dates[i]),
          }));
          dataAry = dataAry.concat(wow);
        }

        resolve(dataAry);
      });
      myPromise.then(async (item) => {
        event.coupons = item;
      });
    }
    const errors = validationResult(req);
    if (errors.errors.length != 0) {
      await fs.unlinkSync(event.image);
      res.json({ type: "failure", result: errors.errors[0].msg });
      return;
    } else {
      const response = await event.save();
      if (!response) {
        res.status(500).json({
          type: "failure",
          result: "Server not Responding. Try Again",
        });
        return;
      }
      res.status(200).json({
        type: "success",
        result: "Event Added Successfully",
        id: event._id,
      });
    }
  } catch (error) {
    console.log("Error :", error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
exports.EditEvent = async (req, res) => {
  try {
    // const event = new Event(req.body);

    // event.completeStatus = true;
    // event.image = req.files.image[0].path;
    // event.imageCover = req.files.imageCover[0].path;
    const eventDetails = req.body;
    if (req.files.image) {
      eventDetails.image = req.files.image[0].path;
    } else {
      delete eventDetails.image;
    }
    if (req.files.imageCover) {
      eventDetails.imageCover = req.files.imageCover[0].path;
    } else {
      delete eventDetails.imageCover;
    }
    const e = await Event.findById(eventDetails.id);
    console.log(e.dates);
    console.log("e.dates");
    var dates;
    var generateCode = false;
    if (e.dates.length === 0 && req.body.voucher === "yes") {
      console.log("1");
      var dataDates = req.body.dates;
      dates = dataDates.split(",");
      generateCode = true;
    }
    if (e.dates.length !== 0 && req.body.voucher === "yes") {
      console.log("2");
      var dataDates = req.body.dates;
      dates = dataDates.split(",");
      const checkDates = await arrayEquals(e.dates, dates);
      if (checkDates !== true) {
        generateCode = true;
      } else {
        eventDetails.dates = dates;
      }
    }

    if (generateCode) {
      console.log("nice");

      eventDetails.count = req.body.count;
      eventDetails.discount = req.body.discount;
      eventDetails.dates = dates;
      var dataAry = [];
      const myPromise = new Promise(async (resolve, reject) => {
        for (let i = 0; i < dates.length; i++) {
          const data = voucher_codes.generate({
            prefix: `${moment(dates[i], "YYYY-MM-DD").format("ddd")}-`,
            length: 6,
            count: parseInt(req.body.count),
          });
          const aryStore = await data.map((item, key) => ({
            code: item,
            redeem: false,
            discount: req.body.discount,
            date: new Date(dates[i]),
          }));
          dataAry = dataAry.concat(aryStore);
        }

        resolve(dataAry);
      });

      myPromise.then(async (item) => {
        eventDetails.coupons = item;
        const response = await Event.findByIdAndUpdate(eventDetails.id, {
          $set: eventDetails,
        });
        if (!response) {
          res.status(500).json({
            type: "failure",
            result: "Server not Responding. Try Again",
          });
          return;
        }

        return res
          .status(200)
          .json({ type: "success", result: "Event Updated Successfully" });
      });
    } else {
      const response = await Event.findByIdAndUpdate(eventDetails.id, {
        $set: eventDetails,
      });
      if (!response) {
        res.status(500).json({
          type: "failure",
          result: "Server not Responding. Try Again",
        });
        return;
      }

      return res
        .status(200)
        .json({ type: "success", result: "Event Updated Successfully" });
    }
  } catch (error) {
    console.log("Error :", error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.DeleteEvents = async (req, res) => {
  console.log("Events Id" + req.query.eventId);
  console.log("Events Idasddddd");

  try {
    const vendorId = req.query.eventId;
    await Event.findByIdAndDelete(vendorId);
    const events = await Event.find();
    res.status(200).json({ type: "success", result: events });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
exports.GetEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({ type: "success", result: events });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetEvent = async (req, res) => {
  try {
    const event = await EventVendors.aggregate([
      {
        $match: { event: mongoose.Types.ObjectId(req.query.eventId) },
      },
      {
        $group: {
          _id: { event: mongoose.Types.ObjectId(req.query.eventId) },
          totalTraders: { $sum: 1 },
          traders: { $addToSet: "$vendor" },
        },
      },
      {
        $project: {
          _id: 0,
          event: "$_id.event",
          totalTraders: 1,
          traders: 1,
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      {
        $unwind: "$event",
      },
      {
        $lookup: {
          from: "vendors",
          localField: "traders",
          foreignField: "_id",
          as: "vendors",
        },
      },
      {
        $project: {
          totalTraders: 0,
          traders: 0,
        },
      },
    ]);
    if (event.length !== 0) {
      res.status(200).json({ type: "success", result: event[0] });
      return;
    } else {
      const e = await Event.findById(req.query.eventId);

      res.status(200).json({ type: "success", result: e });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.AddVendorToEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.body.eventId);

    if (!event) {
      res.json({ type: "failure", result: "Event Does not Exist" });
      return;
    }
    const vendorEvent = await EventVendors.findOne({
      event: req.body.eventId,
      vendor: req.body.vendorId,
    });
    if (vendorEvent) {
      res.json({
        type: "failure",
        result: "You are already member of this event",
      });
      return;
    }
    const vendors = await EventVendors.find({
      event: req.body.eventId,
    }).populate("vendor", "hide");

    const filterVendors = vendors.filter((item) => {
      return item.vendor.hide === false;
    });

    if (event.capacity === filterVendors.length) {
      res.json({ type: "failure", result: "Capcity of Vendor is Full" });
      return;
    }
    const eventVendor = new EventVendors({
      event: req.body.eventId,
      vendor: req.body.vendorId,
    });
    const document = await eventVendor.save();
    console.log(document);

    if (document) {
      res.status(200).json({
        type: "success",
        result: "You successfully added into the Event",
      });
      return;
    } else {
      res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
    }
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.UpdateLocation = async (req, res) => {
  try {
    const { address, latitude, longitude, completeStatus, eventId } = req.body;
    const response = await Event.findByIdAndUpdate(eventId, {
      $set: {
        address: address,
        latitude: latitude,
        longitude: longitude,
        completeStatus: completeStatus,
      },
    });
    if (!response) {
      res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
      return;
    }
    res.status(200).json({
      type: "success",
      result: "Location Updated Successfully for Event",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
exports.RedeemVoucher = async (req, res) => {
  try {
    const vendorEvents = await EventVendors.aggregate([
      { $match: { vendor: ObjectId(req.body.vendorId) } },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      { $project: { coupons: "$event.coupons" } },
      { $unwind: "$coupons" },
      { $unwind: "$coupons" },

      {
        $match: {
          $and: [
            { "coupons.code": req.body.coupon },
            { "coupons.date": new Date(req.body.date) },
          ],
        },
      },
    ]);

    if (vendorEvents.length !== 0) {
      if (vendorEvents[0].coupons.redeem === true) {
        return res.status(200).json({
          type: "redeemed",
          result: "Coupon has already been redeemed",
        });
      }
      const discount = parseInt(vendorEvents[0].coupons.discount);
      // console.log(discount);

      const calculateDiscount = (discount / 100) * parseFloat(req.body.price);
      // console.log(calculateDiscount);
      const calculatePrice = req.body.price - calculateDiscount;
      // console.log(calculatePrice);

      return res.status(200).json({
        type: "success",
        result: "Discount successfully applied",
        data: vendorEvents,
        price: calculatePrice,
      });
    }
    res.status(200).json({
      type: "fail",
      result: "Voucher not found",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.CreateVoucher = async (req, res) => {
  try {
    var dates = [
      new Date("2/7/2022"),
      new Date("3/8/2022"),
      new Date("4/8/2022"),
    ];

    var dataAry = [];
    const myPromise = new Promise(async (resolve, reject) => {
      for (let i = 0; i < dates.length; i++) {
        const data = voucher_codes.generate({
          prefix: `${moment(dates[i], "YYYY-MM-DD").format("ddd")}-`,
          length: 6,
          count: 2000,
        });
        const wow = await data.map((item, key) => ({
          code: item,
          redeem: false,
          date: dates[i],
        }));
        dataAry = dataAry.concat(wow);
      }

      resolve(dataAry);
    });
    myPromise.then(async (item) => {
      res.status(200).json({
        type: "success",
        result: "Voucher Created Successfully for Event",
        data: item,
      });
    });

    // const wow = await data.map((item, i) => ({ code: item, redeem: false }));
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.RedeemVoucherCheck = async (req, res) => {
  try {
    RedeemVoucherFunc(req.body.vendorId, req.body.coupon);
  } catch (Error) {
    console.log(Error);
  }
};
