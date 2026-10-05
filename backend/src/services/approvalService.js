const Budget = require("../models/Budget");
const Goal = require("../models/Goal");

const executeApprovedAction = async ({ action, parameters, userId }) => {
  switch (action) {
    /*
    |--------------------------------------------------------------------------
    | CREATE BUDGET
    |--------------------------------------------------------------------------
    */

    case "create_budget": {
      const {
        category,
        amount,
        period = "monthly",
        startDate,
        endDate,
      } = parameters;

      if (!category || amount === undefined || !startDate || !endDate) {
        throw new Error(
          "Category, amount, startDate and endDate are required.",
        );
      }

      const budget = await Budget.create({
        user: userId,
        category,
        amount,
        period,
        startDate,
        endDate,
      });

      return {
        type: "budget_created",
        budget,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE BUDGET
    |--------------------------------------------------------------------------
    */

    case "update_budget": {
      const { budgetId, amount } = parameters;

      if (!budgetId || amount === undefined) {
        throw new Error("budgetId and amount are required.");
      }

      const budget = await Budget.findOneAndUpdate(
        {
          _id: budgetId,
          user: userId,
        },
        {
          amount,
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!budget) {
        throw new Error("Budget not found.");
      }

      return {
        type: "budget_updated",
        budget,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE GOAL
    |--------------------------------------------------------------------------
    */

    case "create_goal": {
      const { name, targetAmount, currentAmount = 0, deadline } = parameters;

      if (!name || targetAmount === undefined) {
        throw new Error("Goal name and target amount are required.");
      }

      const goal = await Goal.create({
        user: userId,
        name,
        targetAmount,
        currentAmount,
        deadline,
      });

      return {
        type: "goal_created",
        goal,
      };
    }

    /*
    |--------------------------------------------------------------------------
    | DEFAULT
    |--------------------------------------------------------------------------
    */

    default:
      throw new Error(`Unsupported action: ${action}`);
  }
};

module.exports = {
  executeApprovedAction,
};
