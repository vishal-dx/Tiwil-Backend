const mongoose = require("mongoose");

const OTPModel = new mongoose.Schema({
  phoneNumber: { type: String, required: true }, // Updated to use phoneNumber
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // OTP expires in 5 minutes
});

module.exports = mongoose.model("OTP", OTPModel);
