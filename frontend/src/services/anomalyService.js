import api from "./api";

export const getAnomalies = async () => {
    const response = await api.get("/anomalies");
    return response.data;
};