const express = require("express");

const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
} = require("../controllers/goalController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// CREATE GOAL
router.post("/", authMiddleware, createGoal);


// GET ALL GOALS
router.get("/", authMiddleware, getGoals);


// GET SINGLE GOAL
router.get("/:id", authMiddleware, getGoalById);


// UPDATE GOAL
router.put("/:id", authMiddleware, updateGoal);


// DELETE GOAL
router.delete("/:id", authMiddleware, deleteGoal);


module.exports = router;