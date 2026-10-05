const Budget = require("../models/Budget");
const Goal = require("../models/Goal");

const tools = {
  create_budget: {
    description:
      "Create a new spending budget for a category.",

    requiresApproval: true,
  },

  update_budget: {
    description:
      "Change an existing budget amount.",

    requiresApproval: true,
  },

  create_goal: {
    description:
      "Create a new financial savings goal.",

    requiresApproval: true,
  },

  financial_advice: {
    description:
      "Provide financial advice without changing user data.",

    requiresApproval: false,
  },
};

function getAvailableTools() {
  return Object.entries(tools).map(
    ([name, config]) => ({
      name,
      description: config.description,
      requiresApproval: config.requiresApproval,
    })
  );
}

module.exports = {
  tools,
  getAvailableTools,
};