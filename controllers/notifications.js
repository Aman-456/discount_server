const Notification = require("../models/notifications");
const Customer = require("../models/customer");
const Order = require("../models/orders");
const Vendor = require("../models/vendor");
const Firebase = require("../firebase/firebase");
const mongoose = require("mongoose");
const { MakeTransaction } = require("./../externals/stripe");
const schedule = require("node-schedule");
const moment = require("moment");
const item = require("../models/item");

const ObjectId = mongoose.Types.ObjectId;
const {
  OrderAcceptVoucherWeb,
  OrderAcceptVoucherMobile,
} = require("./functions/OrdersAcceptVoucher");

exports.GetNotificationsByVendor = async (req, res) => {
  try {
    const vendorId = req.query.vendorId;
    const notifications = await Notification.find({
      vendor: vendorId,
      readStatus: false,
    })
      .populate("customer")
      .populate("order")
      .sort([["createdAt", -1]]);
    res.status(200).json({ type: "success", result: notifications });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.OrderAcceptOrReject = async (req, res) => {
  try {
    const vendorId = req.query.vendorId;
    console.log("object" + vendorId);

    const notifyId = req.query.notifyId;
    const action = req.query.action;
    const orderId = req.query.orderId;
    let oldVendor = await Vendor.findById(vendorId);

    //From Website
    if (notifyId) {
      const notification = await await Notification.findById(notifyId)
        .populate("customer")
        .populate("vendor")
        .populate("order");
      console.log(notification.readStatus);
      if (notification.readStatus) {
        const notifications = await Notification.find({
          vendor: vendorId,
          readStatus: false,
        })
          .populate("customer")
          .sort([["createdAt", 1]])
          .limit(6);
        res.status(200).json({ type: "success", result: notifications });
        return;
      }
      if (action === "Accepted") {
        console.log("inside");
        console.log(notification.order.type);
        const n = new Notification({
          vendor: notification.vendor._id,
          customer: notification.customer._id,
          sentBy: "vendor",
          type: "order",
          text:
            notification.vendor.name +
            " Accepted Your Order. Preparing Your Order",
          order: notification.order,
          readStatus: true,
        });
        n.save();
        var result = await Customer.findById(notification.customer._id);
        result.newNotification = true;
        await result.save();
        const transactionDetail = notification.order.transaction;
        console.log("wow");
        console.log(transactionDetail);
        if (transactionDetail === undefined) {
          return OrderAcceptVoucherWeb(
            vendorId,
            orderId,
            oldVendor,
            notification,
            n,
            res
          );
        }
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

            const job = schedule.scheduleJob(
              jobId,
              newDate.toDate(),
              async () => {
                const orderCancel = await Order.findOne({
                  _id: notification.order._id,
                });
                if (orderCancel) {
                  if (orderCancel.orderStatus === "rejected") {
                    return;
                  } else {
                    charge = await MakeTransaction(
                      oldVendor.stripe_account,
                      transactionDetail.customer,
                      transactionDetail.amount * 100,
                      transactionDetail.currency,
                      transactionDetail.description,
                      transactionDetail.email,
                      transactionDetail.source,
                      { message: "This is the MetaData" }
                    );

                    console.log("Status " + charge.status);
                    if (charge.status !== "succeeded") {
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
                            chargeId: charge.id,
                          },
                        }
                      );
                    }
                    if (charge.status === "succeeded") {
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
                            chargeId: charge.id,
                          },
                        }
                      );
                    }
                  }
                }
              }
            );
          } else {
            charge = await MakeTransaction(
              oldVendor.stripe_account,
              transactionDetail.customer,
              transactionDetail.amount * 100,
              transactionDetail.currency,
              transactionDetail.description,
              transactionDetail.email,
              transactionDetail.source,
              { message: "This is the MetaData" }
            );
            console.log("Status " + charge.status);
            if (charge.status !== "succeeded") {
              await Firebase.Notify(
                "Order has been cancelled from " + notification.vendor.name,
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
                    chargeId: charge.id,
                  },
                }
              );
            }
            if (charge.status === "succeeded") {
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
                    chargeId: charge.id,
                  },
                }
              );
            }
          }
          ////////////////////END PRE ORDER/////////////////////////////
        } else {
          charge = await MakeTransaction(
            oldVendor.stripe_account,
            transactionDetail.customer,
            transactionDetail.amount * 100,
            transactionDetail.currency,
            transactionDetail.description,
            transactionDetail.email,
            transactionDetail.source,
            { message: "This is the MetaData" }
          );
          console.log("Status " + charge.status);

          if (charge.status !== "succeeded") {
            await Firebase.Notify(
              "Order has been cancelled from " + notification.vendor.name,
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
                  chargeId: charge.id,
                },
              }
            );
          }
          if (charge.status === "succeeded") {
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
            const response2 = await Order.findByIdAndUpdate(
              notification.order._id,
              {
                $set: {
                  orderStatus: "accepted",
                  paid: true,
                  chargeId: charge.id,
                },
              }
            );
          }
        }
      } else {
        //Delete Rejected Order Here
        const orderId = req.query.orderId;
        const n = new Notification({
          vendor: notification.vendor._id,
          customer: notification.customer._id,
          sentBy: "vendor",
          type: "order",
          text: notification.vendor.name + " Rejected Your Order Request",
          order: notification.order._id,
          readStatus: true,
        });
        n.save();
        var result = await Customer.findById(notification.customer._id);
        result.newNotification = true;
        await result.save();
        // await Order.findByIdAndDelete(orderId);
        const response1 = await Notification.findByIdAndUpdate(
          notification._id,
          {
            $set: { readStatus: true },
          }
        );
        await Firebase.Notify(
          notification.vendor.name + " Rejected Your Order Request",
          "Service Not Available",
          notification.customer.fcmToken,
          "customer"
        );
        const response3 = await Order.findByIdAndUpdate(
          notification.order._id,
          { $set: { orderStatus: "rejected" } }
        );
      }
      const notifications = await Notification.find({
        vendor: vendorId,
        readStatus: false,
      })
        .populate("customer")
        .sort([["createdAt", 1]])
        .limit(6);
      res.status(200).json({ type: "success", result: notifications });
    }
    //From Mobile
    else {
      console.log("Mobile");
      const response = await Notification.find({
        order: mongoose.Types.ObjectId(orderId),
      }).populate("order");
      const notify = response[0];

      const notification = await Notification.findById(notify._id)
        .populate("customer")
        .populate("vendor")
        .populate("order");
      console.log("Read Status" + notification.readStatus);
      if (notification.readStatus) {
        const notifications = await Notification.find({
          vendor: vendorId,
          readStatus: false,
        })
          .populate("customer")
          .sort([["createdAt", 1]])
          .limit(6);
        res.status(200).json({ type: "success", result: notifications });
        return;
      }
      console.log("Mobile " + response);

      // console.log(response);

      const response1 = await Notification.findByIdAndUpdate(notification._id, {
        $set: { readStatus: true },
      });
      if (action === "Accepted") {
        console.log("Mobile1");
        const n = new Notification({
          vendor: notification.vendor._id,
          customer: notification.customer._id,
          sentBy: "vendor",
          type: "order",
          text: notification.vendor.name + " Accepted Your Order Request",
          order: notification.order,
          readStatus: true,
        });
        n.save();
        var result = await Customer.findById(notification.customer._id);
        result.newNotification = true;
        await result.save();
        const transactionDetail = notification.order.transaction;
        if (transactionDetail === undefined) {
          return OrderAcceptVoucherMobile(
            vendorId,
            orderId,
            oldVendor,
            notification,
            n,
            res
          );
        }
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
                charge = await MakeTransaction(
                  oldVendor.stripe_account,
                  transactionDetail.customer,
                  transactionDetail.amount * 100,
                  transactionDetail.currency,
                  transactionDetail.description,
                  transactionDetail.email,
                  transactionDetail.source,
                  { message: "This is the MetaData" }
                );
                console.log("Status " + charge.status);
                if (charge.status !== "succeeded") {
                  await Firebase.Notify(
                    "Order has been cancelled from " + notification.vendor.name,
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
                        chargeId: charge.id,
                      },
                    }
                  );
                }
                if (charge.status === "succeeded") {
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
                        chargeId: charge.id,
                      },
                    }
                  );
                }
              }
            });
          } else {
            charge = await MakeTransaction(
              oldVendor.stripe_account,
              transactionDetail.customer,
              transactionDetail.amount * 100,
              transactionDetail.currency,
              transactionDetail.description,
              transactionDetail.email,
              transactionDetail.source,
              { message: "This is the MetaData" }
            );
            console.log("Status " + charge.status);
            if (charge.status !== "succeeded") {
              await Firebase.Notify(
                "Order has been cancelled from " + notification.vendor.name,
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
                    chargeId: charge.id,
                  },
                }
              );
            }
            if (charge.status === "succeeded") {
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
                    chargeId: charge.id,
                  },
                }
              );
            }
          }
        } else {
          charge = await MakeTransaction(
            oldVendor.stripe_account,
            transactionDetail.customer,
            transactionDetail.amount * 100,
            transactionDetail.currency,
            transactionDetail.description,
            transactionDetail.email,
            transactionDetail.source,
            { message: "This is the MetaData" }
          );
          if (charge.status !== "succeeded") {
            await Firebase.Notify(
              "Order has been cancelled from " + notification.vendor.name,
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
                  chargeId: charge.id,
                },
              }
            );
          }
          if (charge.status === "succeeded") {
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
                  chargeId: charge.id,
                },
              }
            );
          }
        }
      } else {
        //Delete Rejected Order Here
        const orderId = req.query.orderId;
        const n = new Notification({
          vendor: notification.vendor._id,
          customer: notification.customer._id,
          sentBy: "vendor",
          type: "order",
          text: notification.vendor.name + " Rejected Your Order Request",
          order: notification.order,
          readStatus: true,
        });
        n.save();
        var result = await Customer.findById(notification.customer._id);
        result.newNotification = true;
        await result.save();

        // await Order.findByIdAndDelete(orderId);
        const notifyResponse = await Firebase.Notify(
          notification.vendor.name + " Rejected Your Order Request",
          "Service Not Available",
          notification.customer.fcmToken,
          "customer"
        );
        const response3 = await Order.findByIdAndUpdate(notification.order, {
          $set: { orderStatus: "rejected" },
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
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.SendTimeNotification = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const minutes = req.query.minutes;
    console.log("MInutes" + req.query.minutes);
    const order = await Order.findById(orderId)
      .populate("customer")
      .populate("items.item")
      .populate("vendor");
    const notTime = minutes.split(" ")[0];
    order.notifytime = notTime;
    await order.save();
    const notification = new Notification({
      vendor: order.vendor._id,
      customer: order.customer._id,
      minutes: req.query.minutes,
      sentBy: "vendor",
      type: "order",
      text:
        "Your order from " +
        order.vendor.name +
        " will be READY in " +
        minutes +
        " minutes",
      order: order._id,
      readStatus: true,
    });
    notification.save();
    var result = await Customer.findById(order.customer._id);
    result.newNotification = true;
    await result.save();
    await Firebase.Notify(
      "Message From " + order.vendor.name,
      order.customer.name +
        ", Your Order will be Ready in " +
        minutes +
        " Minutes",
      order.customer.fcmToken
    );
    res.status(200).json({ type: "success", result: "Notifications Sent" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetNotficationsForCustomer = async (req, res) => {
  try {
    const notifications = await Notification.find(
      { customer: req.query.customerId, sentBy: "vendor", readStatus: true },
      "text createdAt minutes"
    ).populate("vendor", "name address");
    console.log(notifications);
    res.status(200).json({ type: "success", result: notifications });
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};
exports.GetNotficationsForCustomerCount = async (req, res) => {
  try {
    const notifications = await Notification.find(
      { customer: req.query.customerId, sentBy: "vendor", readStatus: true },
      "text createdAt"
    ).count();
    // console.log("object" + notifications);
    res.status(200).json({ type: "success", result: notifications });
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};
exports.OrderCancel = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    console.log(orderId);
    const response3 = await Order.findByIdAndUpdate(orderId, {
      $set: { orderStatus: "rejected" },
    });
    console.log(response3);
    const vendor = await Order.findOne({ _id: orderId })
      .populate("vendor")
      .populate("customer");
    await Firebase.Notify(
      vendor.customer.name + " has cancelled the Pre Order",
      "Order cancelled",
      vendor.vendor.fcmToken,
      "vendor"
    );
    res
      .status(200)
      .json({ type: "success", result: "Order has been cancelled" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};
exports.TestNotification2 = async (req, res) => {
  var job = schedule.scheduledJobs;
  console.log(job);
  res.json("ok");
};
exports.TestNotification = async (req, res) => {
  // const date = new Date(2021, 10, 30, 10, 37, 0);
  await Firebase.NotifyTest(
    "vendor has cancelled the Preorder",
    "Reminder of cancel order",
    "eMBLlTUbQzOVGeldF9oYJr:APA91bFAU4yJjHDuTGTrXyAXqFvXNGHSlTefsmKl"
  );

  res.json("ok");
};

exports.TestOrderNotification = async (req, res) => {
  const response = await Order.findByIdAndUpdate("61b032c5ebb59a1ed00a8f99", {
    $set: { orderStatus: "delivered" },
  });

  const orders = await Order.findOne({ _id: "61b032c5ebb59a1ed00a8f99" })
    .populate("items.item")
    .populate("vendor", "name latitude longitude phone");
  console.log(orders);
  await Firebase.NotifyTest(
    "Asim has cancelled the Preorder",
    "Reminder of cancel order",
    "djQV6w3uRb-0fIhGBSazzQ:APA91bGOIfsnYapkwDpfggUtwQAunFNZk1PQHQIHNacCgmijXqw_olP6ZQIMdIwFWH8UWpdKMUv6fkil3fg_1-y-sVesB66dw9sa6rAyTvmEorVayYOCv0u9llG4v9lr07L0plbND4Y8",
    orders
  );
  // console.log(req.query.orderId);
  // console.log("order");
  // const order = await Order.findOne({ _id: req.query.orderId });
  // console.log(order);
  // const dat = moment(order.updatedAt).format("dddd, MMMM Do YYYY, h:mm:ss a");
  // const dat2 = moment(new Date()).format("dddd, MMMM Do YYYY, h:mm:ss a");
  // console.log(dat);
  // console.log(dat2);
  // const dat_date = moment(order.updatedAt);
  // const dat2_date = moment(new Date());
  // const dow = new Date(order.updatedAt);
  // // console.log(Math.abs(dat2_date.diff(dat_date) / 1000) % 60);
  // console.log(dat2_date.diff(dat_date, "seconds") % 60);
  res.json("ok report");
};
