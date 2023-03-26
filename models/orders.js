const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductsSchema = new Schema(
  {
    id: Schema.ObjectId,
    item: { type: Schema.Types.ObjectId, ref: "item" },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const ReviewSchema = new Schema(
  {
    id: Schema.ObjectId,
    description: { type: String },
    rating: { type: Number },
  },
  { _id: false }
);

const OrdersSchema = new Schema(
  {
    id: Schema.ObjectId,
    preOrder: { type: String, default: false },
    date: { type: Object, default: null },
    time: { type: Object, default: null },
    customer: { type: Schema.Types.ObjectId, ref: "customer" },
    paid: { type: Boolean, required: true },
    items: [ProductsSchema],
    total: { type: Number, required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "vendor" },
    fromEvent: { type: Boolean, required: true },
    riderAccept: { type: Boolean },
    event: { type: Schema.Types.ObjectId, ref: "event" },
    rider: { type: Schema.Types.ObjectId, ref: "rider" },
    orderStatus: { type: String, required: true },
    review: ReviewSchema,
    coupon: { type: String },
    allergen: { type: String },
    notifytime: { type: String },
    transaction: { type: Object },
    chargeId: { type: String },
    type: { type: String, required: true },
    riderCount: { type: Number },
    riderCurrent: { type: Number },
    riders: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", OrdersSchema);
