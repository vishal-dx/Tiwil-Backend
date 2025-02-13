const mongoose = require("mongoose");

const familyMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  dob: {
    type: Date,
    required: function () {
      return this.eventType === "Birthday"; // Only required for birthdays
    },
  },
  anniversaryDate: {
    type: Date,
    required: function () {
      return this.eventType === "Anniversary"; // Only required for anniversaries
    },
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: function () {
      return !["Parent Anniversary", "Marriage Anniversary"].includes(this.relationType);
    },
  },
  relationType: {
    type: String,
    enum: [
      "Father",
      "Mother",
      "Parent Anniversary",
      "Spouse",
      "Marriage Anniversary",
      "Child",
      "Sibling",
      "Other",
    ],
    required: true,
  },
  eventType: { type: String, enum: ["Birthday", "Anniversary", "Other"], required: true },
  image: { type: String, required: false },
  relationId: { type: mongoose.Schema.Types.ObjectId, ref: "FamilyInfo", required: false },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: false },
});

const familyInfoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    familyMembers: [familyMemberSchema],
    addMember: { type: Boolean, default: false },
    onboardingStatus: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FamilyInfo", familyInfoSchema);
