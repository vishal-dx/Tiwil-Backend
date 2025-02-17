const Wishlist = require("../models/Wishlist");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Ensure the wishlist uploads directory exists
const wishlistUploadDirectory = path.join(__dirname, "../uploads/wishlist");
if (!fs.existsSync(wishlistUploadDirectory)) {
  fs.mkdirSync(wishlistUploadDirectory, { recursive: true });
}

// ✅ Set up storage engine
const wishlistStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📂 Upload Destination (Wishlist):", wishlistUploadDirectory);
    cb(null, wishlistUploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `wishlist-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// ✅ File filter for images
const wishlistFileFilter = (req, file, cb) => {
  console.log("🛂 Wishlist File Type:", file.mimetype);
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WEBP, and JPG files are allowed."), false);
  }
};

// ✅ Multer config for Wishlist images
const wishlistUpload = multer({
  storage: wishlistStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: wishlistFileFilter,
});

const createWishlistItem = async (req, res) => {
    try {
        console.log("📩 Request Body:", req.body);
        console.log("📷 Uploaded File:", req.file);  // Debugging log

        const { giftName, price, productLink, desireRate, description, eventId, image } = req.body;
        const userId = req.user?.userId;

        if (!eventId || !userId || !giftName || !price) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        let imageUrl = "";

        // ✅ Check if image is uploaded via Multer
        if (req.file) {
            imageUrl = `uploads/${req.file.filename}`;
            console.log("✅ Image Uploaded Successfully:", imageUrl);
        } 
        // ✅ If image is Base64, convert and save it
        else if (image && image.startsWith("data:image")) {
            const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
            if (!matches) {
                return res.status(400).json({ success: false, message: "Invalid Base64 image format." });
            }

            const ext = matches[1];  // Extract file extension (png, jpg, etc.)
            const base64Data = matches[2]; // Extract Base64 data
            const fileName = `${Date.now()}.${ext}`;
            const filePath = path.join(__dirname, "../uploads", fileName);

            // ✅ Save Base64 image as a file
            fs.writeFileSync(filePath, base64Data, { encoding: "base64" });
            imageUrl = `uploads/${fileName}`;
            console.log("✅ Base64 Image Saved:", imageUrl);
        } 
        else {
            console.log("⚠️ No image provided!");
            return res.status(400).json({ success: false, message: "Image upload failed!" });
        }

        const newWishlistItem = new Wishlist({
            eventId,
            userId,
            giftName,
            price,
            productLink,
            desireRate,
            description,
            imageUrl, 
        });

        await newWishlistItem.save();

        return res.status(201).json({
            success: true,
            message: "Wishlist item added successfully",
            data: newWishlistItem,
        });
    } catch (error) {
        console.error("❌ Error creating wishlist item:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};



  

const getWishlistByEvent = async (req, res) => {
    try {
      const { eventId } = req.params;
  
      const wishlist = await Wishlist.find({ eventId });
  
      if (!wishlist.length) {
        return res.status(404).json({ success: false, message: "No wishlist items found" });
      }
  
      return res.status(200).json({ success: true, data: wishlist });
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
  const getWishlistItemById = async (req, res) => {
    try {
      const { itemId } = req.params;
  
      const wishlistItem = await Wishlist.findById(itemId);
  
      if (!wishlistItem) {
        return res.status(404).json({ success: false, message: "Wishlist item not found" });
      }
  
      return res.status(200).json({ success: true, data: wishlistItem });
    } catch (error) {
      console.error("Error fetching wishlist item:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };

  const updateWishlistItem = async (req, res) => {
    try {
      const { itemId } = req.params;
      const updatedData = req.body;
  
      // ✅ Debugging: Check if a new file is uploaded
      console.log("Uploaded File for Update:", req.file);
  
      // ✅ If a new file is uploaded, update the imageUrl
      if (req.file) {
        updatedData.imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
      }
  
      const updatedItem = await Wishlist.findByIdAndUpdate(itemId, updatedData, { new: true });
  
      if (!updatedItem) {
        return res.status(404).json({ success: false, message: "Wishlist item not found" });
      }
  
      return res.status(200).json({ success: true, message: "Wishlist item updated", data: updatedItem });
    } catch (error) {
      console.error("Error updating wishlist item:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
  

  const deleteWishlistItem = async (req, res) => {
    try {
      const { itemId } = req.params;
  
      const deletedItem = await Wishlist.findByIdAndDelete(itemId);
  
      if (!deletedItem) {
        return res.status(404).json({ success: false, message: "Wishlist item not found" });
      }
  
      return res.status(200).json({ success: true, message: "Wishlist item deleted" });
    } catch (error) {
      console.error("Error deleting wishlist item:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
    
  
module.exports = {
    createWishlistItem, 
    getWishlistByEvent,
    getWishlistItemById,
    updateWishlistItem,
    deleteWishlistItem,
    wishlistUpload
}
