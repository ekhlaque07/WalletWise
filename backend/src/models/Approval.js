const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,

      enum: [
        "create_budget",
        "update_budget",
        "create_goal",
        "financial_advice",
      ],
    },

    parameters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    reason: {
      type: String,
      default: "",
    },

    status: {
      type: String,

      enum: [
        "pending",
        "approved",
        "rejected",
        "executed",
        "failed",
      ],

      default: "pending",
    },

    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    executedAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model("Approval", approvalSchema);