const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userProfileSchema = new mongoose.Schema({
    globalId: { type: String, default: uuidv4, unique: true }, // Global Unique ID
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    dob: { type: Date, required: true },
    location: { type: String, required: true },
    maritalStatus: { type: String, enum: ["Married", "Unmarried"], required: true },
    profileImage: { type: String },
    profileStatus: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("UserProfile", userProfileSchema);
