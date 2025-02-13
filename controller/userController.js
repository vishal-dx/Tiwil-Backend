const User = require("../models/User");
const Profile = require("../models/Profile");
const FamilyInfo = require("../models/FamilyInfo");
const path = require("path");

// Get User Data
const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ success: false, message: "Error fetching user data" });
  }
};
const updateProfile = async (req, res) => {
    try {
      const userId = req.user.userId; // Extract user ID from token
      console.log(userId,'////////////////////////////SS')
      const { fullName, gender, dob, location, maritalStatus, profileImage } = req.body;
  
      // Find and update the profile
      const updatedProfile = await Profile.findOneAndUpdate(
        { userId },
        { fullName, gender, dob, location, maritalStatus, profileImage },
        { new: true }
      );
  
      if (!updatedProfile) {
        return res.status(404).json({
          success: false,
          message: "Profile not found.",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        data: updatedProfile,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile.",
      });
    }
  };
  

// Upload Image Controller
const uploadImage = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image file uploaded." });
      }
  
      // ✅ Get the uploaded file path
      const imageUrl = `/uploads/${req.file.filename}`;
  
      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully.",
        imageUrl,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      return res.status(500).json({
        success: false,
        message: "Image upload failed.",
      });
    }
  };
  const closeAccount = async(req, res) => {
    const userId = req.user.userId;

    try {
      // Find and delete the profile
      const profile = await Profile.findOneAndDelete({ userId });
      if (!profile) {
        return res.status(404).json({ success: false, message: "Profile not found" });
      }
  
      // Optionally delete the user from the User model (e.g., authentication)
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      res.status(200).json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ success: false, message: "Failed to delete account" });
    }
  }
  

module.exports = {
  getUserData,
  uploadImage,
  updateProfile,
  closeAccount,
  uploadImage
};