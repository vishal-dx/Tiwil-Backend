const Guest = require("../models/Guest");
const User = require("../models/User");
const Invitation = require("../models/Invitaions");


// Invite Guests
// exports.inviteGuests = async (req, res) => {
//   try {
//     const { eventId, guests } = req.body;

//     if (!eventId || !Array.isArray(guests) || guests.length === 0) {
//       return res.status(400).json({ success: false, message: "Invalid request data." });
//     }

//     console.log("🚀 Guests received in request:", guests);

//     const invitedGuests = [];

//     for (let guest of guests) {
//       const guestName = guest.fullName || guest.name; // ✅ Ensure name is extracted properly

//       if (!guestName) {
//         console.log("⚠️ Skipping guest without a name:", guest);
//         continue; // ✅ Prevent inserting a guest without a name
//       }

//       const existingGuest = await Guest.findOne({ eventId, name: guestName });

//       if (!existingGuest) {
//         const newGuest = await Guest.create({
//           eventId,
//           name: guestName,
//           status: "Invited",
//         });
//         invitedGuests.push(newGuest);
//       } else {
//         console.log(`⚠️ Guest ${guestName} is already invited, skipping.`);
//       }
//     }

//     console.log("✅ Final guest list after insertion:", invitedGuests);

//     res.status(201).json({ success: true, message: "Invitations sent successfully!", guests: invitedGuests });
//   } catch (error) {
//     console.error("❌ Error inviting guests:", error);
//     res.status(500).json({ success: false, message: "Server error." });
//   }
// };


// exports.inviteGuests = async (req, res) => {
//   try {
//     const { eventId, guests } = req.body;

//     if (!eventId || !Array.isArray(guests) || guests.length === 0) {
//       return res.status(400).json({ success: false, message: "Invalid request data." });
//     }

//     console.log("🚀 Guests received in request:", guests);

//     const invitedGuests = [];

//     for (let guest of guests) {
//       const guestName = guest.fullName || guest.name;
//       const guestPhone = guest.phoneNumber || "";

//       if (!guestName || !guestPhone) {
//         console.log("⚠️ Skipping guest due to missing data:", guest);
//         continue; // ✅ Prevent inserting a guest without required fields
//       }

//       // ✅ Check if guest already exists
//       const existingGuest = await Guest.findOne({ eventId, phoneNumber: guestPhone });

//       if (!existingGuest) {
//         const newGuest = await Guest.create({
//           eventId,
//           name: guestName,
//           phoneNumber: guestPhone,
//           status: "Invited",
//         });
//         invitedGuests.push(newGuest);

//         // ✅ Store invitation for the user
//         const user = await User.findOne({ phoneNumber: guestPhone }); // Find user by phoneNumber
//         if (user) {
//           await Invitation.create({ eventId, userId: user._id, status: "Pending" });
//         }
//       } else {
//         console.log(`⚠️ Guest ${guestName} (${guestPhone}) is already invited, skipping.`);
//       }
//     }

//     console.log("✅ Final guest list after insertion:", invitedGuests);

//     res.status(201).json({ success: true, message: "Invitations sent successfully!", guests: invitedGuests });
//   } catch (error) {
//     console.error("❌ Error inviting guests:", error);
//     res.status(500).json({ success: false, message: "Server error." });
//   }
// };

exports.inviteGuests = async (req, res) => {
  try {
    const { eventId, guests } = req.body;

    if (!eventId || !Array.isArray(guests) || guests.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid request data." });
    }

    console.log("🚀 Guests received in request:", guests);

    const invitedGuests = [];

    for (let guest of guests) {
      const guestName = guest.fullName || guest.name;
      const guestPhone = guest.phoneNumber || "";

      if (!guestName || !guestPhone) {
        console.log("⚠️ Skipping guest due to missing data:", guest);
        continue;
      }

      // ✅ Check if guest already exists
      const existingGuest = await Guest.findOne({ eventId, phoneNumber: guestPhone });

      if (!existingGuest) {
        const newGuest = await Guest.create({
          eventId,
          name: guestName,
          phoneNumber: guestPhone,
          status: "Invited",
        });

        invitedGuests.push(newGuest);

        // ✅ Find the user by phoneNumber and store the invitation
        const user = await User.findOne({ phoneNumber: guestPhone });

        if (user) {
          const existingInvitation = await Invitation.findOne({ eventId, userId: user._id });

          if (!existingInvitation) {
            await Invitation.create({
              eventId,
              userId: user._id,
              phoneNumber: guestPhone,
              status: "Pending",
            });
            console.log(`✅ Invitation created for ${guestName} (${guestPhone})`);
          } else {
            console.log(`⚠️ Invitation already exists for ${guestName}, skipping.`);
          }
        } else {
          console.log(`⚠️ User with phone number ${guestPhone} not found, skipping invitation.`);
        }
      } else {
        console.log(`⚠️ Guest ${guestName} (${guestPhone}) is already invited, skipping.`);
      }
    }

    console.log("✅ Final guest list after insertion:", invitedGuests);

    res.status(201).json({ success: true, message: "Invitations sent successfully!", guests: invitedGuests });
  } catch (error) {
    console.error("❌ Error inviting guests:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};



// Get Guests for an Event
exports.getEventGuests = async (req, res) => {
  try {
    const { eventId } = req.params;
    const guests = await Guest.find({ eventId });

    res.json({ success: true, data: guests });
  } catch (error) {
    console.error("Error fetching guests:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Update Guest Response (Accept/Decline)
exports.updateGuestStatus = async (req, res) => {
  try {
    const { guestId } = req.params;
    const { status } = req.body;

    if (!["Accepted", "Declined"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    await Guest.findByIdAndUpdate(guestId, { status });
    res.json({ success: true, message: "Guest response updated." });
  } catch (error) {
    console.error("Error updating guest response:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
exports.getUserInvites = async (req, res) => {
  try {
    const userName = req.user.fullName; // Assuming user is authenticated

    if (!userName) {
      return res.status(400).json({ success: false, message: "User name is required." });
    }

    const invitations = await Guest.find({ name: userName, status: "Invited" });

    res.status(200).json({ success: true, invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};



// // Get Invited Guests by Event ID
// const getEventGuests = async (req, res) => {
//   try {
//     const { eventId } = req.params;

//     const guests = await Guest.find({ eventId }).populate("userId", "fullName phoneNumber");

//     return res.status(200).json({ success: true, guests });
//   } catch (error) {
//     console.error("Error fetching guests:", error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

