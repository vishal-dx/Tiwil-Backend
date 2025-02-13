const express = require("express");
// const { sendOTP, verifyOTP, loginUser } = require("../controllers/authController");
const { getUserData, updateProfile, uploadImage, closeAccount } = require("../controller/userController");
const { getProfile, getUserProfile, saveUserProfile } = require("../controller/profileController");
const { verifyToken } = require("../middleware/validate");
const { upload, profileUpload } = require("../middleware/multer");
const { getFamilyInfo, saveFamilyInfo, familyUpload, updateFamilyMember,   } = require("../controller/familyInfoController");
const { getEvents, getEventById, eventUpload, createEvent, updateEvent, deleteEvent, getPastEvents } = require("../controller/eventsController");
const { sendLoginOTP, sendSignupOTP, verifySignupOTP, loginWithPhone } = require("../controller/authController");
const router = express.Router();


router.post("/signup/send-otp", sendSignupOTP); // Send OTP for signup
router.post("/signup/verify-otp", verifySignupOTP); // Verify OTP and create account
router.post("/login/send-otp", sendLoginOTP); // Send OTP for login
router.post("/login/verify-otp", loginWithPhone); // **Login: Verify OTP**

router.get("/user-data", verifyToken, getUserData);


// Route to save or update profile data
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

router.get("/user-profile", verifyToken, getUserProfile);
router.post("/user-profile", verifyToken, profileUpload.single("profileImage"), saveUserProfile);

router.get("/family-info", verifyToken, getFamilyInfo); // Get family info
router.post("/family-info", verifyToken, familyUpload, saveFamilyInfo); // Save family info
// router.get("/family-events", verifyToken, getFamilyMemberEvents)
router.post("/create-event", upload.single("image"), createEvent);
// router.put("/update-event/:eventId", upload.single("image"), updateEvent);
router.delete("/delete-event/:eventId", deleteEvent);
router.get("/events",verifyToken, getEvents)
router.put("/events/:eventId", verifyToken, updateEvent);
router.get("/events/:eventId", verifyToken, getEventById);
router.put("/family-info/update/:relationId", verifyToken,upload.single("image"), updateFamilyMember);
router.delete("/profile", verifyToken, closeAccount)

router.get("/history", verifyToken, getPastEvents);



module.exports = router;
