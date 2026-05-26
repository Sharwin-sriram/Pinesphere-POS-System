const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(

  {
    name: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
    },

    location: {
      type: String,
      required: true,
    },

    managerName: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Branch", branchSchema);