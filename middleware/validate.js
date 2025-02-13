const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  console.log("Received Token:", token);

  if (!token) {
    return res.status(401).json({ success: false, message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    return res.status(400).json({ success: false, message: "Invalid Token" });
  }
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access Denied. Admins only." });
    }
    next();
  };
  
  module.exports = { verifyToken, isAdmin };
  