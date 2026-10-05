import API from "../services/api";

import { useCallback, useEffect, useState } from "react";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../services/transactionService";

import "./Transactions.css";

const initialForm = {
  type: "expense",
  amount: "",
  category: "",
  description: "",
  date: "",
};

function Transactions() {
  const [transactions, setTransactions] = useState([]);

  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [aiCategory, setAiCategory] = useState("");
  const [aiConfidence, setAiConfidence] = useState(null);
  const [categorizing, setCategorizing] = useState(false);

  const handleAICategorization = async () => {
    console.log("AI button clicked");

    if (!form.description.trim()) {
      alert("Please enter a transaction description first.");
      return;
    }

    try {
      setCategorizing(true);
      setError("");

      console.log("Sending description:", form.description);

      const response = await API.post("/ml/categorize", {
        description: form.description,
      });

      const data = response.data;

      console.log("AI response:", data);

      // Store AI result
      setAiCategory(data.category);
      setAiConfidence(data.confidence);

      // Automatically update category field
      setForm((prev) => ({
        ...prev,
        category: data.category,
      }));
    } catch (err) {
      console.error("AI categorization error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to categorize transaction.",
      );
    } finally {
      setCategorizing(false);
    }
  };

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getTransactions();

      setTransactions(Array.isArray(data) ? data : data.transactions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await updateTransaction(editingId, form);
      } else {
        await createTransaction(form);
      }

      setForm(initialForm);
      setEditingId(null);

      await loadTransactions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);

    setForm({
      type: transaction.type || "expense",
      amount: transaction.amount || "",
      category: transaction.category || "",
      description: transaction.description || "",
      date: transaction.date
        ? new Date(transaction.date).toISOString().split("T")[0]
        : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?",
    );

    if (!confirmed) return;

    try {
      await deleteTransaction(id);

      await loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  return (
    <div className="page-container transactions-page">
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>

        <p className="page-subtitle">
          Track and manage your income and expenses.
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="transaction-layout">
        <div className="card transaction-form-card">
          <h2>{editingId ? "Edit Transaction" : "Add Transaction"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Type</label>

              <select
                className="form-control"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="expense">Expense</option>

                <option value="income">Income</option>
              </select>
            </div>

            <div className="form-group">
              <label>Amount</label>

              <input
                className="form-control"
                type="number"
                name="amount"
                placeholder="Enter amount"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>

              <input
                className="form-control"
                type="text"
                name="category"
                placeholder="Food, Travel, Salary..."
                value={form.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>

              <input
                className="form-control"
                type="text"
                name="description"
                placeholder="Optional description"
                value={form.description}
                onChange={handleChange}
              />

              <button
                type="button"
                className="ai-category-btn"
                onClick={handleAICategorization}
                disabled={categorizing}
              >
                {categorizing ? "Analyzing..." : "✨ Categorize with AI"}
              </button>

              {aiCategory && (
                <div className="ai-category-result">
                  <div className="ai-category-title">✨ AI detected</div>

                  <div className="ai-category-value">{aiCategory}</div>

                  {aiConfidence !== null && (
                    <div className="ai-confidence">
                      Confidence: {Math.round(aiConfidence * 100)}%
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Date</label>

              <input
                className="form-control"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-buttons">
              <button
                className="primary-button"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Transaction"
                    : "Add Transaction"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card transactions-list-card">
          <div className="section-heading">
            <h2>Recent Transactions</h2>

            <span>{transactions.length} records</span>
          </div>

          {loading ? (
            <div className="loading">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">No transactions found.</div>
          ) : (
            <div className="transaction-list">
              {transactions.map((transaction) => (
                <div className="transaction-item" key={transaction._id}>
                  <div className="transaction-main">
                    <div className={`transaction-icon ${transaction.type}`}>
                      {transaction.type === "income" ? "+" : "-"}
                    </div>

                    <div>
                      <h3>{transaction.category}</h3>

                      <p>{transaction.description || "No description"}</p>

                      <small>
                        {transaction.date
                          ? new Date(transaction.date).toLocaleDateString()
                          : "-"}
                      </small>
                    </div>
                  </div>

                  <div className="transaction-right">
                    <strong
                      className={
                        transaction.type === "income"
                          ? "income-amount"
                          : "expense-amount"
                      }
                    >
                      {transaction.type === "income" ? "+" : "-"}₹
                      {Number(transaction?.amount ?? 0).toLocaleString()}
                    </strong>

                    <div className="item-actions">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(transaction)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => handleDelete(transaction._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Transactions;
