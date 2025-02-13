const { default: mongoose } = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: false },  // ✅ Location field
    aboutEvent: { type: String, required: false }, // ✅ Description field
    relation: { type: String, required: true },
    image: { type: String, required: false },
    eventType: { type: String, enum: ["Birthday", "Anniversary", "Other"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
