import API from "./api";


// ==========================================
// GET SPENDING PREDICTION
// ==========================================

export const getSpendingPrediction = async () => {

    const token = localStorage.getItem("token");

    const response = await API.get("/ml/spending",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};