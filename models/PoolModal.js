const mongoose = require("mongoose");

const poolSchema = new mongoose.Schema(
  {
    wishId: { type: mongoose.Schema.Types.ObjectId, ref: "Wishlist", required: true },
    totalAmount: { type: Number, required: true }, // Total amount required
    collectedAmount: { type: Number, default: 0 }, // Amount collected
    status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
    contributors: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pool", poolSchema);
