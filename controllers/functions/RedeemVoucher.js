const EventVendors = require("../../models/eventVendors");
const Event = require("../../models/event");

const mongoose = require("mongoose");

const ObjectId = mongoose.Types.ObjectId;
exports.RedeemVoucherFunc = async (vendorId, voucher) => {
  try {
    const vendorEvents = await EventVendors.aggregate([
      { $match: { vendor: ObjectId(vendorId) } },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "event",
        },
      },
      { $project: { coupons: "$event.coupons", eventId: "$event._id" } },
      { $unwind: "$coupons" },
      { $unwind: "$coupons" },

      {
        $match: {
          "coupons.code": voucher,
        },
      },
    ]);
    const response = await Event.updateOne(
      {
        _id: vendorEvents[0].eventId[0],
        "coupons.code": voucher,
      },

      { $set: { "coupons.$.redeem": true } }
    );

    // if (!response) {
    //   res.status(500).json({
    //     type: "failure",
    //     result: "Server not Responding. Try Again",
    //   });
    //   return;
    // }

    // res.status(200).json({
    //   type: "success",
    //   result: "Successfully redeemed",
    //   data: vendorEvents,
    // });
  } catch (error) {
    console.log(error);
  }
};
