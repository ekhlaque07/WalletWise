const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

const {
  createNotification,
} = require("./notificationService");

const Notification = require("../models/Notification");

const checkBudgetNotifications = async (userId, budgetId) => {
  try {
    const budget = await Budget.findOne({
      _id: budgetId,
      user: userId,
    });

    if (!budget) return;

    // Calculate total expenses for this budget
    const expenses = await Transaction.aggregate([
      {
        $match: {
          user: budget.user,
          type: "expense",
          category: budget.category,
          date: {
            $gte: budget.startDate,
            $lte: budget.endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalSpent = expenses[0]?.total || 0;

    // Prevent division by zero
    if (budget.amount <= 0) {
      return;
    }

    const percentage =
      (totalSpent / budget.amount) * 100;

    /*
    |--------------------------------------------------------------------------
    | 100%+ → Budget Exceeded
    |--------------------------------------------------------------------------
    */

    if (percentage >= 100) {
      const existingNotification =
        await Notification.findOne({
          user: userId,
          relatedId: budget._id,
          type: "budget",
          title: "Budget Exceeded",
        });

      // Create only once
      if (!existingNotification) {
        await createNotification({
          userId,
          title: "Budget Exceeded",
          message: `You have spent ₹${totalSpent.toFixed(
            2
          )} against your ₹${budget.amount.toFixed(
            2
          )} ${budget.category} budget.`,
          type: "budget",
          priority: "high",
          relatedId: budget._id,
          actionUrl: "/budgets",
        });
      }

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | 80%+ → Budget Warning
    |--------------------------------------------------------------------------
    */

    if (percentage >= 80) {
      const existingNotification =
        await Notification.findOne({
          user: userId,
          relatedId: budget._id,
          type: "budget",
          title: "Budget Warning",
        });

      // Create only once
      if (!existingNotification) {
        await createNotification({
          userId,
          title: "Budget Warning",
          message: `You have used ${percentage.toFixed(
            1
          )}% of your ${budget.category} budget.`,
          type: "budget",
          priority: "medium",
          relatedId: budget._id,
          actionUrl: "/budgets",
        });
      }
    }
  } catch (error) {
    console.error(
      "Budget Notification Service Error:",
      error
    );
  }
};

module.exports = {
  checkBudgetNotifications,
};