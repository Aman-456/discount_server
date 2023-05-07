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
    customer: { type: Schema.Types.ObjectId, ref: "customer" },
    vendor: { type: Schema.Types.ObjectId, ref: "vendor" },
    paid: { type: Boolean, required: true },
    items: [ProductsSchema],
    total: { type: Number, required: true },
    review: ReviewSchema,
    transaction: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", OrdersSchema);
