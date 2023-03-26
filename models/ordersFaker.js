const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductsSchema = new Schema({
    id: Schema.ObjectId,
    color: { type: String },
}, { _id: false });

const OrdersSchema = new Schema({
    id: Schema.ObjectId,
    paid: { type: Boolean, default: true },
    items: [ProductsSchema],
    city: { type: String },
    total: { type: Number },
    vendor: { type: String },
    createdDate: { type: Date }
});

module.exports = mongoose.model("myorder", OrdersSchema);