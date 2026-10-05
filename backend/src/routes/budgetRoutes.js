const express = require("express");

const {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE
router.post("/", authMiddleware, createBudget);

// GET ALL
router.get("/", authMiddleware, getBudgets);

// GET SINGLE
router.get("/:id", authMiddleware, getBudgetById);

// UPDATE
router.put("/:id", authMiddleware, updateBudget);

// DELETE
router.delete("/:id", authMiddleware, deleteBudget);

module.exports = router;