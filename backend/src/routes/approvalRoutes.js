const express = require("express");

const {
  getApprovals,
  approveAction,
  rejectAction,
} = require("../controllers/approvalController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getApprovals
);

router.patch(
  "/:id/approve",
  authMiddleware,
  approveAction
);

router.patch(
  "/:id/reject",
  authMiddleware,
  rejectAction
);

module.exports = router;