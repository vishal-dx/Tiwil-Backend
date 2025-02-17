const Guest = require("../models/Guest");
const Invitation = require("../models/Invitaions");

const getInvitations = async (req, res) => {
    try {
      const userId = req.user?.userId; // Ensure authentication
  
      if (!userId) {
        return res.status(401).json({ success: false, message: "User authentication failed." });
      }
  
      const invitations = await Invitation.find({ userId }).populate("eventId", "name image date");
  
      if (!invitations || invitations.length === 0) {
        return res.status(200).json({ success: true, data: [] }); // Return empty but successful
      }
  
      res.status(200).json({ success: true, data: invitations });
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
  
      // ✅ Find the invitation by ID
      const updatedInvitation = await Invitation.findByIdAndUpdate(invitationId, { status }, { new: true });
  
      if (!updatedInvitation) {
        return res.status(404).json({ success: false, message: "Invitation not found." });
      }
  
      // ✅ Find the corresponding Guest entry using eventId and phoneNumber
      const updatedGuestStatus = await Guest.findOneAndUpdate(
        { eventId: updatedInvitation.eventId, phoneNumber: updatedInvitation.phoneNumber }, // Matching criteria
        { status }, // Update status
        { new: true }
      );
  
      if (!updatedGuestStatus) {
        console.warn("⚠️ Warning: No matching guest found for event:", updatedInvitation.eventId);
      }
  
      res.json({
        success: true,
        message: `Invitation marked as ${status}.`,
        invitationData: updatedInvitation,
        guestData: updatedGuestStatus || "No matching guest found",
      });
    } catch (error) {
      console.error("❌ Error updating invitation status:", error);
      res.status(500).json({ success: false, message: "Server error." });
    }
  };

module.exports = {getInvitations, updateInvitationStatus}