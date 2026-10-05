const ML_SERVICE_URL =
    process.env.ML_SERVICE_URL || "http://localhost:8000";

const axios = require("axios");
const Transaction = require("../models/Transaction");

const {
    notifyCashFlowRisk
} = require("../services/aiNotificationService");


// ==========================================
// CASH FLOW PREDICTION
// ==========================================

const getCashFlowPrediction = async (req, res) => {

    try {

        const userId = req.userId;

        // ---------------------------------------
        // Get user's transactions
        // ---------------------------------------

        const transactions = await Transaction.find({
            user: userId
        }).sort({
            date: 1
        });

        if (transactions.length === 0) {

            return res.status(400).json({
                success: false,
                message: "No transaction data found"
            });
        }


        // ---------------------------------------
        // Group transactions by month
        // ---------------------------------------

        const monthlyData = {};

        transactions.forEach((transaction) => {

            const date = new Date(transaction.date);

            const monthKey =
                `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}`;


            if (!monthlyData[monthKey]) {

                monthlyData[monthKey] = {
                    income: 0,
                    expense: 0
                };

            }


            if (transaction.type === "income") {

                monthlyData[monthKey].income +=
                    Number(transaction.amount);

            }


            if (transaction.type === "expense") {

                monthlyData[monthKey].expense +=
                    Number(transaction.amount);

            }

        });


        // ---------------------------------------
        // Sort months
        // ---------------------------------------

        const months =
            Object.keys(monthlyData).sort();


        // ---------------------------------------
        // Need at least 2 months
        // ---------------------------------------

        if (months.length < 2) {

            return res.status(400).json({

                success: false,

                message:
                    "At least 2 different months of transaction data are required",

                monthsAvailable: months.length,

                months

            });

        }


        // ---------------------------------------
        // Create arrays
        // ---------------------------------------

        const incomes = months.map(
            (month) =>
                monthlyData[month].income
        );


        const expenses = months.map(
            (month) =>
                monthlyData[month].expense
        );


        console.log(
            "Cash-flow months:",
            months
        );

        console.log(
            "Monthly incomes:",
            incomes
        );

        console.log(
            "Monthly expenses:",
            expenses
        );


        // ---------------------------------------
        // Call Python ML service
        // ---------------------------------------

        const mlResponse = await axios.post(

            `${ML_SERVICE_URL}/predict-cashflow`,

            {
                incomes,
                expenses
            }

        );


        console.log(
            "Python cash-flow response:",
            mlResponse.data
        );


        // ---------------------------------------
        // Check Python response
        // ---------------------------------------

        if (!mlResponse.data.success) {

            return res.status(400).json({

                success: false,

                message:
                    mlResponse.data.message ||
                    "Cash-flow prediction failed"

            });

        }


        const prediction =
            mlResponse.data.prediction;


        // ---------------------------------------
        // AI notification
        // ---------------------------------------

        try {

            await notifyCashFlowRisk({
                userId,
                prediction
            });

        } catch (notificationError) {

            console.error(
                "Notification error:",
                notificationError.message
            );

            // Don't fail prediction because
            // notification failed
        }


        // ---------------------------------------
        // Return result
        // ---------------------------------------

        return res.status(200).json({

            success: true,

            historicalData: {

                months,

                incomes,

                expenses

            },

            prediction

        });

    } catch (error) {

        console.error(
            "Cash-flow prediction error:",
            error.response?.data ||
            error.message
        );


        // ---------------------------------------
        // Python service unavailable
        // ---------------------------------------

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
                "Failed to predict cash flow",

            error:
                error.response?.data ||
                error.message

        });

    }

};


module.exports = {
    getCashFlowPrediction
};