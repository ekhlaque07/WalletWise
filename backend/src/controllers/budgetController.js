const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

// =====================================================
// HELPER: CALCULATE BUDGET STATUS
// =====================================================

const calculateBudgetStatus = (spent, amount) => {
  if (amount <= 0) {
    return {
      percentage: 0,
      remaining: 0,
      status: "safe",
      message: "No budget amount available.",
    };
  }

  const percentage = (spent / amount) * 100;
  const remaining = amount - spent;

  let status = "safe";
  let message = "You are within your budget.";

  if (percentage >= 100) {
    status = "exceeded";
    message = `You have exceeded your budget by ₹${Math.abs(
      remaining
    ).toLocaleString("en-IN")}.`;
  } else if (percentage >= 90) {
    status = "critical";
    message = `You have used ${percentage.toFixed(
      0
    )}% of your budget.`;
  } else if (percentage >= 70) {
    status = "warning";
    message = `You have used ${percentage.toFixed(
      0
    )}% of your budget.`;
  }

  return {
    percentage: Number(percentage.toFixed(2)),
    remaining,
    status,
    message,
  };
};


// =====================================================
// HELPER: ADD SPENDING INFORMATION TO BUDGETS
// =====================================================

const enrichBudgetsWithSpending = async (budgets, userId) => {
  const enrichedBudgets = [];

  for (const budget of budgets) {
    // -------------------------------------------------
    // Find expense transactions belonging to this user
    // and inside this budget's date range.
    // -------------------------------------------------

    const transactions = await Transaction.find({
      user: userId,
      type: "expense",

      date: {
        $gte: new Date(budget.startDate),
        $lte: new Date(
          new Date(budget.endDate).setHours(
            23,
            59,
            59,
            999
          )
        ),
      },
    }).lean();

    // -------------------------------------------------
    // Match category case-insensitively
    // -------------------------------------------------

    const budgetCategory = String(
      budget.category
    )
      .trim()
      .toLowerCase();

    const categoryTransactions =
      transactions.filter((transaction) => {
        return (
          String(transaction.category)
            .trim()
            .toLowerCase() === budgetCategory
        );
      });

    // -------------------------------------------------
    // Calculate total spent
    // -------------------------------------------------

    const spent = categoryTransactions.reduce(
      (total, transaction) => {
        return total + Number(transaction.amount || 0);
      },
      0
    );

    // -------------------------------------------------
    // Calculate status
    // -------------------------------------------------

    const calculations = calculateBudgetStatus(
      spent,
      Number(budget.amount)
    );

    enrichedBudgets.push({
      ...budget,

      spent: Number(spent.toFixed(2)),

      remaining: Number(
        calculations.remaining.toFixed(2)
      ),

      percentage: calculations.percentage,

      status: calculations.status,

      statusMessage: calculations.message,

      transactionCount:
        categoryTransactions.length,
    });
  }

  return enrichedBudgets;
};


// =====================================================
// CREATE BUDGET
// =====================================================

const createBudget = async (req, res) => {
  try {
    const {
      category,
      amount,
      period,
      startDate,
      endDate,
    } = req.body;

    // -------------------------------------------------
    // Validation
    // -------------------------------------------------

    if (
      !category ||
      amount === undefined ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Category, amount, startDate and endDate are required",
      });
    }

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Budget amount must be greater than 0",
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid start or end date",
      });
    }

    if (parsedStartDate > parsedEndDate) {
      return res.status(400).json({
        success: false,
        message:
          "Start date cannot be after end date",
      });
    }

    // -------------------------------------------------
    // Create budget
    // -------------------------------------------------

    const budget = await Budget.create({
      user: req.userId,
      category: category.trim(),
      amount: numericAmount,
      period: period || "monthly",
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    });

    // -------------------------------------------------
    // Calculate current spending immediately
    // -------------------------------------------------

    const [enrichedBudget] =
      await enrichBudgetsWithSpending(
        [budget.toObject()],
        req.userId
      );

    return res.status(201).json({
      success: true,
      message: "Budget created successfully",
      budget: enrichedBudget,
    });
  } catch (error) {
    console.error(
      "Create budget error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// GET ALL BUDGETS
// =====================================================

const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({
      user: req.userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const enrichedBudgets =
      await enrichBudgetsWithSpending(
        budgets,
        req.userId
      );

    // -------------------------------------------------
    // Overall summary
    // -------------------------------------------------

    const totalBudget = enrichedBudgets.reduce(
      (total, budget) =>
        total + Number(budget.amount || 0),
      0
    );

    const totalSpent = enrichedBudgets.reduce(
      (total, budget) =>
        total + Number(budget.spent || 0),
      0
    );

    const totalRemaining =
      totalBudget - totalSpent;

    const exceededBudgets =
      enrichedBudgets.filter(
        (budget) => budget.status === "exceeded"
      );

    const criticalBudgets =
      enrichedBudgets.filter(
        (budget) => budget.status === "critical"
      );

    const warningBudgets =
      enrichedBudgets.filter(
        (budget) => budget.status === "warning"
      );

    // -------------------------------------------------
    // Notifications / alerts
    // -------------------------------------------------

    const notifications = [];

    exceededBudgets.forEach((budget) => {
      notifications.push({
        type: "error",
        category: budget.category,
        title: `${budget.category} budget exceeded`,
        message: `You have spent ₹${Number(
          budget.spent
        ).toLocaleString(
          "en-IN"
        )} against a budget of ₹${Number(
          budget.amount
        ).toLocaleString("en-IN")}.`,
      });
    });

    criticalBudgets.forEach((budget) => {
      notifications.push({
        type: "warning",
        category: budget.category,
        title: `${budget.category} budget is almost exceeded`,
        message: `You have used ${budget.percentage}% of your ${budget.category} budget.`,
      });
    });

    warningBudgets.forEach((budget) => {
      notifications.push({
        type: "info",
        category: budget.category,
        title: `${budget.category} budget warning`,
        message: `You have used ${budget.percentage}% of your ${budget.category} budget.`,
      });
    });

    return res.status(200).json({
      success: true,

      count: enrichedBudgets.length,

      budgets: enrichedBudgets,

      summary: {
        totalBudget: Number(
          totalBudget.toFixed(2)
        ),

        totalSpent: Number(
          totalSpent.toFixed(2)
        ),

        totalRemaining: Number(
          totalRemaining.toFixed(2)
        ),

        exceededCount:
          exceededBudgets.length,

        criticalCount:
          criticalBudgets.length,

        warningCount:
          warningBudgets.length,
      },

      notifications,
    });
  } catch (error) {
    console.error(
      "Get budgets error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// GET SINGLE BUDGET
// =====================================================

const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.userId,
    }).lean();

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    const [enrichedBudget] =
      await enrichBudgetsWithSpending(
        [budget],
        req.userId
      );

    return res.status(200).json({
      success: true,
      budget: enrichedBudget,
    });
  } catch (error) {
    console.error(
      "Get budget error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// UPDATE BUDGET
// =====================================================

const updateBudget = async (req, res) => {
  try {
    const {
      category,
      amount,
      period,
      startDate,
      endDate,
    } = req.body;

    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    // -------------------------------------------------
    // Amount validation
    // -------------------------------------------------

    if (amount !== undefined) {
      const numericAmount = Number(amount);

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Budget amount must be greater than 0",
        });
      }

      budget.amount = numericAmount;
    }

    // -------------------------------------------------
    // Dates
    // -------------------------------------------------

    const newStartDate = startDate
      ? new Date(startDate)
      : new Date(budget.startDate);

    const newEndDate = endDate
      ? new Date(endDate)
      : new Date(budget.endDate);

    if (
      Number.isNaN(newStartDate.getTime()) ||
      Number.isNaN(newEndDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid start or end date",
      });
    }

    if (newStartDate > newEndDate) {
      return res.status(400).json({
        success: false,
        message:
          "Start date cannot be after end date",
      });
    }

    // -------------------------------------------------
    // Update fields
    // -------------------------------------------------

    if (category !== undefined) {
      budget.category = category.trim();
    }

    if (period !== undefined) {
      budget.period = period;
    }

    budget.startDate = newStartDate;
    budget.endDate = newEndDate;

    await budget.save();

    // -------------------------------------------------
    // Return updated spending information
    // -------------------------------------------------

    const [enrichedBudget] =
      await enrichBudgetsWithSpending(
        [budget.toObject()],
        req.userId
      );

    return res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      budget: enrichedBudget,
    });
  } catch (error) {
    console.error(
      "Update budget error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// DELETE BUDGET
// =====================================================

const deleteBudget = async (req, res) => {
  try {
    const budget =
      await Budget.findOneAndDelete({
        _id: req.params.id,
        user: req.userId,
      });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete budget error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
};