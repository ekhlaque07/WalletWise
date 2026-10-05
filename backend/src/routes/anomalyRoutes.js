const express = require("express");

const {
    detectAnomalies
} = require("../controllers/anomalyController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, detectAnomalies);

module.exports = router;