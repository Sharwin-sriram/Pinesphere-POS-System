const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const branchRoutes = require("./routes/branchRoutes");

dotenv.config();

const app = express();


// MIDDLEWARE
app.use(cors());

app.use(express.json());


// MONGODB CONNECTION
mongoose.connect("mongodb://127.0.0.1:27017/franchiseDB")
.then(() => {
  console.log("MongoDB Connected");
})
.catch((error) => {
  console.log(error);
});


// ROUTES
app.use("/api/branches", branchRoutes);


// SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});