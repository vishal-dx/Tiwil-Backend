const express = require("express");
const connectDb = require("./config/db");
require("dotenv").config();
const cors = require("cors");
const router = require("./routes/route");
const path = require("path")
const app = express();

app.use(express.json());
app.use(cors());

// Use the authentication routes
app.use("/", router);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/profileImages', express.static(path.join(__dirname,'profileImages')));
// Connect to the database
connectDb();

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
