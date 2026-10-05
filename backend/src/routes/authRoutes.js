const express = require("express");

const { Router } = require("express");
const { authLimiter } = require("../middleware/securityMiddleware");

const router = Router();

const {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

// const router = express.Router();

router.post("/register", authLimiter, registerUser);

router.post("/login", authLimiter, loginUser);

router.get("/me", protect, getCurrentUser);

// New password recovery routes
router.post("/forgot-password", authLimiter, forgotPassword);

router.post(
    "/reset-password/:token",
    authLimiter,
    resetPassword
);

module.exports = router;