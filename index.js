const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const cors = require("cors");
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


server = app.listen(port, host, () => {
    console.log("Running Server at http://" + host + ":" + port);
});

