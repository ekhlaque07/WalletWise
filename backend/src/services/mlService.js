const axios = require("axios");

const ML_SERVICE_URL =
    process.env.ML_SERVICE_URL || "http://localhost:8000";


const getSpendingPrediction = async ({
    transactions,
    previousMonthSpending,
    twoMonthsAgoSpending
}) => {

    const response = await axios.post(
        `${ML_SERVICE_URL}/predict`,
        {
            transactions,

            previous_month_spending:
                previousMonthSpending,

            two_months_ago_spending:
                twoMonthsAgoSpending
        }
    );

    return response.data;
};


module.exports = {
    getSpendingPrediction
};