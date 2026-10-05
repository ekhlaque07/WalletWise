const simulateFinancialScenario = async (req, res) => {
  try {
    const {
      monthlyIncome,
      monthlyExpenses,
      expenseReduction,
      additionalIncome,
      additionalExpense,
      duration,
    } = req.body;

    // Validate required fields
    if (
      monthlyIncome === undefined ||
      monthlyExpenses === undefined ||
      monthlyIncome === "" ||
      monthlyExpenses === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Monthly income and expenses are required",
      });
    }

    // Convert inputs to numbers
    const income = Number(monthlyIncome);
    const expenses = Number(monthlyExpenses);
    const reduction = Number(expenseReduction ?? 0);
    const extraIncome = Number(additionalIncome ?? 0);
    const extraExpense = Number(additionalExpense ?? 0);
    const months = Number(duration ?? 6);

    // Validate numeric values
    const values = [
      income,
      expenses,
      reduction,
      extraIncome,
      extraExpense,
      months,
    ];

    if (values.some((value) => !Number.isFinite(value))) {
      return res.status(400).json({
        success: false,
        message: "All inputs must be valid numbers",
      });
    }

    // Validate ranges
    if (
      income < 0 ||
      expenses < 0 ||
      reduction < 0 ||
      reduction > 100 ||
      extraIncome < 0 ||
      extraExpense < 0 ||
      !Number.isInteger(months) ||
      months < 1 ||
      months > 60
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid simulation values",
      });
    }

    // Current financial situation
    const currentSavings = income - expenses;

    // Apply hypothetical changes
    const reducedExpenses =
      expenses * (1 - reduction / 100);

    const simulatedIncome =
      income + extraIncome;

    const simulatedExpenses =
      reducedExpenses + extraExpense;

    const simulatedSavings =
      simulatedIncome - simulatedExpenses;

    // Calculate projected savings
    const currentFutureSavings =
      currentSavings * months;

    const simulatedFutureSavings =
      simulatedSavings * months;

    const additionalSavings =
      simulatedFutureSavings - currentFutureSavings;

    // Return results
    return res.status(200).json({
      success: true,

      scenario: {
        duration: months,
        expenseReduction: reduction,
        additionalIncome: extraIncome,
        additionalExpense: extraExpense,
      },

      current: {
        monthlyIncome: income,
        monthlyExpenses: expenses,
        monthlySavings: currentSavings,
        projectedSavings: currentFutureSavings,
      },

      simulated: {
        monthlyIncome: simulatedIncome,
        monthlyExpenses: simulatedExpenses,
        monthlySavings: simulatedSavings,
        projectedSavings: simulatedFutureSavings,
      },

      impact: {
        monthlySavingsDifference:
          simulatedSavings - currentSavings,

        totalSavingsDifference:
          additionalSavings,
      },
    });
  } catch (error) {
    console.error("Simulator Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to simulate financial scenario",
    });
  }
};

module.exports = {
  simulateFinancialScenario,
};