const ML_SERVICE_URL =
    process.env.ML_SERVICE_URL || "http://localhost:8000";

const axios = require("axios");
const Transaction = require("../models/Transaction");

// ==========================================
// PREDICT NEXT MONTH SPENDING
// ==========================================

const predictSpending = async (req, res) => {
    try {
        const userId = req.userId;

        // --------------------------------------
        // Get user's expense transactions
        // --------------------------------------

        const transactions = await Transaction.find({
            user: userId,
            type: "expense"
        }).sort({
            date: 1
        });

        if (transactions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No expense transactions found"
            });
        }

        // --------------------------------------
        // Group expenses by month
        // --------------------------------------

        const monthlyExpenses = {};

        transactions.forEach((transaction) => {
            const date = new Date(transaction.date);

            const year = date.getFullYear();

            const month = String(
                date.getMonth() + 1
            ).padStart(2, "0");

            const key = `${year}-${month}`;

            if (!monthlyExpenses[key]) {
                monthlyExpenses[key] = 0;
            }

            monthlyExpenses[key] += Number(
                transaction.amount
            );
        });

        // --------------------------------------
        // Convert to sorted monthly array
        // --------------------------------------

        const months = Object.keys(monthlyExpenses).sort();

        const monthlySpending = months.map(
            (month) => monthlyExpenses[month]
        );

        console.log("Spending months:", months);
        console.log("Monthly spending:", monthlySpending);

        // --------------------------------------
        // Need at least 2 MONTHS
        // --------------------------------------

        if (monthlySpending.length < 2) {
            return res.status(400).json({
                success: false,
                message:
                    "At least 2 different months of expense data are required",
                monthsAvailable: months.length,
                months
            });
        }

        // --------------------------------------
        // Send data to Python ML service
        // --------------------------------------

        const response = await axios.post(
            `${ML_SERVICE_URL}/predict`,
            {
                monthly_spending: monthlySpending
            }
        );

        console.log(
            "Python spending response:",
            response.data
        );

        // --------------------------------------
        // Return prediction
        // --------------------------------------

        return res.status(200).json({
            success: true,

            prediction: response.data.prediction,

            monthlySpending,

            months,

            monthsUsed: monthlySpending.length
        });

    } catch (error) {

        console.error(
            "Spending prediction error:",
            error.response?.data || error.message
        );

        if (error.code === "ECONNREFUSED") {
            return res.status(503).json({
                success: false,
                message:
                    "ML service is not running on port 8000"
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Failed to predict spending",
            error: error.response?.data || error.message
        });
    }
};


// ==========================================
// AI TRANSACTION CATEGORIZATION
// ==========================================

const categorizeTransaction = async (req, res, next) => {
    try {
        const { description } = req.body;

        if (!description || !description.trim()) {
            return res.status(400).json({
                message:
                    "Transaction description is required"
            });
        }

        const response = await axios.post(
            `${ML_SERVICE_URL}/categorize`,
            {
                description
            }
        );

        res.status(200).json(response.data);

    } catch (error) {

        console.error(
            "Transaction categorization error:",
            error.response?.data || error.message
        );

        next(error);
    }
};


module.exports = {
    predictSpending,
    categorizeTransaction
};