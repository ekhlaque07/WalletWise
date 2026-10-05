const express = require("express");

const {
    categorizeTransaction
} = require("../controllers/mlController");

const router = express.Router();

const {
    predictSpending
} = require("../controllers/mlController");


const authMiddleware = require("../middleware/authMiddleware");


// ==========================================
// PREDICT SPENDING
// ==========================================

router.get(
    "/spending",
    authMiddleware,
    predictSpending
);

router.post(
    "/categorize",
    categorizeTransaction
);


module.exports = router;