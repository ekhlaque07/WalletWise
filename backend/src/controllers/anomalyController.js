const ML_SERVICE_URL =
    process.env.ML_SERVICE_URL || "http://localhost:8000";

const axios = require("axios");
const Transaction = require("../models/Transaction");

const {
  notifyAnomalyDetected,
} = require("../services/aiNotificationService");

const detectAnomalies = async (req, res) => {
    try {
        const userId = req.userId;

        const transactions = await Transaction.find({
            user: userId,
            type: "expense"
        }).sort({ date: -1 });

        if (transactions.length < 5) {
            return res.status(200).json({
                success: true,
                message: "Not enough transactions",
                totalTransactions: transactions.length,
                anomalyCount: 0,
                anomalies: []
            });
        }

        const mlResponse = await axios.post(
            `${ML_SERVICE_URL}/detect-anomalies`,
            {
                transactions: transactions.map(
                    (transaction) => ({
                        _id: transaction._id.toString(),
                        type: transaction.type,
                        amount: transaction.amount,
                        category: transaction.category,
                        description: transaction.description
                    })
                )
            },
            {
                timeout: 10000
            }
        );

        return res.status(200).json(mlResponse.data);

    } catch (error) {
        console.error(
            "Anomaly Detection Error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to detect anomalies"
        });
    }
};

module.exports = { detectAnomalies };