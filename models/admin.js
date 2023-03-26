const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    id: Schema.ObjectId,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true });

AdminSchema.statics.CreateHash = async (password) => {
    return await bcrypt.hashSync(password, 10);
};

AdminSchema.statics.isPasswordEqual = async (password, passwordFromDatabase) => {
    return bcrypt.compare(password, passwordFromDatabase);
};

module.exports = mongoose.model("admin", AdminSchema);