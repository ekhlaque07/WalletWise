const express = require("express");

const {
  getAIAdvice,
} = require("../controllers/aiAdvisorController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  getAIAdvice
);

module.exports = router;