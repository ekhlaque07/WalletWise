const Approval = require("../models/Approval");

const {
  executeApprovedAction,
} = require("../services/approvalService");

const {
  notifyApprovalExecuted,
  notifyApprovalRejected,
} = require("../services/aiNotificationService");


// =====================================================
// GET ALL APPROVALS
// =====================================================

const getApprovals = async (req, res) => {
  try {
    const approvals = await Approval.find({
      user: req.userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      approvals,
    });

  } catch (error) {
    console.error(
      "Get Approvals Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch approvals.",
    });
  }
};


// =====================================================
// APPROVE ACTION
// =====================================================

const approveAction = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    console.log(
      "Approving approval:",
      id
    );

    const approval = await Approval.findOne({
      _id: id,
      user: userId,
    });

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: "Approval not found.",
      });
    }

    if (approval.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending approvals can be approved.",
      });
    }

    console.log(
      "Executing action:",
      approval.action
    );

    console.log(
      "Parameters:",
      approval.parameters
    );

    try {

      const result =
        await executeApprovedAction({
          action: approval.action,
          parameters:
            approval.parameters || {},
          userId,
        });


      approval.status = "executed";

      approval.result = result;

      approval.executedAt = new Date();

      await approval.save();


      // Notification should NOT break
      // the approval execution.

      try {

        await notifyApprovalExecuted({
          userId,
          action: approval.action,
        });

      } catch (notificationError) {

        console.error(
          "Approval notification error:",
          notificationError.message
        );

      }


      return res.status(200).json({
        success: true,
        message:
          "Action approved and executed.",
        approval,
      });

    } catch (executionError) {

      console.error(
        "Action execution error:",
        executionError
      );


      approval.status = "failed";

      approval.result = {
        error:
          executionError.message,
      };

      await approval.save();


      return res.status(500).json({
        success: false,
        message:
          executionError.message ||
          "Failed to execute approved action.",
        approval,
      });
    }

  } catch (error) {

    console.error(
      "Approve Action Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to approve action.",
    });
  }
};


// =====================================================
// REJECT ACTION
// =====================================================

const rejectAction = async (req, res) => {
  try {

    const userId = req.userId;
    const { id } = req.params;

    const {
      reason = "Rejected by user.",
    } = req.body || {};


    console.log(
      "Rejecting approval:",
      id
    );


    const approval = await Approval.findOne({
      _id: id,
      user: userId,
    });


    if (!approval) {
      return res.status(404).json({
        success: false,
        message: "Approval not found.",
      });
    }


    if (approval.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending approvals can be rejected.",
      });
    }


    approval.status = "rejected";

    approval.rejectionReason =
      reason;


    await approval.save();


    // Notification should NOT break
    // rejection.

    try {

      await notifyApprovalRejected({
        userId,
        action: approval.action,
      });

    } catch (notificationError) {

      console.error(
        "Rejection notification error:",
        notificationError.message
      );

    }


    return res.status(200).json({
      success: true,
      message:
        "Action rejected successfully.",
      approval,
    });

  } catch (error) {

    console.error(
      "Reject Action Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to reject action.",
    });
  }
};


module.exports = {
  getApprovals,
  approveAction,
  rejectAction,
};