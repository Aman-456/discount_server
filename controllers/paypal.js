const paypal = require("paypal-rest-sdk");
const Order = require("../models/orders");
const Firebase = require("../firebase/firebase");
require("dotenv").config();

paypal.configure({
    'mode': process.env.PAYPAL_MODE,
    "client_id": process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

exports.PaypalPayment = async (req, res) => {
    try {
        var orderID = req.body.orderId;
        const order = await Order.findById(orderID).populate('items.item').populate('customer').populate('vendor');

        let items = order.items;
        //Making Paypal Items Response
        items = await order.items.map((item) => {
            let paypalObject = {};
            paypalObject.quantity = item.quantity;
            paypalObject.name = item.item.name;
            paypalObject.price = (1 - (item.item.discount / 100)) * item.item.price;
            paypalObject.currency = "USD";
            paypalObject.sku = "item";
            delete item.item;
            return paypalObject;
        });
        var create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": process.env.API_KEY + "/order/success?total=" + order.total + "&orderId=" + order._id,
                "cancel_url": process.env.API_KEY + "/order/cancel?orderId=" + order._id
            },
            "transactions": [{
                "item_list": {
                    "items": items
                },
                "amount": {
                    "currency": "USD",
                    "total": order.total

                },
                "description": "Customer Order"
            }]
        };
        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.log(error.response.details);
            } else {
                console.log("Sending Payment Response");
                res.json({ type: "success", result: payment.links[1].href });
            }
        });
    } catch (error) {
        console.log(error);
    }
}

exports.SuccessPaypal = async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const orderId = req.query.orderId;
    const execute_payment_json = {
        payer_id: payerId,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: req.query.total,
                },
            },
        ],
    };
    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
        if (error) {
            console.log(error);
            console.log(error.response);
            res.send("Payment Unsuccessfull");
            // throw error;
        } else {
            const response = await Order.findByIdAndUpdate(orderId, { $set: { paid: true, orderStatus: "pending", paymentMethod: "Paypal" } });
            const order = await Order.findById(orderId).populate('customer').populate('vendor');
            await Firebase.Notify("Order Checked Out", "You can start Cooking !", order.vendor.fcmToken);

            if (!response) {
                res.status(500).json({ "type": "failure", "result": "Server not Responding. Try Again" });
                return;
            }
            var responseHTML = `<html>
                            <head><title>Response</title></head>
                            <body>Payment Successfull</body>
                            <script>
                                window.ReactNativeWebView.postMessage("success");
                                window.close();
                            </script>
                        </html>`;
            res.send(responseHTML);
        }
    });
}

exports.CancelPaypal = async (req, res) => {
    // const orderId = req.query.orderId;
    // const response = await Order.findByIdAndDelete(orderId);
    if (!response) {
        res.status(500).json({ "type": "failure", "result": "Server not Responding. Try Again" });
        return;
    }
    var responseHTML = `<html>
                            <head><title>Response</title></head>
                            <body>Payment UnSuccessfull</body>
                            <script>
                                window.ReactNativeWebView.postMessage("Fail");
                                window.close();
                            </script>
                        </html>`;
    res.send(responseHTML);
}

