const Notification = require("../../models/notifications");
const Customer = require("../../models/customer");
const Order = require("../../models/orders");
const Vendor = require("../../models/vendor");
const Firebase = require("../../firebase/firebase");
const mongoose = require("mongoose");

const schedule = require("node-schedule");
const moment = require("moment");
const item = require("../../models/item");
const ObjectId = mongoose.Types.ObjectId;

exports.OrderAcceptVoucherWeb = async (
  vendorId,
  orderId,
  oldVendor,
  notification,
  n,
  res
) => {
  try {
    let charge;
    if (notification.order.type === "preorder") {
      const date = new Date(
        notification.order.date.year,
        notification.order.date.month - 1,
        notification.order.date.day,
        notification.order.time.hours,
        notification.order.time.minutes,
        0
      );
      const newDate = moment(date);
      // newDate.subtract(2, "days");
      const isAfter = newDate.isAfter(new moment());
      console.log(isAfter);
      if (isAfter) {
        await Firebase.Notify(
          notification.vendor.name + " Accepted Your Order",
          "Pre Order Completed",
          notification.customer.fcmToken,
          "customer"
        );

        const response135 = await Notification.findByIdAndUpdate(
          notification._id,
          {
            $set: { readStatus: true },
          }
        );

        const response205 = await Order.findByIdAndUpdate(
          notification.order._id,
          {
            $set: {
              orderStatus: "scheduled",
            },
          }
        );
        const jobId = notification.order._id.toString();

        const job = schedule.scheduleJob(jobId, newDate.toDate(), async () => {
          const orderCancel = await Order.findOne({
            _id: notification.order._id,
          });
          if (orderCancel) {
            if (orderCancel.orderStatus === "rejected") {
              return;
            } else {
              await Firebase.Notify(
                "Pre Order Reminder from " + notification.vendor.name,
                "Transaction has been declined!",
                notification.customer.fcmToken,
                "customer"
              );

              const response20 = await Order.findByIdAndUpdate(
                notification.order._id,
                {
                  $set: {
                    orderStatus: "rejected",
                    paid: false,
                  },
                }
              );

              const response12 = await Notification.findByIdAndUpdate(
                notification._id,
                {
                  $set: { readStatus: true },
                }
              );
              await Firebase.Notify(
                "Pre Order Reminder from " + notification.vendor.name,
                "Reminder of Pre Order",
                notification.customer.fcmToken,
                "customer"
              );
              await Firebase.Notify(
                "Pre Order Reminder of " + notification.customer.name,
                "Reminder of Pre Order",
                notification.vendor.fcmToken,
                "vendor"
              );
              const response2 = await Order.findByIdAndUpdate(
                notification.order._id,
                {
                  $set: {
                    orderStatus: "accepted",
                    paid: true,
                  },
                }
              );
            }
          }
        });
      } else {
        const response14 = await Notification.findByIdAndUpdate(
          notification._id,
          {
            $set: { readStatus: true },
          }
        );
        await Firebase.Notify(
          notification.vendor.name + " Accepted Your Order",
          "Preparing Your Order",
          notification.customer.fcmToken,
          "customer"
        );
        const response2 = await Order.findByIdAndUpdate(
          notification.order._id,
          {
            $set: {
              orderStatus: "accepted",
              paid: true,
            },
          }
        );
      }
      ////////////////////END PRE ORDER/////////////////////////////
    } else {
      const response13 = await Notification.findByIdAndUpdate(
        notification._id,
        {
          $set: { readStatus: true },
        }
      );
      await Firebase.Notify(
        notification.vendor.name + " Accepted Your Order",
        "Preparing Your Order",
        notification.customer.fcmToken,
        "customer"
      );
      const response2 = await Order.findByIdAndUpdate(notification.order._id, {
        $set: {
          orderStatus: "accepted",
          paid: true,
        },
      });
    }
    const notifications = await Notification.find({
      vendor: vendorId,
      readStatus: false,
    })
      .populate("customer")
      .sort([["createdAt", 1]])
      .limit(6);
    res.status(200).json({ type: "success", result: notifications });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
exports.OrderAcceptVoucherMobile = async (
  vendorId,
  orderId,
  oldVendor,
  notification,
  n,
  res
) => {
  try {
    let charge;
    if (notification.order.type === "preorder") {
      const date = new Date(
        notification.order.date.year,
        notification.order.date.month - 1,
        notification.order.date.day,
        notification.order.time.hours,
        notification.order.time.minutes,
        0
      );
      const newDate = moment(date);
      newDate.subtract(2, "days");

      const isAfter = newDate.isAfter(new moment());
      console.log("Is After" + isAfter);

      if (isAfter) {
        await Firebase.Notify(
          notification.vendor.name + " Accepted Your Order",
          "Pre Order Completed",
          notification.customer.fcmToken,
          "customer"
        );
        const response205 = await Order.findByIdAndUpdate(
          notification.order._id,
          {
            $set: {
              orderStatus: "scheduled",
            },
          }
        );
        const job = schedule.scheduleJob(newDate.toDate(), async () => {
          const orderCancel = await Order.findOne({
            _id: notification.order._id,
          });
          if (orderCancel.orderStatus === "rejected") {
            return;
          } else {
            await Firebase.Notify(
              "Pre Order Reminder from " + notification.vendor.name,
              "Reminder of Pre Order",
              notification.customer.fcmToken,
              "customer"
            );
            await Firebase.Notify(
              "Pre Order Reminder of " + notification.customer.name,
              "Reminder of Pre Order",
              notification.vendor.fcmToken,
              "vendor"
            );
            const response2 = await Order.findByIdAndUpdate(
              notification.order._id,
              {
                $set: {
                  orderStatus: "accepted",
                  paid: true,
                },
              }
            );
          }
        });
      } else {
        await Firebase.Notify(
          notification.vendor.name + " Accepted Your Order",
          "Preparing Your Order",
          notification.customer.fcmToken,
          "customer"
        );
        const response2 = await Order.findByIdAndUpdate(
          notification.order._id,
          {
            $set: {
              orderStatus: "accepted",
              paid: true,
            },
          }
        );
      }
    } else {
      await Firebase.Notify(
        notification.vendor.name + " Accepted Your Order",
        "Preparing Your Order",
        notification.customer.fcmToken,
        "customer"
      );
      const response2 = await Order.findByIdAndUpdate(notification.order._id, {
        $set: {
          orderStatus: "accepted",
          paid: true,
        },
      });
      const notifications = await Notification.find({
        vendor: vendorId,
        readStatus: false,
      })
        .populate("customer")
        .sort([["createdAt", 1]])
        .limit(6);
      res.status(200).json({ type: "success", result: notifications });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
