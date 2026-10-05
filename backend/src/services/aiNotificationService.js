const {
  createNotification,
} = require("./notificationService");


// =====================================================
// AGENT ACTION REQUIRES APPROVAL
// =====================================================

const notifyAgentApprovalRequired = async ({
  userId,
  action,
  message,
}) => {

  if (!userId || !action) {
    return null;
  }

  return createNotification({
    userId,

    title:
      "AI Action Requires Approval",

    message:
      message ||
      `WalletWise AI wants to perform: ${action}. Please review the request.`,

    type: "agent",

    priority: "high",

    actionUrl: "/approvals",
  });
};


// =====================================================
// APPROVAL EXECUTED
// =====================================================

const notifyApprovalExecuted = async ({
  userId,
  action,
}) => {

  if (!userId || !action) {
    return null;
  }

  return createNotification({

    userId,

    title:
      "AI Action Executed",

    message:
      `Your approved AI action "${action}" was successfully executed.`,

    type: "agent",

    priority: "medium",

    actionUrl: "/approvals",
  });
};


// =====================================================
// APPROVAL REJECTED
// =====================================================

const notifyApprovalRejected = async ({
  userId,
  action,
}) => {

  if (!userId || !action) {
    return null;
  }

  return createNotification({

    userId,

    title:
      "AI Action Rejected",

    message:
      `The AI action "${action}" was rejected.`,

    type: "agent",

    priority: "medium",

    actionUrl: "/approvals",
  });
};

const notifyCashFlowRisk = async ({
    userId,
    prediction,
}) => {
    try {
        console.log("Cash-flow risk notification check");

        console.log("User:", userId);

        console.log("Prediction:", prediction);

        if (!prediction) {
            return;
        }

        const predictedIncome = Number(
            prediction.predicted_income || 0
        );

        const predictedExpense = Number(
            prediction.predicted_expense || 0
        );

        const predictedCashflow = Number(
            prediction.predicted_cashflow || 0
        );

        console.log(
            "Predicted income:",
            predictedIncome
        );

        console.log(
            "Predicted expense:",
            predictedExpense
        );

        console.log(
            "Predicted cashflow:",
            predictedCashflow
        );

        // Cash-flow risk condition
        if (predictedCashflow < 0) {
            console.log(
                "⚠️ Cash-flow risk detected"
            );

            // Your notification creation logic
            // can be placed here.
        }

        return {
            success: true,
        };

    } catch (error) {
        console.error(
            "Cash-flow notification error:",
            error.message
        );

        throw error;
    }
};



module.exports = {

  notifyAgentApprovalRequired,

  notifyApprovalExecuted,

  notifyApprovalRejected,

  notifyCashFlowRisk,

};