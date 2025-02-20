const Pool = require("../models/PoolModal")
const Wishlist = require("../models/Wishlist");
const User = require("../models/User");
const Notification = require("../models/Notification");
const UserProfile = require("../models/UserProfile");

// ✅ 1. Create a Pool 19/02/2025
// const createPool = async (req, res) => {
//     try {
//       const { wishId, totalAmount } = req.body;
//       const userId = req.user?.userId;
  
//       if (!wishId || !totalAmount) {
//         return res.status(400).json({ success: false, message: "Wish ID and Total Amount are required." });
//       }
  
//       // ✅ Check if the wish is already purchased or marked
//       const wish = await Wishlist.findById(wishId);
//       if (!wish) {
//         return res.status(404).json({ success: false, message: "Wishlist item not found." });
//       }
  
//       if (wish.status === "Purchased" || wish.status === "Mark") {
//         return res.status(400).json({ success: false, message: "This wish is already purchased or marked. Pooling is not allowed." });
//       }
  
//       // ✅ Check if a pool already exists
//       const existingPool = await Pool.findOne({ wishId });
//       if (existingPool) {
//         return res.status(400).json({ success: false, message: "A pool already exists for this wish." });
//       }
  
//       // ✅ Create a new Pool
//       const newPool = new Pool({
//         wishId,
//         totalAmount,
//         collectedAmount: 0,
//         status: "Pending",
//         contributors: [],
//       });
  
//       // ✅ Update the wish status to "Pooling"
//       wish.status = "Pooling";
//       await wish.save();
//       await newPool.save();
  
//       return res.status(201).json({ success: true, message: "Pool created successfully.", data: newPool });
//     } catch (error) {
//       console.error("❌ Error creating pool:", error);
//       return res.status(500).json({ success: false, message: "Server error." });
//     }
//   };

const createPool = async (req, res) => {
  try {
    const { wishId, totalAmount } = req.body;
    const userId = req.user?.userId;

    const wish = await Wishlist.findById(wishId);
    if (!wish) {
      return res.status(404).json({ success: false, message: "Wishlist item not found." });
    }

    // ✅ Restrict pool creation if someone else marked it
    if (wish.status === "Mark" && wish.markedBy?.userId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: `This wish is marked by ${wish.markedBy?.name}. Only they can create a pool.` 
      });
    }

    if (wish.status === "Purchased" || wish.status === "Completed") {
      return res.status(400).json({ success: false, message: "This wish is already purchased or completed." });
    }

    // ✅ Check if a pool already exists
    const existingPool = await Pool.findOne({ wishId });
    if (existingPool) {
      return res.status(400).json({ success: false, message: "A pool already exists for this wish." });
    }

    // ✅ Create a new Pool
    const newPool = new Pool({
      wishId,
      totalAmount,
      collectedAmount: 0,
      status: "Pending",
      contributors: [],
    });

    wish.status = "Pooling"; // Update status
    await wish.save();
    await newPool.save();

    return res.status(201).json({ success: true, message: "Pool created successfully.", data: newPool });

  } catch (error) {
    console.error("❌ Error creating pool:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};


// ✅ 2. Contribute to Pool
// const contributeToPool = async (req, res) => {
//     try {
//       const { wishId, amount } = req.body;
//       const userId = req.user?.userId;
  
//       if (!wishId || !amount) {
//         return res.status(400).json({ success: false, message: "Wish ID and amount are required." });
//       }
  
//       const pool = await Pool.findOne({ wishId }).populate("contributors.userId", "name");
//       if (!pool) {
//         return res.status(404).json({ success: false, message: "Pool not found." });
//       }
  
//       pool.collectedAmount += amount;
//       pool.contributors.push({ userId, amount });
  
//       if (pool.collectedAmount >= pool.totalAmount) {
//         pool.status = "Completed";
//       }
  
//       await pool.save();
  
//       // ✅ Get all contributors except the current user
//       const otherContributors = pool.contributors.filter(contributor => contributor.userId.toString() !== userId);
  
//       // ✅ Create notifications for all other contributors
//       otherContributors.forEach(async (contributor) => {
//         const message = `A new contribution of $${amount} was added to the pool for your wish.`;
//         const newNotification = new Notification({
//           userId: contributor.userId,
//           message,
//           type: "Pool Contribution",
//           wishId,
//         });
//         await newNotification.save();
//       });
  
//       return res.status(200).json({ success: true, message: "Contribution added successfully, notifications sent.", data: pool });
//     } catch (error) {
//       console.error("❌ Error contributing to pool:", error);
//       return res.status(500).json({ success: false, message: "Server error." });
//     }
//   };
const contributeToPool = async (req, res) => {
  try {
    const { wishId, amount } = req.body;
    const userId = req.user?.userId;

    if (!wishId || !amount) {
      return res.status(400).json({ success: false, message: "Wish ID and amount are required." });
    }

    // ✅ Find the Pool
    const pool = await Pool.findOne({ wishId }).populate("contributors.userId", "name");
    if (!pool) {
      return res.status(404).json({ success: false, message: "Pool not found." });
    }

    // ✅ Prevent contribution if Pool is already Completed
    if (pool.status === "Completed") {
      return res.status(400).json({ success: false, message: "This pool is already completed. No more contributions allowed!" });
    }

    // ✅ Add Contribution
    pool.collectedAmount += amount;
    pool.contributors.push({ userId, amount });

    // ✅ Check if Pool is Full & Update Status
    if (pool.collectedAmount >= pool.totalAmount) {
      pool.status = "Completed";
      
      // ✅ Update Wishlist Status to "Completed" when Pool is Full
      await Wishlist.findByIdAndUpdate(wishId, { status: "Completed" });

      console.log("✅ Pool completed & Wishlist status updated!");
    }

    // ✅ Save Pool Update
    await pool.save();

    return res.status(200).json({ 
      success: true, 
      message: "Contribution added successfully.", 
      data: pool 
    });

  } catch (error) {
    console.error("❌ Error contributing to pool:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ✅ 3. Get Pool Details
const getPoolDetails = async (req, res) => {
  try {
      const { wishId } = req.params;

      // ✅ Find the Pool and Populate Contributors' User IDs
      const pool = await Pool.findOne({ wishId }).populate("contributors.userId", "fullName");

      if (!pool) {
          return res.status(200).json({ success: true, data: null });
      }

      // ✅ Fetch User Profiles separately
      const contributorUserIds = pool.contributors.map(c => c.userId._id);
      const userProfiles = await UserProfile.find({ userId: { $in: contributorUserIds } }).select("userId profileImage");

      // ✅ Map Contributors to Include Profile Image
      const contributors = pool.contributors.map(contributor => {
          const userProfile = userProfiles.find(profile => profile.userId.toString() === contributor.userId._id.toString());
          return {
              userId: contributor.userId._id,
              name: contributor.userId.fullName,
              profileImage: userProfile && userProfile.profileImage ? userProfile.profileImage : "assets/default-user.png",
              amount: contributor.amount
          };
      });

      return res.status(200).json({
          success: true,
          data: { 
              _id: pool._id,
              wishId: pool.wishId,
              totalAmount: pool.totalAmount,
              collectedAmount: pool.collectedAmount,
              status: pool.status,
              contributors: contributors,  // ✅ Updated Contributors List
              createdAt: pool.createdAt,
              updatedAt: pool.updatedAt
          }
      });

  } catch (error) {
      console.error("❌ Error fetching pool details:", error);
      return res.status(500).json({ success: false, message: "Server error." });
  }
};

  

// ✅ 4. Get Contributors
const getContributors = async (req, res) => {
  try {
    const { wishId } = req.params;

    const pool = await Pool.findOne({ wishId }).populate("contributors.userId", "name profileImage");
    if (!pool) {
      return res.status(404).json({ success: false, message: "Pool not found." });
    }

    return res.status(200).json({ success: true, data: pool.contributors });
  } catch (error) {
    console.error("❌ Error fetching contributors:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ✅ 5. Invite Users to Pool
const inviteUsersToPool = async (req, res) => {
  try {
    const { wishId, invitedUserIds } = req.body;

    if (!wishId || !invitedUserIds || invitedUserIds.length === 0) {
      return res.status(400).json({ success: false, message: "Wish ID and at least one invited user are required." });
    }

    const users = await User.find({ _id: { $in: invitedUserIds } }).select("name email");
    if (!users.length) {
      return res.status(400).json({ success: false, message: "No valid users found." });
    }

    return res.status(200).json({
      success: true,
      message: `Invites sent to ${users.length} users.`,
      invitedUsers: users,
    });
  } catch (error) {
    console.error("❌ Error inviting users to pool:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  createPool,
  contributeToPool,
  getPoolDetails,
  getContributors,
  inviteUsersToPool,
};
