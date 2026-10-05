const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const {
  checkBudgetNotifications,
} = require("../services/budgetNotificationService");

// CREATE TRANSACTION
const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, description, date } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: "Type, amount and category are required",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be income or expense",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const transaction = await Transaction.create({
      user: req.userId,
      type,
      amount,
      category,
      description,
      date,
    });

    if (transaction.type === "expense") {
      const budgets = await Budget.find({
        user: req.userId,
        category: transaction.category,
        startDate: { $lte: transaction.date },
        endDate: { $gte: transaction.date },
      });

      for (const budget of budgets) {
        await checkBudgetNotifications(req.userId, budget._id);
      }
    }

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL USER TRANSACTIONS
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      user: req.userId,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE USER TRANSACTION
const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE USER TRANSACTION
const updateTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, description, date } = req.body;

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (type !== undefined) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Type must be income or expense",
        });
      }

      transaction.type = type;
    }

    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }

      transaction.amount = amount;
    }

    if (category !== undefined) {
      transaction.category = category;
    }

    if (description !== undefined) {
      transaction.description = description;
    }

    if (date !== undefined) {
      transaction.date = date;
    }

    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE USER TRANSACTION
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};
