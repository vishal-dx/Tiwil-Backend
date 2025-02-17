const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  giftName: { type: String, required: true },
  price: { type: Number, required: true },  // Ensure price is stored as a number
  productLink: { type: String },
  desireRate: { type: Number, required: true },  // Ensure desireRate is stored as a number
  description: { type: String },
  imageUrl: { type: String, default: "" }, 
  status: { 
    type: String, 
    enum: ['Mark', 'Unmark', 'Purchased'],
    default: 'Unmark'
  },
}, { timestamps: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
