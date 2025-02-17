const mongoose = require("mongoose");

const InvitationSchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Event", 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  }, 
  status: { 
    type: String, 
    enum: ["Pending", "Accepted", "Declined"], 
    default: "Pending" 
  },
  invitedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Invitation", InvitationSchema);
