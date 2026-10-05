const express = require("express");

const {
    getCashFlowPrediction
} = require("../controllers/cashflowController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/predict",
    authMiddleware,
    getCashFlowPrediction
);

module.exports = router;