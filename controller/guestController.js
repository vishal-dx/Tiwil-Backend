const Guest = require("../models/Guest");
const User = require("../models/User");
const Invitation = require("../models/Invitaions")
const mongoose = require("mongoose");
const UserProfile = require("../models/UserProfile");
module.exports = {
  // ✅ Invite Guests
  inviteGuests: async (req, res) => {
    try {
      const { eventId, guests } = req.body;
      const userId = req.user.userId; // ✅ The authenticated user sending invites

      if (!eventId || !Array.isArray(guests) || guests.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid request data." });
      }

      console.log("🚀 Guests received in request:", guests);

      let guestList = [];
      let invitationList = [];

      // ✅ Fetch existing guests for this event
      const existingGuestDocument = await Guest.findOne({ eventId, userId });

      // ✅ Extract already invited phone numbers
      const existingPhoneNumbers = new Set(
        existingGuestDocument?.guests.map((guest) => guest.phoneNumber) || []
      );

      for (let guest of guests) {
        const guestName = guest.fullName || guest.name;
        const guestPhone = guest.phoneNumber;
        const guestId = new mongoose.Types.ObjectId(); // ✅ Generate consistent ID

        if (!guestName || !guestPhone) {
          console.log("⚠️ Skipping guest due to missing data:", guest);
          continue;
        }

        // ✅ Check if this guest has already been invited
        if (existingPhoneNumbers.has(guestPhone)) {
          console.log(`⚠️ Guest ${guestName} (${guestPhone}) is already invited, skipping.`);
          continue;
        }

        // ✅ Check if guest is a registered user
        const user = await User.findOne({ phoneNumber: guestPhone });

        // ✅ Push to guestList
        guestList.push({
          _id: guestId, // ✅ Assign the same _id
          name: guestName,
          phoneNumber: guestPhone,
          status: "Invited",
          userId: user ? user._id : null, // ✅ Link if user exists
        });

        // ✅ Push to invitationList with the same _id
        invitationList.push({
          _id: guestId, // ✅ Same _id as guest entry
          userId: user ? user._id : null, // ✅ Registered user
          phoneNumber: guestPhone,
          status: "Pending",
        });

        // ✅ Add this phone number to the existing set to prevent duplicate invites in the same request
        existingPhoneNumbers.add(guestPhone);
      }

      if (guestList.length === 0) {
        return res.status(400).json({ success: false, message: "Guest already in your invitation list." });
      }

      // ✅ Upsert Guest document
      const updatedGuestDocument = await Guest.findOneAndUpdate(
        { eventId, userId }, // ✅ Find by event & inviter
        { $push: { guests: { $each: guestList } } },
        { upsert: true, new: true }
      );

      // ✅ Upsert Invitation document
      const updatedInvitationDocument = await Invitation.findOneAndUpdate(
        { eventId, userId }, // ✅ Find by event & inviter
        { $push: { invitations: { $each: invitationList } } },
        { upsert: true, new: true }
      );

      console.log("✅ Updated Guests:", updatedGuestDocument);
      console.log("✅ Updated Invitations:", updatedInvitationDocument);

      res.status(201).json({ success: true, message: "New invitations sent successfully!" });
    } catch (error) {
      console.error("❌ Error inviting guests:", error);
      res.status(500).json({ success: false, message: "Server error." });
    }
  },
 // ✅ Get Guests for an Event
 getEventGuests: async (req, res) => {
  try {
    const { eventId } = req.params;

    // Fetch the guest document for the event
    const guestDocument = await Guest.findOne({ eventId });

    if (!guestDocument) {
      return res.status(200).json({ success: true, data: [] }); // No guests found
    }

    // Retrieve the profileImage for each guest using the userId from the UserProfile collection
    const guestsWithProfileImages = await Promise.all(
      guestDocument.guests.map(async (guest) => {
        // Query the UserProfile collection using the guest's userId
        const userProfile = await UserProfile.findOne({ userId: guest.userId });

        // Add profileImage to the guest object
        const profileImage = userProfile ? userProfile.profileImage : null;

        return {
          ...guest.toObject(),
          profileImage, // Add the profileImage to the guest
        };
      })
    );

    res.json({ success: true, data: guestsWithProfileImages });
  } catch (error) {
    console.error("❌ Error fetching guests:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
},


  // ✅ Update Guest Response (Accept/Decline)
  updateGuestStatus: async (req, res) => {
    try {
      const { eventId, phoneNumber } = req.params;
      const { status } = req.body;

      if (!["Accepted", "Declined"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status." });
      }

      const updatedGuest = await Guest.findOneAndUpdate(
        { eventId, "guests.phoneNumber": phoneNumber },
        { $set: { "guests.$.status": status } }, // ✅ Update only the matched guest inside the array
        { new: true }
      );

      if (!updatedGuest) {
        return res.status(404).json({ success: false, message: "Guest not found." });
      }

      res.json({ success: true, message: `Guest status updated to ${status}.`, data: updatedGuest });
    } catch (error) {
      console.error("❌ Error updating guest response:", error);
      res.status(500).json({ success: false, message: "Server error." });
    }
  },

  // ✅ Get User Invitations
  getUserInvites: async (req, res) => {
    try {
      const userId = req.user._id; // ✅ Ensure user is authenticated

      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required." });
      }

      const invitations = await Invitation.find({ userId }).populate("eventId", "name image date");

      res.status(200).json({ success: true, data: invitations });
    } catch (error) {
      console.error("❌ Error fetching invitations:", error);
      res.status(500).json({ success: false, message: "Server error." });
    }
  }
};
