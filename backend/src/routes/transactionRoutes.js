const express = require("express");

const router = express.Router();

const { body } = require("express-validator");

const validate = require("../middleware/validate");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

// Create transaction
router.post(
  "/",

  authMiddleware,

  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),

  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ max: 50 })
    .withMessage("Category cannot exceed 50 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  validate,

  createTransaction,
);

// Get all transactions
router.get("/", authMiddleware, getTransactions);

// Get single transaction
router.get("/:id", authMiddleware, getTransaction);

// Update transaction
router.put("/:id", authMiddleware, updateTransaction);

// Delete transaction
router.delete("/:id", authMiddleware, deleteTransaction);

module.exports = router;
