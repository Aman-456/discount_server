const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema(
  {
    id: Schema.ObjectId,
    vendor: { type: Schema.Types.ObjectId, ref: "vendor", required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    allergen: { type: String, required: true, trim: true },
    discount: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    hide: { type: Boolean, default: false },
    soldOut: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("item", ItemSchema);
