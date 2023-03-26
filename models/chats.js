const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    id: Schema.ObjectId,
    by: { type: String, required: true },
    text: { type: String, required: true },
    read: { type: Boolean, required: true }
}, { timestamps: true });

const ChatsSchema = new Schema({
    id: Schema.ObjectId,
    customer: { type: Schema.Types.ObjectId, ref: "customer" },
    vendor: { type: Schema.Types.ObjectId, ref: "vendor" },
    messages: [MessageSchema],
    e: {
        type: Date,
        default: Date.now,
        index: { expires: '7d' },
    },
}, { timestamps: true });


module.exports = mongoose.model("chat", ChatsSchema);