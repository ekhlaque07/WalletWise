const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", (req, res) => {
    const dbState = mongoose.connection.readyState;

    const states = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting"
    };

    res.json({
        success: true,
        message: "WalletWise API is working",
        database: states[dbState] || "unknown"
    });
});

module.exports = router;