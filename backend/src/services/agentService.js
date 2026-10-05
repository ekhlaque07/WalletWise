const { chatJSON } = require("./aiService");

const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Goal = require("../models/Goal");

const { getAvailableTools } = require("./agentTools");

/*
|--------------------------------------------------------------------------
| Run WalletWise Agent
|--------------------------------------------------------------------------
*/

const runAgent = async ({ userId, message }) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!message || !message.trim()) {
    throw new Error("Message is required.");
  }

  /*
  |--------------------------------------------------------------------------
  | Get User Financial Data
  |--------------------------------------------------------------------------
  */

  const [transactions, budgets, goals] = await Promise.all([
    Transaction.find({
      user: userId,
    })
      .select("type amount category description date")
      .sort({ date: -1 })
      .limit(50)
      .lean(),

    Budget.find({
      user: userId,
    })
      .select("category amount period startDate endDate")
      .lean(),

    Goal.find({
      user: userId,
    })
      .select("name targetAmount currentAmount deadline status")
      .lean(),
  ]);

  /*
  |--------------------------------------------------------------------------
  | Available Tools
  |--------------------------------------------------------------------------
  */

  const tools = getAvailableTools();

  /*
  |--------------------------------------------------------------------------
  | System Prompt
  |--------------------------------------------------------------------------
  */

  const systemPrompt = `
You are WalletWise Agentic AI.

Analyze the user's financial data and respond to their request.

You must return ONLY valid JSON.

Return exactly:

{
  "type": "advice",
  "message": "short useful response",
  "action": {
    "name": null,
    "parameters": {}
  },
  "requiresApproval": false
}

For database-changing requests, return:

{
  "type": "action",
  "message": "short explanation",
  "action": {
    "name": "create_budget",
    "parameters": {}
  },
  "requiresApproval": true
}

Available actions:

- create_budget
- update_budget
- create_goal

Rules:

1. Use "advice" for analysis and recommendations.
2. Use "action" only when the user asks to create or modify financial data.
3. Every action requires approval.
4. Never execute an action yourself.
5. Never invent IDs.
6. Never invent financial amounts.
7. Use only the provided financial data.
8. If required information is missing, ask the user.
9. create_budget requires:
   category, amount, startDate, endDate.
10. update_budget requires:
   budgetId, amount.
11. create_goal requires:
   name, targetAmount, currentAmount, deadline.
12. Keep the message concise.
13. Return ONLY JSON.
`;

  /*
  |--------------------------------------------------------------------------
  | User Prompt
  |--------------------------------------------------------------------------
  */

  const userPrompt = `
USER REQUEST:

${message}

USER FINANCIAL DATA:

Transactions:
${JSON.stringify(transactions, null, 2)}

Budgets:
${JSON.stringify(budgets, null, 2)}

Goals:
${JSON.stringify(goals, null, 2)}
`;

  /*
  |--------------------------------------------------------------------------
  | Hugging Face
  |--------------------------------------------------------------------------
  */

  const result = await chatJSON({
    system: systemPrompt,
    user: userPrompt,
    temperature: 0.2,
    maxTokens: 3000,
  });

  /*
  |--------------------------------------------------------------------------
  | Validate Response
  |--------------------------------------------------------------------------
  */

  if (!result || typeof result !== "object") {
    throw new Error("Agent returned an invalid response.");
  }

  if (result.type !== "advice" && result.type !== "action") {
    throw new Error("Agent returned an unsupported response type.");
  }

  /*
  |--------------------------------------------------------------------------
  | Advice
  |--------------------------------------------------------------------------
  */

  if (result.type === "advice") {
    return {
      type: "advice",

      message: result.message || "Here is your financial advice.",

      action: null,

      requiresApproval: false,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Action
  |--------------------------------------------------------------------------
  */

  if (!result.action?.name) {
    throw new Error("Agent action name is missing.");
  }

  return {
    type: "action",

    message: result.message || "This action requires your approval.",

    action: {
      name: result.action.name,

      parameters: result.action.parameters || {},
    },

    requiresApproval: true,
  };
};

module.exports = {
  runAgent,
};
