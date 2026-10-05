
import { useEffect, useState } from "react";

import {
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
} from "../services/budgetService";

import "./Budgets.css";

// =====================================================
// INITIAL FORM
// =====================================================

const initialForm = {
  category: "",
  amount: "",
  period: "monthly",
  startDate: "",
  endDate: "",
};

// =====================================================
// CATEGORIES
// =====================================================

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Travel",
  "Other",
];

// =====================================================
// ERROR HELPER
// =====================================================

function getApiError(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unable to complete request."
  );
}

// =====================================================
// MONEY FORMAT
// =====================================================

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

// =====================================================
// STATUS CONFIG
// =====================================================

function getStatusData(status) {
  switch (status) {
    case "exceeded":
      return {
        label: "Exceeded",
        icon: "⚠",
      };

    case "critical":
      return {
        label: "Almost Exceeded",
        icon: "!",
      };

    case "warning":
      return {
        label: "Watch Spending",
        icon: "!",
      };

    default:
      return {
        label: "On Track",
        icon: "✓",
      };
  }
}

// =====================================================
// COMPONENT
// =====================================================

function Budgets() {
  const [budgets, setBudgets] = useState([]);

  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    exceededCount: 0,
    criticalCount: 0,
    warningCount: 0,
  });

  const [notifications, setNotifications] = useState([]);

  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ===================================================
  // LOAD BUDGETS
  // ===================================================

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBudgets();

      const list = Array.isArray(response?.budgets)
        ? response.budgets
        : [];

      setBudgets(list);

      setSummary(
        response?.summary || {
          totalBudget: 0,
          totalSpent: 0,
          totalRemaining: 0,
          exceededCount: 0,
          criticalCount: 0,
          warningCount: 0,
        }
      );

      setNotifications(
        Array.isArray(response?.notifications)
          ? response.notifications
          : []
      );
    } catch (error) {
      console.error("Load budgets error:", error);

      setError(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadBudgets();
  }, []);

  // ===================================================
  // HANDLE INPUT
  // ===================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Category
    if (!form.category.trim()) {
      setError("Category is required.");
      return;
    }

    // Amount
    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Budget amount must be greater than 0.");
      return;
    }

    // Start date
    if (!form.startDate) {
      setError("Start date is required.");
      return;
    }

    // End date
    if (!form.endDate) {
      setError("End date is required.");
      return;
    }

    // Date validation
    if (form.endDate < form.startDate) {
      setError(
        "End date cannot be earlier than start date."
      );
      return;
    }

    const budgetData = {
      category: form.category.trim(),
      amount,
      period: form.period,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    try {
      setSaving(true);

      if (editingId) {
        await updateBudget(editingId, budgetData);
      } else {
        await createBudget(budgetData);
      }

      setForm(initialForm);
      setEditingId(null);

      // Reload spending calculations
      await loadBudgets();
    } catch (error) {
      console.error("Budget request failed:", error);

      setError(getApiError(error));
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // EDIT
  // ===================================================

  const handleEdit = (budget) => {
    setEditingId(budget._id);

    setForm({
      category: budget.category || "",

      amount: budget.amount ?? "",

      period: budget.period || "monthly",

      startDate: budget.startDate
        ? String(budget.startDate).slice(0, 10)
        : "",

      endDate: budget.endDate
        ? String(budget.endDate).slice(0, 10)
        : "",
    });

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===================================================
  // DELETE
  // ===================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteBudget(id);

      await loadBudgets();
    } catch (error) {
      console.error("Delete budget error:", error);

      setError(getApiError(error));
    }
  };

  // ===================================================
  // CANCEL
  // ===================================================

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="page-container budget-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">
        <h1 className="page-title">
          Budgets
        </h1>

        <p className="page-subtitle">
          Set spending limits and monitor
          your financial habits.
        </p>
      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="budget-summary">

        {/* TOTAL BUDGET */}

        <div className="card summary-card">
          <span>
            TOTAL BUDGET
          </span>

          <strong>
            {formatMoney(summary.totalBudget)}
          </strong>
        </div>


        {/* TOTAL SPENT */}

        <div className="card summary-card">
          <span>
            TOTAL SPENT
          </span>

          <strong>
            {formatMoney(summary.totalSpent)}
          </strong>
        </div>


        {/* REMAINING */}

        <div
          className={`card summary-card ${
            summary.totalRemaining < 0
              ? "summary-danger"
              : ""
          }`}
        >
          <span>
            REMAINING
          </span>

          <strong>
            {formatMoney(
              Math.abs(summary.totalRemaining)
            )}

            {summary.totalRemaining < 0 && (
              <small>
                {" "}
                over
              </small>
            )}
          </strong>
        </div>


        {/* EXCEEDED */}

        <div className="card summary-card">
          <span>
            EXCEEDED
          </span>

          <strong>
            {summary.exceededCount}
          </strong>
        </div>

      </div>


      {/* =================================================
          CREATE / EDIT BUDGET
      ================================================= */}

      <div className="budget-create-section">

        <div className="card budget-form-card">

          <div className="card-heading">

            <span className="section-label">
              {editingId
                ? "MANAGE"
                : "NEW BUDGET"}
            </span>

            <h2>
              {editingId
                ? "Edit Budget"
                : "Create Budget"}
            </h2>

            <p>
              Set a spending limit for
              a category and time period.
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            {/* CATEGORY */}

            <div className="form-group">

              <label htmlFor="budget-category">
                Category
              </label>

              <select
                id="budget-category"
                className="form-control"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select category
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}

              </select>

            </div>


            {/* AMOUNT */}

            <div className="form-group">

              <label htmlFor="budget-amount">
                Budget Amount
              </label>

              <input
                id="budget-amount"
                className="form-control"
                type="number"
                name="amount"
                min="0.01"
                step="0.01"
                placeholder="5000"
                value={form.amount}
                onChange={handleChange}
                required
              />

            </div>


            {/* PERIOD */}

            <div className="form-group">

              <label htmlFor="budget-period">
                Period
              </label>

              <select
                id="budget-period"
                className="form-control"
                name="period"
                value={form.period}
                onChange={handleChange}
              >

                <option value="daily">
                  Daily
                </option>

                <option value="weekly">
                  Weekly
                </option>

                <option value="monthly">
                  Monthly
                </option>

                <option value="yearly">
                  Yearly
                </option>

              </select>

            </div>


            {/* START DATE */}

            <div className="form-group">

              <label htmlFor="budget-start-date">
                Start Date
              </label>

              <input
                id="budget-start-date"
                className="form-control"
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />

            </div>


            {/* END DATE */}

            <div className="form-group">

              <label htmlFor="budget-end-date">
                End Date
              </label>

              <input
                id="budget-end-date"
                className="form-control"
                type="date"
                name="endDate"
                min={
                  form.startDate || undefined
                }
                value={form.endDate}
                onChange={handleChange}
                required
              />

            </div>


            {/* BUTTONS */}

            <div className="form-buttons">

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Budget"
                  : "Create Budget"}
              </button>


              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </div>

      </div>


      {/* =================================================
          BUDGET ALERTS
      ================================================= */}

      {notifications.length > 0 && (
        <div className="budget-alerts">

          <div className="alerts-header">

            <div>

              <span className="section-label">
                BUDGET ALERTS
              </span>

              <h2>
                Attention required
              </h2>

            </div>

            <span className="alert-count">
              {notifications.length}
            </span>

          </div>


          <div className="alerts-list">

            {notifications.map(
              (notification, index) => (

                <div
                  key={`${notification.category}-${index}`}
                  className={`budget-alert ${notification.type}`}
                >

                  <div className="alert-icon">

                    {notification.type ===
                    "error"
                      ? "⚠"
                      : notification.type ===
                        "warning"
                      ? "!"
                      : "i"}

                  </div>


                  <div>

                    <strong>
                      {notification.title}
                    </strong>

                    <p>
                      {notification.message}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </div>
      )}


      {/* =================================================
          ALL BUDGETS
      ================================================= */}

      <div className="budget-list-section">

        <div className="budget-list-heading">

          <div>

            <span className="section-label">
              YOUR BUDGETS
            </span>

            <h2>
              Budget Overview
            </h2>

            <p>
              Monitor spending across
              all your budget categories.
            </p>

          </div>

          {!loading && budgets.length > 0 && (
            <span className="budget-count">
              {budgets.length} budget
              {budgets.length === 1
                ? ""
                : "s"}
            </span>
          )}

        </div>


        <div className="budget-grid">

          {/* LOADING */}

          {loading && (
            <div className="card loading">
              Loading budgets...
            </div>
          )}


          {/* EMPTY */}

          {!loading && budgets.length === 0 && (
            <div className="card empty-state">

              <div className="empty-icon">
                ₹
              </div>

              <h3>
                No budgets yet
              </h3>

              <p>
                Create your first budget
                to start tracking your
                spending.
              </p>

            </div>
          )}


          {/* BUDGET CARDS */}

          {!loading &&
            budgets.map((budget) => {

              const amount =
                Number(budget.amount || 0);

              const spent =
                Number(budget.spent || 0);

              const remaining =
                Number(budget.remaining || 0);

              const percentage =
                Number(budget.percentage || 0);

              const progressWidth =
                Math.min(percentage, 100);

              const status =
                getStatusData(budget.status);

              const startDate =
                budget.startDate
                  ? new Date(
                      budget.startDate
                    ).toLocaleDateString(
                      "en-IN"
                    )
                  : "";

              const endDate =
                budget.endDate
                  ? new Date(
                      budget.endDate
                    ).toLocaleDateString(
                      "en-IN"
                    )
                  : "";

              return (
                <div
                  className={`card budget-card status-${budget.status}`}
                  key={budget._id}
                >

                  {/* TOP */}

                  <div className="budget-card-top">

                    <div>

                      <span className="budget-label">
                        {budget.period?.toUpperCase() ||
                          "BUDGET"}
                      </span>

                      <h3>
                        {budget.category}
                      </h3>

                    </div>

                    <div className="budget-icon">
                      ₹
                    </div>

                  </div>


                  {/* BUDGET / SPENT */}

                  <div className="budget-money-row">

                    <div>

                      <span>
                        Budget
                      </span>

                      <strong>
                        {formatMoney(amount)}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Spent
                      </span>

                      <strong>
                        {formatMoney(spent)}
                      </strong>

                    </div>

                  </div>


                  {/* PROGRESS */}

                  <div className="budget-progress">

                    <div className="progress-info">

                      <span>
                        {percentage.toFixed(0)}
                        % used
                      </span>

                      <span>
                        {formatMoney(amount)}
                      </span>

                    </div>


                    <div className="progress-bar">

                      <div
                        className="progress-fill"
                        style={{
                          width: `${progressWidth}%`,
                        }}
                      />

                    </div>

                  </div>


                  {/* REMAINING */}

                  <div
                    className={`remaining-box ${
                      remaining < 0
                        ? "negative"
                        : ""
                    }`}
                  >

                    <div>

                      <span>
                        {remaining < 0
                          ? "Over budget"
                          : "Remaining"}
                      </span>

                      <strong>
                        {formatMoney(
                          Math.abs(remaining)
                        )}
                      </strong>

                    </div>


                    <div
                      className={`status-badge ${budget.status}`}
                    >

                      <span>
                        {status.icon}
                      </span>

                      {status.label}

                    </div>

                  </div>


                  {/* STATUS MESSAGE */}

                  <div className="budget-status-message">
                    {budget.statusMessage}
                  </div>


                  {/* DATE */}

                  <div className="budget-date">

                    <span>
                      PERIOD
                    </span>

                    <strong>
                      {startDate} → {endDate}
                    </strong>

                  </div>


                  {/* TRANSACTIONS */}

                  <div className="budget-transactions">

                    {budget.transactionCount} expense
                    {budget.transactionCount === 1
                      ? ""
                      : "s"} counted

                  </div>


                  {/* ACTIONS */}

                  <div className="budget-actions">

                    <button
                      type="button"
                      className="edit-button"
                      onClick={() =>
                        handleEdit(budget)
                      }
                    >
                      Edit
                    </button>


                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDelete(
                          budget._id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>
              );
            })}

        </div>

      </div>

    </div>
  );
}

export default Budgets;
