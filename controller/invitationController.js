const Guest = require("../models/Guest");
const Invitation = require("../models/Invitaions");
const Event = require("../models/EventSchema"); // ✅ Import Event model

const getInvitations = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "User authentication failed." });
    }

    const userId = req.user.userId;

    // ✅ Fetch only invitations where the logged-in user is invited
    const invitations = await Invitation.find({
      "invitations.userId": userId
    })
    .select("eventId invitations")
    .lean();

    if (!invitations || invitations.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // ✅ Fetch event details for the matched event IDs
    const eventIds = invitations.map(invite => invite.eventId);
    const events = await Event.find({ eventId: { $in: eventIds } })
      .select("eventId name date location aboutEvent relation image eventType")
      .lean();

    // ✅ Create a map of eventId -> event details
    const eventMap = events.reduce((acc, event) => {
      acc[event.eventId.toString()] = event;
      return acc;
    }, {});

    // ✅ Attach event details to the filtered invitations
    const filteredInvitations = invitations.map(invite => ({
      _id: invite._id,
      eventId: invite.eventId,
      invitations: invite.invitations.filter(i => i.userId.toString() === userId),
      eventDetails: eventMap[invite.eventId.toString()] || null // ✅ Attach event details
    })).filter(invite => invite.invitations.length > 0);

    res.status(200).json({ success: true, data: filteredInvitations });

  } catch (error) {
    console.error("❌ Error fetching invitations:", error);
    res.status(500).json({ success: false, message: "Failed to fetch invitations." });
  }
};

  const updateInvitationStatus = async (req, res) => {
    try {
      const { invitationId } = req.params;
      const { status } = req.body;

      if (!["Accepted", "Declined"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status." });
      }

      // ✅ Update the Invitation schema first
      const updatedInvitation = await Invitation.findOneAndUpdate(
        { "invitations._id": invitationId },
        { $set: { "invitations.$.status": status } },
        { new: true }
      );

      if (!updatedInvitation) {
        return res.status(404).json({ success: false, message: "Invitation not found." });
      }

      // ✅ Update the corresponding guest inside the `guests` array in Guest schema
      const updatedGuest = await Guest.findOneAndUpdate(
        { "guests._id": invitationId }, // ✅ Find matching guest ID
        { $set: { "guests.$.status": status } }, // ✅ Update status
        { new: true }
      );

      if (!updatedGuest) {
        console.warn("⚠️ Warning: No matching guest found for event:", updatedInvitation.eventId);
      }

      res.json({
        success: true,
        message: `Invitation marked as ${status}.`,
        invitationData: updatedInvitation,
        guestData: updatedGuest || "No matching guest found",
      });
    } catch (error) {
      console.error("❌ Error updating invitation status:", error);
      res.status(500).json({ success: false, message: "Server error." });
    }
  }

module.exports = {getInvitations, updateInvitationStatus}