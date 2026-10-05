const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");

const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.userId;

    // ==========================================
    // GET USER DATA
    // ==========================================

    const transactions = await Transaction.find({
      user: userId,
    }).sort({ date: 1 });

    const budgets = await Budget.find({
      user: userId,
    });

    const goals = await Goal.find({
      user: userId,
    });

    // ==========================================
    // BASIC CALCULATIONS
    // ==========================================

    let totalIncome = 0;
    let totalExpense = 0;

    let incomeTransactions = 0;
    let expenseTransactions = 0;

    let highestExpense = null;
    let largestIncome = null;

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount) || 0;

      if (transaction.type === "income") {
        totalIncome += amount;
        incomeTransactions++;

        if (!largestIncome || amount > largestIncome.amount) {
          largestIncome = {
            amount,
            category: transaction.category,
            description: transaction.description || "",
            date: transaction.date,
          };
        }
      }

      if (transaction.type === "expense") {
        totalExpense += amount;
        expenseTransactions++;

        if (!highestExpense || amount > highestExpense.amount) {
          highestExpense = {
            amount,
            category: transaction.category,
            description: transaction.description || "",
            date: transaction.date,
          };
        }
      }
    });

    const balance = totalIncome - totalExpense;

    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    const averageExpense =
      expenseTransactions > 0 ? totalExpense / expenseTransactions : 0;

    const expenseToIncomeRatio =
      totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

    // ==========================================
    // EXPENSE BY CATEGORY
    // ==========================================

    const categoryMap = {};

    transactions.forEach((transaction) => {
      if (transaction.type !== "expense") return;

      const category =
        String(transaction.category || "Other").trim() || "Other";

      const amount = Number(transaction.amount) || 0;

      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }

      categoryMap[category] += amount;
    });

    const categoryExpenses = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);

    const topSpendingCategory =
      categoryExpenses.length > 0 ? categoryExpenses[0] : null;

    // ==========================================
    // MONTHLY ANALYTICS
    // ==========================================

    const monthlyMap = {};

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);

      if (Number.isNaN(transactionDate.getTime())) return;

      const year = transactionDate.getFullYear();
      const monthNumber = transactionDate.getMonth();

      const key = `${year}-${String(monthNumber + 1).padStart(2, "0")}`;

      const monthName = transactionDate.toLocaleString("en-US", {
        month: "short",
      });

      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          month: `${monthName} ${year}`,
          income: 0,
          expense: 0,
          savings: 0,
        };
      }

      const amount = Number(transaction.amount) || 0;

      if (transaction.type === "income") {
        monthlyMap[key].income += amount;
      }

      if (transaction.type === "expense") {
        monthlyMap[key].expense += amount;
      }
    });

    const monthlyAnalytics = Object.keys(monthlyMap)
      .sort()
      .map((key) => {
        const item = monthlyMap[key];

        return {
          ...item,
          savings: item.income - item.expense,
        };
      });

    // ==========================================
    // DAILY EXPENSE ANALYTICS
    // ==========================================

    const dailyMap = {};

    transactions.forEach((transaction) => {
      if (transaction.type !== "expense") return;

      const transactionDate = new Date(transaction.date);

      if (Number.isNaN(transactionDate.getTime())) return;

      const key = transactionDate.toISOString().split("T")[0];

      if (!dailyMap[key]) {
        dailyMap[key] = {
          date: key,
          expense: 0,
        };
      }

      dailyMap[key].expense += Number(transaction.amount) || 0;
    });

    const dailyExpenseAnalytics = Object.keys(dailyMap)
      .sort()
      .map((key) => {
        const date = new Date(key);

        return {
          date: key,
          displayDate: date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          }),
          expense: dailyMap[key].expense,
        };
      });

    // ==========================================
    // BUDGET ANALYTICS
    // ==========================================

    const budgetAnalytics = budgets.map((budget) => {
      const budgetStart = new Date(budget.startDate);

      const budgetEnd = new Date(budget.endDate);

      // Include the complete end date
      budgetEnd.setHours(23, 59, 59, 999);

      const budgetCategory = String(budget.category || "")
        .trim()
        .toLowerCase();

      const spent = transactions
        .filter((transaction) => {
          if (transaction.type !== "expense") return false;

          const transactionDate = new Date(transaction.date);

          const transactionCategory = String(transaction.category || "")
            .trim()
            .toLowerCase();

          return (
            transactionDate >= budgetStart &&
            transactionDate <= budgetEnd &&
            transactionCategory === budgetCategory
          );
        })
        .reduce(
          (total, transaction) => total + (Number(transaction.amount) || 0),
          0,
        );

      const budgetAmount = Number(budget.amount) || 0;

      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      return {
        id: budget._id,
        category: budget.category,
        budget: budgetAmount,
        spent,
        remaining: Math.max(budgetAmount - spent, 0),
        percentage: Number(percentage.toFixed(2)),
      };
    });

    // ==========================================
    // GOAL ANALYTICS
    // ==========================================

    // GOAL ANALYTICS
    const goalAnalytics = goals.map((goal) => {
      const targetAmount = Number(goal.targetAmount) || 0;
      const savedAmount = Number(goal.currentAmount) || 0;

      const percentage =
        targetAmount > 0 ? (savedAmount / targetAmount) * 100 : 0;

      return {
        id: goal._id,
        name: goal.name,
        targetAmount,
        savedAmount,
        remaining: Math.max(targetAmount - savedAmount, 0),
        percentage: Number(percentage.toFixed(2)),
      };
    });

    // ==========================================
    // FINANCIAL INSIGHTS
    // ==========================================

    const insights = [];

    if (totalIncome === 0 && totalExpense === 0) {
      insights.push(
        "Start adding income and expense transactions to understand your financial habits.",
      );
    }

    if (totalIncome > 0 && totalExpense > totalIncome) {
      insights.push(
        "Your expenses are currently higher than your income. Consider reducing unnecessary spending.",
      );
    }

    if (savingsRate >= 20) {
      insights.push(
        `Great job! You are currently saving ${savingsRate.toFixed(
          1,
        )}% of your income.`,
      );
    } else if (totalIncome > 0 && savingsRate >= 0) {
      insights.push(
        `Your current savings rate is ${savingsRate.toFixed(
          1,
        )}%. Try increasing your savings gradually.`,
      );
    }

    if (topSpendingCategory) {
      insights.push(
        `${topSpendingCategory.category} is your highest spending category at ₹${topSpendingCategory.amount.toLocaleString(
          "en-IN",
        )}.`,
      );
    }

    if (highestExpense) {
      insights.push(
        `Your highest single expense is ₹${highestExpense.amount.toLocaleString(
          "en-IN",
        )} for ${highestExpense.category}.`,
      );
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      success: true,

      summary: {
        totalIncome,
        totalExpense,
        balance,
        savingsRate: Number(savingsRate.toFixed(2)),
        averageExpense: Number(averageExpense.toFixed(2)),
        expenseToIncomeRatio: Number(expenseToIncomeRatio.toFixed(2)),
        incomeTransactions,
        expenseTransactions,
        totalTransactions: transactions.length,
      },

      categoryExpenses,

      monthlyAnalytics,

      dailyExpenseAnalytics,

      budgetAnalytics,

      goalAnalytics,

      highestExpense,

      largestIncome,

      topSpendingCategory,

      insights,

      transactionCount: transactions.length,
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    next(error);
  }
};

module.exports = {
  getAnalytics,
};
