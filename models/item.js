const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema(
  {
    vendor: { type: Schema.Types.ObjectId, ref: "vendor", required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    stock: { type: Number, default: 1 },
    dimensions: { type: String },
    weight: { type: Number },
    color: { type: String },
    reviews: [{
      user: {
        type: Schema.Types.ObjectId, ref: "customer", required: true
      },
      text: { type: String }
    }],
  },
  { timestamps: true }
);
ItemSchema.index({
  name: "text",
  description: "text",
  category: "text"
});
module.exports = mongoose.model("item", ItemSchema);
