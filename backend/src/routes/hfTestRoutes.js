const express = require("express");

const {
  testHuggingFace,
} = require("../controllers/hfTestController");

const router = express.Router();

router.get("/test", testHuggingFace);

module.exports = router;