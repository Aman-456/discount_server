const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ApplicationSchema = new Schema({
    id: Schema.ObjectId,
    addtionalDetails: { type: String, required: true },
    job: { type: Schema.Types.ObjectId, ref: "job" },
    vendor: { type: Schema.Types.ObjectId, ref: "vendor" },
    invoice: { type: Object },
    status: { type: String, required: true }
});

module.exports = mongoose.model("application", ApplicationSchema);