const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who receives the notification
    message: { type: String, required: true }, // Notification text
    type: { type: String, enum: ["Pool Contribution", "Invite", "Other"], required: true },
    wishId: { type: mongoose.Schema.Types.ObjectId, ref: "Wishlist" }, // Related wishlist item
    isRead: { type: Boolean, default: false }, // Has the user seen it?
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
