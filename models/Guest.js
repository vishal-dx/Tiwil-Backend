const mongoose = require("mongoose");

const GuestSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true }, // ✅ Store phoneNumber
  status: { type: String, enum: ["Invited", "Accepted", "Declined"], default: "Invited" },
  invitedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Guest", GuestSchema);
