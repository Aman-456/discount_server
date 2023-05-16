const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductsSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: "item" },
  quantity: { type: Number, required: true },
  status: { type: String, default: "Pending" },
  acceptedbyvendor: { type: Boolean, default: false },
});
const checkoutSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "customer" },
    items: [ProductsSchema],
    total: { type: Number, required: true },
    card: {
      cardnumber: { type: String },
      csv: { type: String },
      expirydate: { type: String },
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("checkout", checkoutSchema);
