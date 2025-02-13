const FamilyInfo = require("../models/FamilyInfo");
const Event = require("../models/EventSchema");
const multer = require("multer");
const path = require("path");
const { default: mongoose } = require("mongoose");

// Fetch Family Information
const getFamilyInfo = async (req, res) => {
  try {
    const userId = req.user.userId; // Assume userId is attached to the request object
    const familyInfo = await FamilyInfo.findOne({ userId });
    if (!familyInfo) {
      return res.status(404).json({ success: false, message: "Family information not found." });
    }
    res.status(200).json({ success: true, data: familyInfo });
  } catch (error) {
    console.error("Error fetching family info:", error);
    res.status(500).json({ success: false, message: "Failed to fetch family information." });
  }
};


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

// Allow **one** field named "images" to accept multiple files
const familyUpload = multer({
  storage,
  fileFilter,
}).fields([
  { name: "fatherImage", maxCount: 1 },
  { name: "motherImage", maxCount: 1 },
  { name: "spouseImage", maxCount: 1 },
  { name: "parentAnniversaryImage", maxCount: 1 },
  { name: "marriageAnniversaryImage", maxCount: 1 },
  { name: "childImages", maxCount: 10 }, // Allow multiple child images
  { name: "siblingImages", maxCount: 10 }, // Allow multiple sibling images
]);

// const saveFamilyInfo = async (req, res) => {
//   try {
//     const userId = req.user?.userId;
//     if (!userId) {
//       return res.status(401).json({ success: false, message: "User authentication failed. Please log in again." });
//     }
//     console.log(req.body,'46825663488')

//     let data;
//     try {
//       data = req.body.data ? JSON.parse(req.body.data) : {};
//     } catch (error) {
//       console.error("JSON Parsing Error:", error);
//       return res.status(400).json({ success: false, message: "Invalid JSON format in request body." });
//     }

//     const files = req.files || {}; // ✅ Extract files correctly
//     console.log("Uploaded Files:", files);

//     // Function to extract file paths safely
//     const getImagePath = (fieldName) => {
//       return req.files[fieldName] && req.files[fieldName][0]
//         ? req.files[fieldName][0].path.replace(/\\/g, "/")
//         : null;
//     };
    
    

//     let { familyMembers = [], parentAnniversary, marriageAnniversary, spouse, siblings = [], children = [], onboardingStatus } = data;

//     if (!Array.isArray(familyMembers)) {
//       return res.status(400).json({ success: false, message: "familyMembers must be an array." });
//     }

//     // **Assign Images to Family Members**
//     familyMembers = familyMembers.map((member, index) => {
//       let image = null;
    
//       if (member.relationType === "Father") image = getImagePath("fatherImage");
//       if (member.relationType === "Mother") image = getImagePath("motherImage");
//       if (member.relationType === "Spouse") image = getImagePath("spouseImage");
//       if (member.relationType === "Parent Anniversary") image = getImagePath("parentAnniversaryImage");
//       if (member.relationType === "Marriage Anniversary") image = getImagePath("marriageAnniversaryImage");
    
//       // ✅ Corrected child and sibling image assignment
//       if (member.relationType === "Child") {
//         image = getImagePath(`childImage${index}`);
//       }
//       if (member.relationType === "Sibling") {
//         image = getImagePath(`siblingImage${index}`);
//       }
    
//       return {
//         ...member,
//         userId,
//         image,
//         relationId: member.relationId || new mongoose.Types.ObjectId(),
//         eventId: member.eventId || new mongoose.Types.ObjectId(),
//       };
//     });
    

//     console.log("Final Family Members Data with Image Paths:", JSON.stringify(familyMembers, null, 2));

//     let familyInfo = await FamilyInfo.findOne({ userId });

//     if (familyInfo) {
//       familyInfo.set({ familyMembers, onboardingStatus });
//       await familyInfo.save();
//       console.log("Updated Family Info:", familyInfo);
//     } else {
//       familyInfo = new FamilyInfo({ userId, familyMembers, onboardingStatus });
//       await familyInfo.save();
//       console.log("Saved New Family Info:", familyInfo);
//     }
//     for (const member of familyMembers) {
//       await Event.create({
//         userId,
//         eventId: new mongoose.Types.ObjectId(),
//         name: `${member.fullName}'s ${member.eventType}`,
//         date: member.dob,
//         relation: member.relationType,
//         eventType: member.eventType,
//         image: member.image || null,
//       });
//     }
//     res.status(201).json({
//       success: true,
//       message: "Family information saved successfully.",
//       data: familyInfo,
//     });
//   } catch (error) {
//     console.error("Error saving family info:", error);
//     res.status(500).json({ success: false, message: "Failed to save family information." });
//   }
// };

// const saveFamilyInfo = async (req, res) => {
//   try {
//     const userId = req.user?.userId;
//     if (!userId) {
//       return res.status(401).json({ success: false, message: "User authentication failed. Please log in again." });
//     }

//     console.log("Received Request Body:", req.body);
//     console.log("Uploaded Files:", req.files);

//     let data;
//     try {
//       data = req.body.data ? JSON.parse(req.body.data) : {};
//     } catch (error) {
//       console.error("JSON Parsing Error:", error);
//       return res.status(400).json({ success: false, message: "Invalid JSON format in request body." });
//     }

//     const files = req.files || {};

//     // **Function to extract file paths safely**
//     const getImagePath = (fieldName, index = null) => {
//       if (index !== null) {
//         return files[fieldName] && files[fieldName][index]
//           ? files[fieldName][index].path.replace(/\\/g, "/")
//           : null;
//       }
//       return files[fieldName] && files[fieldName][0]
//         ? files[fieldName][0].path.replace(/\\/g, "/")
//         : null;
//     };

//     let { familyMembers = [], onboardingStatus } = data;

//     if (!Array.isArray(familyMembers)) {
//       return res.status(400).json({ success: false, message: "familyMembers must be an array." });
//     }

//     // **Extract Child and Sibling Images as Arrays**
//     const childImages = files.childImages ? files.childImages.map((file) => file.path.replace(/\\/g, "/")) : [];
//     const siblingImages = files.siblingImages ? files.siblingImages.map((file) => file.path.replace(/\\/g, "/")) : [];

//     console.log("Extracted Child Images:", childImages);
//     console.log("Extracted Sibling Images:", siblingImages);

//     let childIndex = 0;
//     let siblingIndex = 0;

//     // **Ensure Each Child Gets an Image in Order**
//     familyMembers = familyMembers.map((member) => {
//       let image = null;

//       if (member.relationType === "Father") image = getImagePath("fatherImage");
//       if (member.relationType === "Mother") image = getImagePath("motherImage");
//       if (member.relationType === "Spouse") image = getImagePath("spouseImage");
//       if (member.relationType === "Parent Anniversary") image = getImagePath("parentAnniversaryImage");
//       if (member.relationType === "Marriage Anniversary") image = getImagePath("marriageAnniversaryImage");

//       // **Assign Child Images in Order**
//       if (member.relationType === "Child") {
//         if (childIndex < childImages.length) {
//           image = childImages[childIndex];
//         }
//         childIndex++; // Move to the next available child image
//       }

//       // **Assign Sibling Images in Order**
//       if (member.relationType === "Sibling") {
//         if (siblingIndex < siblingImages.length) {
//           image = siblingImages[siblingIndex];
//         }
//         siblingIndex++;
//       }

//       return {
//         ...member,
//         userId,
//         image,
//         relationId: member.relationId || new mongoose.Types.ObjectId(),
//         eventId: member.eventId || new mongoose.Types.ObjectId(),
//       };
//     });

//     console.log("Final Family Members Data with Image Paths:", JSON.stringify(familyMembers, null, 2));

//     let familyInfo = await FamilyInfo.findOne({ userId });

//     if (familyInfo) {
//       familyInfo.set({ familyMembers, onboardingStatus });
//       await familyInfo.save();
//       console.log("Updated Family Info:", familyInfo);
//     } else {
//       familyInfo = new FamilyInfo({ userId, familyMembers, onboardingStatus });
//       await familyInfo.save();
//       console.log("Saved New Family Info:", familyInfo);
//     }

//     // **Create Events for Each Family Member**
//     for (const member of familyMembers) {
//       await Event.create({
//         userId,
//         eventId: new mongoose.Types.ObjectId(),
//         name: `${member.fullName}'s ${member.eventType}`,
//         date: member.dob,
//         relation: member.relationType,
//         eventType: member.eventType,
//         image: member.image || null,
//       });
//     }

//     res.status(201).json({
//       success: true,
//       message: "Family information saved successfully.",
//       data: familyInfo,
//     });
//   } catch (error) {
//     console.error("Error saving family info:", error);
//     res.status(500).json({ success: false, message: "Failed to save family information." });
//   }
// };


//latest code
// const saveFamilyInfo = async (req, res) => {
//   try {
//     const userId = req.user?.userId;
//     if (!userId) {
//       return res.status(401).json({ success: false, message: "User authentication failed. Please log in again." });
//     }

//     console.log("Received Request Body:", req.body);
//     console.log("Uploaded Files:", req.files);

//     let data;
//     try {
//       data = req.body.data ? JSON.parse(req.body.data) : {};
//     } catch (error) {
//       console.error("JSON Parsing Error:", error);
//       return res.status(400).json({ success: false, message: "Invalid JSON format in request body." });
//     }

//     const files = req.files || {};

//     // Function to extract file paths safely
//     const getImagePath = (fieldName) => {
//       return files[fieldName] && files[fieldName][0] ? files[fieldName][0].path.replace(/\\/g, "/") : null;
//     };

//     let { familyMembers = [], onboardingStatus } = data;

//     if (!Array.isArray(familyMembers)) {
//       return res.status(400).json({ success: false, message: "familyMembers must be an array." });
//     }

//     // Extract Child and Sibling Images
//     const childImages = files.childImages ? files.childImages.map((file) => file.path.replace(/\\/g, "/")) : [];
//     const siblingImages = files.siblingImages ? files.siblingImages.map((file) => file.path.replace(/\\/g, "/")) : [];

//     console.log("Extracted Child Images:", childImages);
//     console.log("Extracted Sibling Images:", siblingImages);

//     let childIndex = 0;
//     let siblingIndex = 0;

//     // Ensure Each Member Gets Correct Data
//     familyMembers = familyMembers.map((member) => {
//       let image = null;

//       if (member.relationType === "Father") image = getImagePath("fatherImage");
//       if (member.relationType === "Mother") image = getImagePath("motherImage");
//       if (member.relationType === "Spouse") image = getImagePath("spouseImage");
//       if (member.relationType === "Parent Anniversary") image = getImagePath("parentAnniversaryImage");
//       if (member.relationType === "Marriage Anniversary") image = getImagePath("marriageAnniversaryImage");

//       // Assign Child Images in Order
//       if (member.relationType === "Child" && childIndex < childImages.length) {
//         image = childImages[childIndex];
//         childIndex++;
//       }

//       // Assign Sibling Images in Order
//       if (member.relationType === "Sibling" && siblingIndex < siblingImages.length) {
//         image = siblingImages[siblingIndex];
//         siblingIndex++;
//       }

//       return {
//         ...member,
//         userId,
//         dob: member.eventType === "Birthday" ? member.dob : null, // Store DOB only for Birthdays
//         anniversaryDate: member.eventType === "Anniversary" ? member.anniversaryDate || member.dob : null, // Fix missing anniversaryDate
//         image,
//         relationId: member.relationId || new mongoose.Types.ObjectId(),
//         eventId: member.eventId || new mongoose.Types.ObjectId(),
//       };
//     });

//     console.log("Final Family Members Data with Image Paths:", JSON.stringify(familyMembers, null, 2));

//     let familyInfo = await FamilyInfo.findOne({ userId });

//     if (familyInfo) {
//       familyInfo.set({ familyMembers, onboardingStatus });
//       await familyInfo.save();
//       console.log("Updated Family Info:", familyInfo);
//     } else {
//       familyInfo = new FamilyInfo({ userId, familyMembers, onboardingStatus });
//       await familyInfo.save();
//       console.log("Saved New Family Info:", familyInfo);
//     }

//     // Create Events for Each Family Member
//     for (const member of familyMembers) {
//       await Event.create({
//         userId,
//         eventId: new mongoose.Types.ObjectId(),
//         name: `${member.fullName}'s ${member.eventType}`,
//         date: member.eventType === "Birthday" ? member.dob : member.anniversaryDate, // Use correct date
//         relation: member.relationType,
//         eventType: member.eventType,
//         image: member.image || null,
//       });
//     }

//     res.status(201).json({
//       success: true,
//       message: "Family information saved successfully.",
//       data: familyInfo,
//     });
//   } catch (error) {
//     console.error("Error saving family info:", error);
//     res.status(500).json({ success: false, message: "Failed to save family information." });
//   }
// };

const saveFamilyInfo = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User authentication failed. Please log in again." });
    }

    console.log("Received Request Body:", req.body);
    console.log("Uploaded Files:", req.files);

    let data;
    try {
      data = req.body.data ? JSON.parse(req.body.data) : {};
    } catch (error) {
      console.error("JSON Parsing Error:", error);
      return res.status(400).json({ success: false, message: "Invalid JSON format in request body." });
    }

    const files = req.files || {};

    // Function to extract file paths safely
    const getImagePath = (fieldName) => {
      return files[fieldName] && files[fieldName][0] ? files[fieldName][0].path.replace(/\\/g, "/") : null;
    };

    let { familyMembers = [], onboardingStatus } = data;

    if (!Array.isArray(familyMembers)) {
      return res.status(400).json({ success: false, message: "familyMembers must be an array." });
    }

    // Extract Child and Sibling Images
    const childImages = files.childImages ? files.childImages.map((file) => file.path.replace(/\\/g, "/")) : [];
    const siblingImages = files.siblingImages ? files.siblingImages.map((file) => file.path.replace(/\\/g, "/")) : [];

    console.log("Extracted Child Images:", childImages);
    console.log("Extracted Sibling Images:", siblingImages);

    let childIndex = 0;
    let siblingIndex = 0;

    // Ensure Each Member Gets Correct Data
    familyMembers = familyMembers.map((member) => {
      let image = null;

      if (member.relationType === "Father") image = getImagePath("fatherImage");
      if (member.relationType === "Mother") image = getImagePath("motherImage");
      if (member.relationType === "Spouse") image = getImagePath("spouseImage");
      if (member.relationType === "Parent Anniversary") image = getImagePath("parentAnniversaryImage");
      if (member.relationType === "Marriage Anniversary") image = getImagePath("marriageAnniversaryImage");

      // Assign Child Images in Order
      if (member.relationType === "Child" && childIndex < childImages.length) {
        image = childImages[childIndex];
        childIndex++;
      }

      // Assign Sibling Images in Order
      if (member.relationType === "Sibling" && siblingIndex < siblingImages.length) {
        image = siblingImages[siblingIndex];
        siblingIndex++;
      }

      // ✅ Generate a single eventId to be used in both schemas
      const eventId = new mongoose.Types.ObjectId();

      return {
        ...member,
        userId,
        dob: member.eventType === "Birthday" ? member.dob : null,
        anniversaryDate: member.eventType === "Anniversary" ? member.anniversaryDate || member.dob : null,
        image,
        relationId: member.relationId || new mongoose.Types.ObjectId(),
        eventId, // Use this eventId for both FamilyInfo and Event schemas
      };
    });

    console.log("Final Family Members Data with Image Paths:", JSON.stringify(familyMembers, null, 2));

    let familyInfo = await FamilyInfo.findOne({ userId });

    if (familyInfo) {
      familyInfo.set({ familyMembers, onboardingStatus });
      await familyInfo.save();
      console.log("Updated Family Info:", familyInfo);
    } else {
      familyInfo = new FamilyInfo({ userId, familyMembers, onboardingStatus });
      await familyInfo.save();
      console.log("Saved New Family Info:", familyInfo);
    }

    // Create Events for Each Family Member using the same eventId
    for (const member of familyMembers) {
      await Event.create({
        userId,
        eventId: member.eventId, // ✅ Use the same eventId from FamilyInfo schema
        name: `${member.fullName}'s ${member.eventType}`,
        date: member.eventType === "Birthday" ? member.dob : member.anniversaryDate,
        relation: member.relationType,
        eventType: member.eventType,
        image: member.image || null,
      });
    }

    res.status(201).json({
      success: true,
      message: "Family information saved successfully.",
      data: familyInfo,
    });
  } catch (error) {
    console.error("Error saving family info:", error);
    res.status(500).json({ success: false, message: "Failed to save family information." });
  }
};


const getFamilyMemberEvents = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User authentication failed. Please log in again." });
    }

    // Fetch the family info for the user
    const familyInfo = await FamilyInfo.findOne({ userId });

    if (!familyInfo || !familyInfo.familyMembers) {
      return res.status(404).json({ success: false, message: "No family events found." });
    }

    const events = familyInfo.familyMembers
      .filter(member => member.dob) // Ensure member has a date of birth or anniversary
      .map(member => ({
        userId,
        name: `${member.fullName}'s ${member.eventType}`,
        date: member.dob,
        relation: member.relationType,
        image: member.image || null,
        eventId: member.eventId || null,
      }));

    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Error fetching family member events:", error);
    res.status(500).json({ success: false, message: "Failed to fetch family member events." });
  }
};

//latest code 
// const updateFamilyMember = async (req, res) => {
//   try {
//     const userId = req.user?.userId;
//     const { relationId } = req.params;

//     if (!userId) {
//       return res.status(401).json({ success: false, message: "User authentication failed. Please log in again." });
//     }

//     let updateData = req.body;

//     // ✅ Ensure `anniversaryDate` is null if it's not valid
//     if (!updateData.anniversaryDate || updateData.anniversaryDate === "null") {
//       updateData.anniversaryDate = null;
//     }

//     // If an image is uploaded, update the image path
//     if (req.file) {
//       const filePath = req.file.path.replace(/\\/g, "/");
//       // Remove everything before "uploads/" to get only the relative path
//       const relativePath = filePath.split("uploads/").pop();
//       updateData.image = `uploads/${relativePath}`;
//     }
    
//     // Find the family member
//     const familyInfo = await FamilyInfo.findOne({ userId, "familyMembers.relationId": relationId });

//     if (!familyInfo) {
//       return res.status(404).json({ success: false, message: "Family member not found." });
//     }

//     const familyMember = familyInfo.familyMembers.find((member) => member.relationId.toString() === relationId);

//     if (!familyMember) {
//       return res.status(404).json({ success: false, message: "Family member not found in records." });
//     }

//     // **Update FamilyInfo Schema**
//     const updatedFamilyInfo = await FamilyInfo.findOneAndUpdate(
//       { userId, "familyMembers.relationId": relationId },
//       {
//         $set: {
//           "familyMembers.$.fullName": updateData.fullName || familyMember.fullName,
//           "familyMembers.$.dob": updateData.dob || familyMember.dob,
//           "familyMembers.$.anniversaryDate": updateData.anniversaryDate, // ✅ Null-safe update
//           "familyMembers.$.relationType": updateData.relationType || familyMember.relationType,
//           "familyMembers.$.eventType": updateData.eventType || familyMember.eventType,
//           "familyMembers.$.image": updateData.image || familyMember.image,
//         },
//       },
//       { new: true }
//     );

//     console.log("Updated Family Info:", updatedFamilyInfo);

//     // **Update the corresponding event in EventSchema**
//     const updatedEvent = await Event.findOneAndUpdate(
//       { eventId: familyMember?.eventId },
//       {
//         $set: {
//           name: `${updateData.fullName || familyMember.fullName}'s ${updateData.eventType || familyMember.eventType}`,
//           date: updateData.dob || updateData.anniversaryDate, // ✅ Make sure it's correct
//           relation: updateData.relationType || familyMember.relationType,
//           eventType: updateData.eventType || familyMember.eventType,
//           image: updateData.image || familyMember.image,
//         },
//       },
//       { new: true }
//     );
// console.log(familyMember.eventId,'--------------------')
//     if (!updatedEvent) {
//       return res.status(404).json({ success: false, message: "Event not found." });
//     }

//     console.log("Updated Event Info:", updatedEvent);

//     res.status(200).json({
//       success: true,
//       message: "Family member and associated event updated successfully.",
//       data: {
//         updatedFamilyInfo,
//         updatedEvent,
//       },
//     });
//   } catch (error) {
//     console.error("Error updating family member and event:", error);
//     res.status(500).json({ success: false, message: "Failed to update family member and event." });
//   }
// };

const updateFamilyMember = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { relationId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User authentication failed. Please log in again." });
    }

    let updateData = req.body;

    // ✅ Ensure `anniversaryDate` is null if it's not valid
    if (!updateData.anniversaryDate || updateData.anniversaryDate === "null") {
      updateData.anniversaryDate = null;
    }

    // If an image is uploaded, update the image path
    if (req.file) {
      const filePath = req.file.path.replace(/\\/g, "/");
      const relativePath = filePath.split("uploads/").pop();
      updateData.image = `uploads/${relativePath}`;
    }
    
    // Find the family member
    const familyInfo = await FamilyInfo.findOne({ userId, "familyMembers.relationId": relationId });

    if (!familyInfo) {
      return res.status(404).json({ success: false, message: "Family member not found." });
    }

    const familyMember = familyInfo.familyMembers.find((member) => member.relationId.toString() === relationId);

    if (!familyMember) {
      return res.status(404).json({ success: false, message: "Family member not found in records." });
    }

    // **Update FamilyInfo Schema**
    await FamilyInfo.findOneAndUpdate(
      { userId, "familyMembers.relationId": relationId },
      {
        $set: {
          "familyMembers.$.fullName": updateData.fullName || familyMember.fullName,
          "familyMembers.$.dob": updateData.dob || familyMember.dob,
          "familyMembers.$.anniversaryDate": updateData.anniversaryDate,
          "familyMembers.$.relationType": updateData.relationType || familyMember.relationType,
          "familyMembers.$.eventType": updateData.eventType || familyMember.eventType,
          "familyMembers.$.image": updateData.image || familyMember.image,
        },
      },
      { new: true }
    );

    // **Update the corresponding event in EventSchema**
    const updatedEvent = await Event.findOneAndUpdate(
      { eventId: familyMember.eventId }, // ✅ Use the correct eventId
      {
        $set: {
          name: `${updateData.fullName || familyMember.fullName}'s ${updateData.eventType || familyMember.eventType}`,
          date: updateData.dob || updateData.anniversaryDate,
          relation: updateData.relationType || familyMember.relationType,
          eventType: updateData.eventType || familyMember.eventType,
          image: updateData.image || familyMember.image,
        },
      },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    res.status(200).json({ success: true, message: "Family member and event updated successfully." });
  } catch (error) {
    console.error("Error updating family member and event:", error);
    res.status(500).json({ success: false, message: "Failed to update family member and event." });
  }
};




module.exports = { getFamilyInfo, saveFamilyInfo, familyUpload, getFamilyMemberEvents,updateFamilyMember };
