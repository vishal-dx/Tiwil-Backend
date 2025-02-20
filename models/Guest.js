const mongoose = require("mongoose");

const GuestSchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Event", 
    required: true, 
    index: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true // ✅ The event creator (inviter)
  },
  guests: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // ✅ Unique guest ID
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ✅ If registered user
      name: { type: String, required: true },
      phoneNumber: { type: String },
      status: { type: String, enum: ["Invited", "Accepted", "Declined"], default: "Invited" },
      invitedAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("Guest", GuestSchema);
