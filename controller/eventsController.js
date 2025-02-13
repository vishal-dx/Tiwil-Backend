const { default: mongoose } = require("mongoose");
const Event = require("../models/EventSchema");
const moment = require("moment"); 
const multer = require("multer");
const path = require("path");
const FamilyInfo = require("../models/FamilyInfo");

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure "uploads" directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });



const createEvent = async (req, res) => {
  try {
    const { userId, fullName, dob, relationType, eventType } = req.body;
    const imagePath = req.file ? `uploads/${req.file.filename}` : null; // ✅ Store only relative path

    if (!userId || !fullName || !dob || !relationType || !eventType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newEvent = new Event({
      userId,
      eventId: new mongoose.Types.ObjectId(),
      name: `${fullName}'s ${eventType}`,
      date: dob,
      relation: relationType,
      eventType,
      image: imagePath, // ✅ Store relative path only
    });

    await newEvent.save();

    // **Update FamilyInfo Schema**
    const familyInfo = await FamilyInfo.findOne({ userId });
    if (familyInfo) {
      familyInfo.familyMembers.push({
        userId,
        fullName,
        dob,
        gender: relationType === "Spouse" ? "Female" : "Male",
        relationType,
        eventType,
        image: imagePath, // ✅ Store relative path only
        relationId: new mongoose.Types.ObjectId(),
        eventId: newEvent._id,
      });
      await familyInfo.save();
    }

    res.status(201).json({
      success: true,
      message: "Event created and added to FamilyInfo.",
      data: {
        ...newEvent.toObject(),
        image: imagePath, // ✅ Send relative path in response
      },
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ success: false, message: "Failed to create event" });
  }
};


const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const deletedEvent = await Event.findOneAndDelete({ _id: eventId });

    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // **Remove from FamilyInfo Schema**
    await FamilyInfo.findOneAndUpdate(
      { "familyMembers.eventId": eventId },
      { $pull: { familyMembers: { eventId } } },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ success: false, message: "Failed to delete event" });
  }
};

const getEvents = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User authentication failed." });
    }

    const events = await Event.find({ userId });

    res.status(200).json({ success: true, data: events }); // ✅ Send stored relative paths as-is
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, message: "Failed to fetch events." });
  }
};

const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ success: false, message: "Event ID is required." });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    res.status(200).json({
      success: true,
      data: {
        ...event.toObject(),
        image: event.image || null, // ✅ Return only the stored relative path
      },
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ success: false, message: "Failed to fetch event." });
  }
};
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { description, location } = req.body;

    if (!eventId) {
      return res.status(400).json({ success: false, message: "Event ID is required." });
    }

    // ✅ Update the event in the database
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: { aboutEvent: description, location } }, // ✅ Updating new fields
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    res.status(200).json({ success: true, message: "Event updated successfully.", data: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ success: false, message: "Failed to update event." });
  }
};
const getPastEvents = async (req, res) => {
  try {
    const userId = req.user?.userId; // Get user ID from token

    if (!userId) {
      return res.status(401).json({ success: false, message: "User authentication failed." });
    }

    const today = moment().startOf("day"); // Get today's date without time

    // ✅ Find events where the event date is before today
    const pastEvents = await Event.find({
      userId,
      date: { $lt: today.toDate() }, // Select only past events
    }).sort({ date: -1 }); // Sort in descending order (latest first)

    res.status(200).json({ success: true, data: pastEvents });
  } catch (error) {
    console.error("Error fetching past events:", error);
    res.status(500).json({ success: false, message: "Failed to fetch history events." });
  }
};


module.exports = { createEvent,deleteEvent, upload ,getEvents, getEventById, updateEvent, getPastEvents};










