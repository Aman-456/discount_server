const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    id: Schema.ObjectId,
    vendor: { type: Schema.Types.ObjectId, ref: "vendor" },
    customer: { type: Schema.Types.ObjectId, ref: "customer" },
    rider: { type: Schema.Types.ObjectId, ref: "rider" },
    sentBy: { type: String, required: true },
    type: { type: String, required: true },
    order: { type: Schema.Types.ObjectId, ref: "order", required: true },
    text: { type: String, required: true },
    minutes: { type: String },

    readStatus: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notification", NotificationSchema);
