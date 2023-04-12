const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema(
  {
    vendor: { type: Schema.Types.ObjectId, ref: "vendor", required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    stock: { type: Number, default: 1 },
    reviews: [{
      user: {
        type: Schema.Types.ObjectId, ref: "customer", required: true
      },
      text: { type: String }
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("item", ItemSchema);
