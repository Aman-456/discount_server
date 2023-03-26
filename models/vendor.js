const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const DimensionSchema = new Schema(
  {
    width: { type: Number },
    height: { type: Number },
    length: { type: Number },
  },
  { _id: false }
);

const VendorSchema = new Schema(
  {
    id: Schema.ObjectId,
    name: { type: String, required: true, unique: true, trim: true },
    companyName: { type: String, trim: true },
    phone: { type: String, trim: true },
    qrcode: { type: String },
    loginqrcode: { type: String },
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
    newMessage: { type: Boolean, default: false },
    stripe_active: { type: Boolean },
    stripe_account: { type: String },
    admin: { type: Boolean },
    provider: { type: Object },
    fcmToken: { type: String, trim: true },

    dayStartTime: { type: Object },
    dayEndTime: { type: Object },

    startPublicLiability: { type: Date },
    expiryPublicLiability: { type: Date },
    publicLiability: { type: String, default: "" },

    startEmployerLiability: { type: Date },
    expiryEmployerLiability: { type: Date },
    employerLiability: { type: String, default: "" },

    startRiskAssesments: { type: Date },
    expiryRiskAssesments: { type: Date },
    riskAssesments: { type: String, default: "" },

    startFhiCertificate: { type: Date },
    expiryFhiCertificate: { type: Date },
    fhiCertificate: { type: String, default: "" },

    startGasSafetyCertificate: { type: Date },
    expiryGasSafetyCertificate: { type: Date },
    gasSafetyCertificate: { type: String, default: "" },

    startNVQ: { type: Date },
    expiryNVQ: { type: Date },
    NVQ: { type: String, default: "" },

    startBusinessRegistration: { type: Date },
    expiryBusinessRegistration: { type: Date },
    businessRegistration: { type: String, default: "" },

    startFireBlanket: { type: Date },
    expiryFireBlanket: { type: Date },
    fireBlanket: { type: String, default: "" },

    foodType: { type: String },
    setUp: { type: String },
    dietary: { type: String },
    foodPackaging: { type: String },
    dimension: DimensionSchema,
    weight: { type: String },
    powerRequirement: { type: String, trim: true },
    banner: { type: String, trim: true },
    hygieneRating: { type: String, trim: true, default: "0" },
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
