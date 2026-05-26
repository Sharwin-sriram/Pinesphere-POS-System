const Branch = require("../models/Branch");


// GET ALL BRANCHES
const getBranches = async (req, res) => {
  try {

    const filter = {};

    if (req.query.location) {
      filter.location = req.query.location;
    }

    const branches = await Branch.find(filter);

    res.status(200).json(branches);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};


// CREATE BRANCH
const createBranch = async (req, res) => {
  try {

    const branch = await Branch.create(req.body);

    res.status(201).json(branch);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

const updateBranch = async (req, res) => {

  try {

    const updatedBranch =
      await Branch.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.status(200).json(updatedBranch);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};


// DELETE BRANCH
const deleteBranch = async (req, res) => {
  try {

    await Branch.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Branch Deleted",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
};