const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");

// ==========================================
// GET USER PROFILE
// ==========================================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};

// ==========================================
// UPDATE USERNAME
// ==========================================
const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    const cleanUsername = username.trim();

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check whether username is already taken
    const existingUser = await User.findOne({
      username: cleanUsername,
      _id: { $ne: req.userId },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username is already taken",
      });
    }

    user.username = cleanUsername;

    await user.save();

    res.status(200).json({
      message: "Username updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================
const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    res.status(500).json({
      message: "Failed to change password",
    });
  }
};

// ==========================================
// DELETE ACCOUNT PERMANENTLY
// ==========================================
const deleteAccount = async (req, res) => {
  try {
    const { confirmation } = req.body;

    if (confirmation !== "DELETE") {
      return res.status(400).json({
        message: "Please type DELETE to confirm account deletion",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Delete all user's transactions
    await Transaction.deleteMany({
      user: req.userId,
    });

    // Delete all user's budgets
    await Budget.deleteMany({
      user: req.userId,
    });

    // Delete all user's goals
    await Goal.deleteMany({
      user: req.userId,
    });

    // Finally delete user
    await User.findByIdAndDelete(req.userId);

    res.status(200).json({
      message: "Account deleted permanently",
    });
  } catch (error) {
    console.error("Delete account error:", error);

    res.status(500).json({
      message: "Failed to delete account",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};