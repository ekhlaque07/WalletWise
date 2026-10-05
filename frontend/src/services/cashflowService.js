import API from "./api";

export const getCashFlowPrediction = async () => {

    const token = localStorage.getItem("token");

    const response = await API.get("/cashflow/predict",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};