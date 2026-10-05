const express = require("express");

const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's profile
router.get("/profile", authMiddleware, getProfile);

// Update username
router.put("/profile", authMiddleware, updateProfile);

// Change password
router.put("/password", authMiddleware, changePassword);

// Permanently delete account
router.delete("/account", authMiddleware, deleteAccount);

module.exports = router;