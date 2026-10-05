import API from "./api";

export const getTransactions = async () => {
    const response = await API.get("/transactions");

    return response.data;
};

export const createTransaction = async (transactionData) => {
    const response = await API.post("/transactions", transactionData);

    return response.data;
};

export const updateTransaction = async (id, transactionData) => {
    const response = await API.put(
        `/transactions/${id}`,
        transactionData
    );

    return response.data;
};

export const deleteTransaction = async (id) => {
    const response = await API.delete(`/transactions/${id}`);

    return response.data;
};