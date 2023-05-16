const CheckOut = require("../models/checkout");
const Cart = require("../models/cart");
const User = require("../models/customer");
const nodemailer = require("nodemailer");

var handlebars = require("handlebars");
var fs = require("fs");
const path = require("path")

// Add item to cart
exports.addItem = async (req, res) => {
  try {
    const { customer, items, total, card } = req.body;
    const user = await User.findOne({ _id: customer })
    const newCheckout = new CheckOut({
      customer,
      items,
      total,
      card
    });

    const data = await newCheckout.save();
    if (data) {
      await Cart.findOneAndDelete({ customer })
      await sendEmail(user?.email, user, res)
    }

  } catch (error) {

    console.error(error);
    res.status(500).json({ type: "failure", result: "An error occurred" });
  }
};

// Delete item from cart
exports.deleteItem = async (req, res) => {
  try {
    const { customerId, itemId } = req.body;
    const checkout = await CheckOut.findOneAndUpdate(
      { customer: customerId },
      { $pull: { items: { item: itemId } } },
      { new: true }
    );
    if (!checkout) {
      return res
        .status(404)
        .json({ type: "success", result: "Cart or item not found" });
    }
    res
      .status(200)
      .json({ type: "success", result: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: "failure" });
  }
};

// Get cart details
exports.getCheckout = async (req, res) => {
  try {
    const { customerId } = req.query;
    const checkout = await CheckOut.findOne({ customer: customerId })
      .populate("items.item", "name price image")
      .sort({ $natural: -1 });
    var total = 0;
    for (const item of checkout.items) {
      total += item.quantity * item.item.price;
    }
    if (!checkout) {
      return res.status(404).json({ type: "Cart not found" });
    }
    res
      .status(200)
      .json({ result: { items: checkout.items, total }, type: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: "An error occurred" });
  }
};


var readHTMLFile = function (path, callback) {
  fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
    if (err) {
      callback(err);
      throw err;
    } else {
      callback(null, html);
    }
  });
};


async function sendEmail(email, user, res) {
  try {
    const transporter = await nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: `${process.env.EMAIL_ADDRESS}`,
        pass: `${process.env.APP_PASS || process.env.EMAIL_PASSWORD}`,
      },
    });
    // const URL = `https://discountbazar.netlify.app/customer/verify?token=${user._id} `;
    const host = process.env.HOST !== "localhost" ? `https://${process.env.HOST$}${process.env.PORT || 5000}` : `http://localhost`;
    const URL = host;
    readHTMLFile(
      "./templates/orderplaced.html",
      async function (err, html) {
        var template = handlebars.compile(html);
        var replacements = {
          name: user.name,
          link: URL,
        };
        var htmlToSend = template(replacements);

        const mailOptions = {
          from: `${process.env.EMAIL_ADDRESS} `,
          to: email,
          subject: "Order Placed Successfully!",
          html: htmlToSend,
        };

        await transporter.verify();

        //Send Email
        transporter.sendMail(mailOptions, async (err, response) => {
          if (err) {
            res
              .status(500)
              .json({ type: "failure", result: "Server Not Responding" });
            return;
          } else {

            res.status(200).json({
              type: "success",
              result: "Your order has been placed!",
            });
          }
        });
      }
    );
  } catch (error) {
    console.log(error + "error");
  }
}