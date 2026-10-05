const Goal = require("../models/Goal");


// CREATE GOAL
const createGoal = async (req, res) => {
  try {
    const {
      name,
      targetAmount,
      currentAmount,
      deadline,
      description,
    } = req.body;

    console.log("Create Goal Request:", {
      userId: req.userId,
      name,
      targetAmount,
      currentAmount,
      deadline,
    });

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Goal name is required.",
      });
    }

    const target = Number(targetAmount);
    const current = Number(currentAmount || 0);

    if (Number.isNaN(target) || target <= 0) {
      return res.status(400).json({
        success: false,
        message: "Target amount must be greater than 0.",
      });
    }

    if (Number.isNaN(current) || current < 0) {
      return res.status(400).json({
        success: false,
        message: "Current amount cannot be negative.",
      });
    }

    if (current > target) {
      return res.status(400).json({
        success: false,
        message:
          "Current amount cannot exceed target amount.",
      });
    }

    const goal = await Goal.create({
      user: req.userId,
      name: name.trim(),
      targetAmount: target,
      currentAmount: current,
      deadline: deadline || undefined,
      description: description || "",
    });

    return res.status(201).json({
      success: true,
      message: "Goal created successfully",
      goal,
    });

  } catch (error) {
    console.error("Create goal error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Server error",
    });
  }
};


// GET ALL GOALS
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: goals.length,
      goals,
    });
  } catch (error) {
    console.error("Get goals error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// GET SINGLE GOAL
const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    res.status(200).json({
      success: true,
      goal,
    });
  } catch (error) {
    console.error("Get goal error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// UPDATE GOAL
const updateGoal = async (req, res) => {
  try {
    const {
      name,
      targetAmount,
      currentAmount,
      deadline,
      description,
      status,
    } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    const newTargetAmount =
      targetAmount !== undefined
        ? targetAmount
        : goal.targetAmount;

    const newCurrentAmount =
      currentAmount !== undefined
        ? currentAmount
        : goal.currentAmount;

    if (newTargetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Target amount must be greater than 0",
      });
    }

    if (newCurrentAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Current amount cannot be negative",
      });
    }

    if (newCurrentAmount > newTargetAmount) {
      return res.status(400).json({
        success: false,
        message: "Current amount cannot exceed target amount",
      });
    }

    if (name !== undefined) goal.name = name;
    if (targetAmount !== undefined) {
      goal.targetAmount = targetAmount;
    }
    if (currentAmount !== undefined) {
      goal.currentAmount = currentAmount;
    }
    if (deadline !== undefined) {
      goal.deadline = deadline;
    }
    if (description !== undefined) {
      goal.description = description;
    }
    if (status !== undefined) {
      goal.status = status;
    }

    // Automatically mark goal as completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = "completed";
    } else {
      goal.status = "active";
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: "Goal updated successfully",
      goal,
    });
  } catch (error) {
    console.error("Update goal error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// DELETE GOAL
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("Delete goal error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
};