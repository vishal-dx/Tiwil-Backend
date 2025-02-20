const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  giftName: { type: String, required: true },
  price: { type: Number, required: true },
  productLink: { type: String },
  desireRate: { type: Number, required: true },
  description: { type: String },
  imageUrl: { type: String, default: "" }, 
  status: { 
    type: String, 
    enum: ['Mark', 'Unmark', 'Purchased', 'Pooling','Completed'],
    default: 'Unmark'
  },
  markedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    profileImage: { type: String },
    timestamp: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
