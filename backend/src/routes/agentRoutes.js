const express = require("express");

const router = express.Router();

const { aiLimiter } = require("../middleware/securityMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const { runAgent } = require("../controllers/agentController");

router.post(
  "/chat",
  authMiddleware,
  aiLimiter,
  runAgent
);

module.exports = router;