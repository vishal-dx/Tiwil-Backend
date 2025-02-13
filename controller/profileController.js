const mongoose = require("mongoose");
const Profile = require("../models/Profile");
const { v4: uuidv4 } = require("uuid"); // ✅ Import UUID generator
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
// ✅ GET Profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log(userId,'11111111111111111111')
        const profile = await User.findOne({ _id:userId });

        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found." });
        }

        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ success: false, message: "Failed to fetch profile." });
    }
};

 
const uploadProfileImage = (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
  
    // Get the uploaded file URL
    const profileImageUrl = `/profileImages/${req.file.filename}`;
  
    // Optionally, update the user profile with the new profile image URL in the database
    // e.g., update the user's profile image field in your User/Profile model
  
    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImageUrl, // Send back the profile image URL
    });
  };
  const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        let userProfile = await UserProfile.findOne({ userId });

        if (!userProfile) {
            // Auto-create only with known details
            userProfile = new UserProfile({
                userId,
                fullName: req.user.fullName || "",
                email: req.user.email || "",
                phoneNumber: req.user.phoneNumber || "",
                gender: "", // Kept empty for frontend input
                dob: null, // Kept null to avoid validation issues
                location: "",
                maritalStatus: "",
                profileImage: "",
            });

            await userProfile.save();
        }

        return res.status(200).json({ success: true, data: userProfile });

    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ success: false, message: "Failed to fetch user profile." });
    }
};

const saveUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    let { fullName, email, phoneNumber, gender, dob, location, maritalStatus } = req.body;

    // Convert `dob` from string to Date
    if (dob) {
      dob = new Date(dob);
      if (isNaN(dob)) {
        return res.status(400).json({ success: false, message: "Invalid date format." });
      }
    }

    // Handle profile image if uploaded
    let profileImage = req.file ? `/profileImages/${req.file.filename}` : req.body.profileImage;

    if (!fullName || !email || !phoneNumber || !gender || !dob || !location || !maritalStatus) {
      return res.status(400).json({ success: false, message: "All required fields must be provided." });
    }

    let userProfile = await UserProfile.findOne({ userId });

    if (userProfile) {
      // ✅ Update existing profile
      userProfile.fullName = fullName;
      userProfile.email = email;
      userProfile.phoneNumber = phoneNumber;
      userProfile.gender = gender;
      userProfile.dob = dob;
      userProfile.location = location;
      userProfile.maritalStatus = maritalStatus;
      userProfile.profileStatus = true; // ✅ Mark profile as complete
      if (profileImage) {
        userProfile.profileImage = profileImage;
      }

      await userProfile.save();
      return res.status(200).json({ success: true, message: "Profile updated successfully.", data: userProfile });
    }

    // ✅ If user profile does not exist, create a new one
    const newUserProfile = new UserProfile({
      userId,
      fullName,
      email,
      phoneNumber,
      gender,
      dob,
      location,
      maritalStatus,
      profileImage,
      profileStatus: true, // ✅ Mark profile as complete
    });

    await newUserProfile.save();
    res.status(201).json({ success: true, message: "Profile saved successfully.", data: newUserProfile });
  } catch (error) {
    console.error("Error saving user profile:", error);
    res.status(500).json({ success: false, message: "Failed to save user profile." });
  }
};

  


module.exports = { getProfile,  uploadProfileImage,getUserProfile,saveUserProfile };