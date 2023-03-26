const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const cors = require("cors");
const socket = require("socket.io");
const path = require("path");
const morgan = require("morgan");
const compression = require("compression");

const vendor = require("./routes/vendors");
const item = require("./routes/items");
const admin = require("./routes/admin");
const customer = require("./routes/customer");
const order = require("./routes/order");
const notification = require("./routes/notifications");
const chat = require("./routes/chat");
const application = require("./routes/application");
const messagebird = require("./routes/messagebird");
const OrderModal = require("./models/orders");
const VendorModal = require("./models/vendor");

const MySocket = require("./socket/socket");

const Order = require("./models/ordersFaker");

const faker = require("faker");
require("dotenv").config();
require("./db/connect");

app.use(cors());
app.use(compression());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});

const port = process.env.PORT || 3000;
const host = process.env.HOST;

// app.use(morgan('dev'));
app.use(function (req, res, next) {
    console.log("api: " + req.originalUrl);
    next();
});

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use("/assets", express.static("assets"));

app.use("/customer", customer.routes);
app.use("/vendor", vendor.routes);
app.use("/item", item.routes);
app.use("/admin", admin.routes);
app.use("/order", order.routes);
app.use("/notification", notification.routes);
app.use("/chat", chat.routes);
app.use("/application", application.routes);
app.use("/messagebird", messagebird.routes);

app.get("/test1", (req, res) => {
    for (i = 0; i < 300; i++) {
        let products = [];
        for (j = 0; j < 5; j++) {
            product = { color: faker.commerce.color() };
            products.push(product);
        }
        let order = new Order({
            total: parseInt(faker.commerce.price()),
            city: faker.commerce.color(),
            createdDate: faker.date.between(
                new Date("2010-01-01"),
                new Date("2022,6,28")
            ),
            vendor: faker.name.firstName(),
            items: products,
        });
        order.save();
    }
    res.send("Hello");
});

app.get("/test2/", async (req, res) => {
    const yearly = await OrderModal.aggregate([
        {
            $group: {
                _id: { $year: "$createdAt" },
                total: { $sum: "$total" },
            },
        },
        {
            $sort: {
                _id: 1,
            },
        },
        {
            $group: {
                _id: null,
                years: { $push: "$_id" },
                totals: { $push: "$total" },
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
    ]);
    const monthly = await OrderModal.aggregate([
        {
            $group: {
                _id: { $month: "$createdAt" },
                total: { $sum: "$total" },
            },
        },
        {
            $sort: {
                _id: 1,
            },
        },
        {
            $group: {
                _id: null,
                years: { $push: "$_id" },
                totals: { $push: "$total" },
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
    ]);
    const daily = await OrderModal.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
                },
            },
        },
        {
            $group: {
                _id: { $dayOfMonth: "$createdAt" },
                total: { $sum: "$total" },
            },
        },

        {
            $sort: {
                _id: 1,
            },
        },
        {
            $group: {
                _id: null,
                days: { $push: "$_id" },
                totals: { $push: "$total" },
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
    ]);
    const weekly = await OrderModal.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
                },
            },
        },
        {
            $group: {
                _id: { $week: "$createdAt" },
                total: { $sum: "$total" },
            },
        },

        {
            $sort: {
                _id: 1,
            },
        },
        {
            $group: {
                _id: null,
                weeks: { $push: "$_id" },
                totals: { $push: "$total" },
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
    ]);
    const locations = await OrderModal.aggregate([
        {
            $group: {
                _id: "$type",
                total: { $sum: "$total" },
            },
        },
        {
            $sort: {
                _id: 1,
            },
        },
        {
            $group: {
                _id: null,
                locations: { $push: "$_id" },
                totals: { $push: "$total" },
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
    ]);

    const ordersCount = await OrderModal.find({}).count();
    const orders = await OrderModal.find({});
    const vendorsCount = await VendorModal.find({ hide: false }).count();

    const jobsCount = await JobModal.find({}).count();
    var salesCount = 0;
    for (let i = 0; i < orders.length; i++) {
        salesCount = salesCount + orders[i].total;
    }
    const items = await Order.aggregate([
        {
            $unwind: "$items",
        },
        {
            $project: {
                _id: 1,
                vendor: 1,
                city: 1,
                item: "$items.color",
            },
        },
        {
            $group: {
                _id: {
                    city: "$city",
                    item: "$item",
                },
                count: {
                    $sum: 1,
                },
            },
        },
        {
            $group: {
                _id: "$_id.city",
                categoryCounts: {
                    $push: {
                        category: "$_id.item",
                        count: "$count",
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                location: "$_id",
                categoryCounts: 1,
            },
        },
        {
            $group: {
                _id: "$location",
                counts: { $push: "$categoryCounts.count" },
                categories: { $push: "$categoryCounts.category" },
            },
        },
    ]);

    console.log(items);

    res.status(200).json({
        type: "success",
        result: {
            calendericStats: {
                yearly: yearly,
                monthly: monthly,
                daily: daily,
                weekly: weekly,
                locations: locations,
            },
            counts: {
                jobs: jobsCount,
                vendors: vendorsCount,
                orders: ordersCount,
                sales: salesCount,
            },
            locationerStats: { locations: locations, items: items },
        },
    });
});


server = app.listen(port, host, () => {
    console.log("Running Server at http://" + host + ":" + port);
});

let io = socket(server);
MySocket(io);
