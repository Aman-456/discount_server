const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductsSchema = new Schema(
  {
    item: { type: Schema.Types.ObjectId, ref: "item" },
    vendor: { type: Schema.Types.ObjectId, ref: "vendor" },
    quantity: { type: Number, required: true },
  },
);
const CartSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "customer" },
    items: [ProductsSchema],
    // total: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("cart", CartSchema);
