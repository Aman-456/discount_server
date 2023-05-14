const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BannerSchema = new Schema(
    {
        item1: { type: Schema.Types.ObjectId, ref: "item" },
        item2: { type: Schema.Types.ObjectId, ref: "item" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("bannerproducts", BannerSchema);
