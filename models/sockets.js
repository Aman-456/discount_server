const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SocketsSchema = new Schema({
    id: Schema.ObjectId,
    socket_id: { type: String, required: true },
    customer: { type: Schema.Types.ObjectId, ref: "customer" },
    vendor: { type: Schema.Types.ObjectId, ref: "vendor" },
    user_type: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("socket", SocketsSchema);