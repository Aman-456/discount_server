const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const CardSchema = new Schema({
  cardId: { type: String, required: true },
  cardName: { type: String, required: true },
  cardHolderName: { type: String, required: true },
  cardNumber: { type: String, required: true },
  cvc: { type: String, required: true },
  expMonth: { type: String, required: true },
  expYear: { type: String, required: true },
});

const CustomerSchema = new Schema(
  {
    id: Schema.ObjectId,
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String },
    address: { type: String },
    verify: { type: Boolean, default: false },
    otp: { type: String },
    hide: { type: Boolean, default: false },
    expireTime: { type: Date },
    stripeId: { type: String },
    favouriteItems: [{ type: Schema.Types.ObjectId, ref: "item" }],
    cards: [CardSchema],
  },
  { timestamps: true }
);

CustomerSchema.statics.CreateHash = (password) => {
  return bcrypt.hashSync(password, 10);
};

CustomerSchema.statics.isPasswordEqual = async (
  password,
  passwordFromDatabase
) => {
  return bcrypt.compare(password, passwordFromDatabase);
};
module.exports = mongoose.model("customer", CustomerSchema);
