const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const VendorSchema = new Schema(
  {
    id: Schema.ObjectId,
    name: { type: String, required: true, unique: true, trim: true },
    companyName: { type: String, trim: true },
    phone: { type: String, trim: true },
    image: { type: String },
    email: { type: String, required: true, unique: true, trim: true },
    address: { type: String, trim: true },
    latitude: { type: String },
    longitude: { type: String },
    password: { type: String },
    status: { type: String, required: true },
    completeStatus: { type: Boolean, required: true },
    block: { type: Boolean },
    hide: { type: Boolean, default: false },
    stripe_active: { type: Boolean },
    stripe_account: { type: String },
    admin: { type: Boolean },

    dayStartTime: { type: Object },
    dayEndTime: { type: Object },

    foodType: { type: String },
    setUp: { type: String },
    dietary: { type: String },
    weight: { type: String },
    banner: { type: String, trim: true },
    rating: { type: String, trim: true, default: "0" },
    onlineStatus: { type: Boolean, default: false },
    minimumOrderPrice: { type: Number },
    otp: { type: String },
    expireTime: { type: Date },
    // stripeId: { type: String },
  },
  { timestamps: true }
);

VendorSchema.statics.CreateHash = async (password) => {
  return await bcrypt.hashSync(password, 10);
};

VendorSchema.statics.isPasswordEqual = async (
  password,
  passwordFromDatabase
) => {
  return bcrypt.compare(password, passwordFromDatabase);
};

module.exports = mongoose.model("vendor", VendorSchema);
