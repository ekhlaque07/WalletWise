const Approval = require("../models/Approval");

const { runAgent } = require("../services/agentService");

const {
  notifyAgentApprovalRequired,
} = require("../services/aiNotificationService");

/*
|--------------------------------------------------------------------------
| Run Agent
|--------------------------------------------------------------------------
*/

const runAgentController = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("🤖 Agent Controller");
    console.log("User ID:", userId);
    console.log("Message:", req.body.message);

    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Run Agent Service
    |--------------------------------------------------------------------------
    */

    const result = await runAgent({
      userId,
      message,
    });
    console.log("🤖 Agent Result:", result);

    /*
    |--------------------------------------------------------------------------
    | Database Action Requires Approval
    |--------------------------------------------------------------------------
    */

    if (result.type === "action" && result.requiresApproval === true) {
      const approval = await Approval.create({
        user: userId,

        action: result.action.name,

        parameters: result.action.parameters || {},

        reason: result.message || "Agent requested a financial action.",

        status: "pending",
      });

      await notifyAgentApprovalRequired({
        userId,
        action: approval.action,
        message: approval.reason,
      });

      return res.status(200).json({
        success: true,

        type: "approval_required",

        message: result.message || "This action requires your approval.",

        approval: {
          id: approval._id,

          action: approval.action,

          parameters: approval.parameters,

          reason: approval.reason,

          status: approval.status,
        },
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Normal Advice
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      type: "advice",

      message: result.message,

      action: null,
    });
  } catch (error) {
    console.error("========== AGENT ERROR ==========");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }

    console.error("================================");

    return res.status(500).json({
      success: false,
      message: error.message || "Agent failed.",
    });
  }
};

module.exports = {
  runAgent: runAgentController,
};
