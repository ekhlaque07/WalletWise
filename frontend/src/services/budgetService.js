import API from "./api";

// =====================================================
// NORMALIZE BUDGET PAYLOAD
// =====================================================

const normalizeBudgetPayload = (budgetData) => ({
  category: String(
    budgetData.category || ""
  ).trim(),

  amount: Number(
    budgetData.amount
  ),

  period:
    budgetData.period ||
    "monthly",

  startDate:
    budgetData.startDate,

  endDate:
    budgetData.endDate,
});


// =====================================================
// GET ALL BUDGETS
// =====================================================

export const getBudgets = async () => {
  const response = await API.get(
    "/budgets"
  );

  return response.data;
};


// =====================================================
// GET SINGLE BUDGET
// =====================================================

export const getBudgetById = async (
  id
) => {
  const response = await API.get(
    `/budgets/${id}`
  );

  return response.data;
};


// =====================================================
// CREATE
// =====================================================

export const createBudget = async (
  budgetData
) => {
  const payload =
    normalizeBudgetPayload(
      budgetData
    );

  const response = await API.post(
    "/budgets",
    payload
  );

  return response.data;
};


// =====================================================
// UPDATE
// =====================================================

export const updateBudget = async (
  id,
  budgetData
) => {
  const payload =
    normalizeBudgetPayload(
      budgetData
    );

  const response = await API.put(
    `/budgets/${id}`,
    payload
  );

  return response.data;
};


// =====================================================
// DELETE
// =====================================================

export const deleteBudget = async (
  id
) => {
  const response = await API.delete(
    `/budgets/${id}`
  );

  return response.data;
};