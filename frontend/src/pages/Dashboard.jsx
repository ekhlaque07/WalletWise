
import { useCallback, useEffect, useState } from "react";

import "./Dashboard.css";

import SummaryCard from "../components/SummaryCard";
import RecentTransactions from "../components/RecentTransactions";
import BudgetOverview from "../components/BudgetOverview";
import GoalOverview from "../components/GoalOverview";

import { getTransactions } from "../services/transactionService";
import { getBudgets } from "../services/budgetService";
import { getGoals } from "../services/goalService";

import { getSpendingPrediction } from "../services/mlService";
import AnomalyAlerts from "../components/AnomalyAlerts";

import { getCashFlowPrediction } from "../services/cashflowService";

const Dashboard = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Spending prediction
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(true);
  const [predictionError, setPredictionError] = useState("");

  // Cash-flow prediction
  const [cashflow, setCashflow] = useState(null);
  const [cashflowLoading, setCashflowLoading] = useState(true);
  const [cashflowError, setCashflowError] = useState("");

  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        transactionData,
        budgetData,
        goalData,
      ] = await Promise.all([
        getTransactions(),
        getBudgets(),
        getGoals(),
      ]);

      // Transactions
      setTransactions(
        transactionData?.transactions ||
          transactionData?.data ||
          transactionData ||
          [],
      );

      // Budgets
      setBudgets(
        budgetData?.budgets ||
          budgetData?.data ||
          budgetData ||
          [],
      );

      // Goals
      setGoals(
        goalData?.goals ||
          goalData?.data ||
          goalData ||
          [],
      );
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error,
      );

      setError(
        error.response?.data?.message ||
          "Unable to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // =========================================================
  // SPENDING PREDICTION
  // =========================================================

  useEffect(() => {
    const loadPrediction = async () => {
      try {
        setPredictionLoading(true);
        setPredictionError("");

        const data = await getSpendingPrediction();

        console.log(
          "Spending prediction response:",
          data,
        );

        setPrediction(data);
      } catch (error) {
        console.error(
          "Prediction error:",
          error,
        );

        console.error(
          "Prediction status:",
          error.response?.status,
        );

        console.error(
          "Prediction response:",
          error.response?.data,
        );

        setPredictionError(
          error.response?.data?.message ||
            "Unable to load spending prediction",
        );
      } finally {
        setPredictionLoading(false);
      }
    };

    loadPrediction();
  }, []);

  // =========================================================
  // CASH-FLOW PREDICTION
  // =========================================================

  useEffect(() => {
    const loadCashFlow = async () => {
      try {
        setCashflowLoading(true);
        setCashflowError("");

        const data =
          await getCashFlowPrediction();

        console.log(
          "Cash-flow prediction response:",
          data,
        );

        setCashflow(data);
      } catch (error) {
        console.error(
          "Cash-flow prediction failed:",
          error,
        );

        console.error(
          "Cash-flow status:",
          error.response?.status,
        );

        console.error(
          "Cash-flow response:",
          error.response?.data,
        );

        setCashflowError(
          error.response?.data?.message ||
            "Unable to load cash-flow forecast",
        );
      } finally {
        setCashflowLoading(false);
      }
    };

    loadCashFlow();
  }, []);

  // =========================================================
  // TOTAL INCOME
  // =========================================================

  const income = transactions
    .filter(
      (transaction) =>
        transaction.type === "income",
    )
    .reduce(
      (total, transaction) =>
        total +
        Number(transaction.amount || 0),
      0,
    );

  // =========================================================
  // TOTAL EXPENSES
  // =========================================================

  const expenses = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense",
    )
    .reduce(
      (total, transaction) =>
        total +
        Number(transaction.amount || 0),
      0,
    );

  // =========================================================
  // BALANCE
  // =========================================================

  const balance = income - expenses;

  // =========================================================
  // CASH-FLOW VALUES
  // =========================================================

  const predictedIncome = Number(
    cashflow?.prediction?.predicted_income || 0,
  );

  const predictedExpense = Number(
    cashflow?.prediction?.predicted_expense || 0,
  );

  const predictedCashflow = Number(
    cashflow?.prediction?.predicted_cashflow || 0,
  );

  // =========================================================
  // EXPENSE RATIO
  // =========================================================

  const expenseRatio =
    predictedIncome > 0
      ? Math.min(
          100,
          (predictedExpense /
            predictedIncome) *
            100,
        )
      : 0;

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="loading-screen">
        Loading WalletWise...
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="dashboard-content">

      {/* =====================================================
          DASHBOARD ERROR
      ===================================================== */}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="summary-grid">

        <SummaryCard
          title="Total Balance"
          value={balance}
          icon="💰"
          type="balance"
        />

        <SummaryCard
          title="Total Income"
          value={income}
          icon="📈"
          type="income-card"
        />

        <SummaryCard
          title="Total Expenses"
          value={expenses}
          icon="📉"
          type="expense-card"
        />

        <SummaryCard
          title="Total Transactions"
          value={transactions.length}
          icon="💳"
          type="transactions"
        />

      </div>

      {/* =====================================================
          ANOMALY ALERTS
      ===================================================== */}

      <AnomalyAlerts />

      {/* =====================================================
          RECENT TRANSACTIONS + BUDGET
      ===================================================== */}

      <div className="dashboard-grid">

        <RecentTransactions
          transactions={transactions}
        />

        <BudgetOverview
          budgets={budgets}
        />

      </div>

      {/* =====================================================
          GOALS
      ===================================================== */}

      <GoalOverview
        goals={goals}
      />

      {/* =====================================================
          AI SPENDING PREDICTION
      ===================================================== */}

      <div className="prediction-card">

        <div className="prediction-header">

          <div>
            <p className="prediction-label">
              AI Spending Prediction
            </p>

            <h2>
              Next Month
            </h2>
          </div>

          <div className="prediction-icon">
            🤖
          </div>

        </div>

        {/* Loading */}

        {predictionLoading && (
          <p className="prediction-loading">
            Analyzing your spending...
          </p>
        )}

        {/* Success */}

        {!predictionLoading &&
          prediction?.success && (
            <div className="prediction-value">
              ₹
              {Number(
                prediction.prediction || 0,
              ).toLocaleString("en-IN")}
            </div>
          )}

        {/* Error */}

        {!predictionLoading &&
          predictionError && (
            <p className="prediction-error">
              {predictionError}
            </p>
          )}

        {/* Description */}

        {!predictionLoading &&
          prediction?.success && (
            <p className="prediction-description">
              Based on your last{" "}
              {prediction.monthsUsed || 0}{" "}
              months of spending.
            </p>
          )}

      </div>

      {/* =====================================================
          CASH FLOW FORECAST
      ===================================================== */}

      <div className="dashboard-card cashflow-card">

        {/* Header */}

        <div className="card-header">

          <h3>
            Cash Flow Forecast
          </h3>

          <span>
            Next Month
          </span>

        </div>

        {/* ===================================================
            LOADING
        =================================================== */}

        {cashflowLoading && (
          <div className="cashflow-loading">
            Loading forecast...
          </div>
        )}

        {/* ===================================================
            ERROR
        =================================================== */}

        {!cashflowLoading &&
          cashflowError && (
            <div className="cashflow-error">

              <div className="cashflow-empty-icon">
                ⚠️
              </div>

              <p>
                {cashflowError}
              </p>

              <small>
                Add transactions from at least
                2 different months to generate
                a cash-flow forecast.
              </small>

            </div>
          )}

        {/* ===================================================
            SUCCESS
        =================================================== */}

        {!cashflowLoading &&
          !cashflowError &&
          cashflow?.success &&
          cashflow?.prediction && (
            <>

              {/* -----------------------------------------------
                  EXPECTED NET CASH FLOW
              ----------------------------------------------- */}

              <div className="cashflow-main">

                <div className="cashflow-main-label">
                  Expected Net Cash Flow
                </div>

                <h2
                  className={`cashflow-main-value ${
                    predictedCashflow < 0
                      ? "cashflow-negative"
                      : ""
                  }`}
                >
                  {predictedCashflow >= 0
                    ? "+₹"
                    : "-₹"}

                  {Math.abs(
                    predictedCashflow,
                  ).toLocaleString(
                    "en-IN",
                  )}
                </h2>

                <div className="cashflow-main-subtitle">
                  Estimated from your historical
                  transaction pattern
                </div>

              </div>

              {/* -----------------------------------------------
                  INCOME + EXPENSE
              ----------------------------------------------- */}

              <div className="cashflow-content">

                {/* Income */}

                <div className="cashflow-item">

                  <div className="cashflow-item-left">

                    <div className="cashflow-item-icon cashflow-income-icon">
                      ↑
                    </div>

                    <div className="cashflow-item-info">

                      <span>
                        Predicted Income
                      </span>

                      <small>
                        Next month
                      </small>

                    </div>

                  </div>

                  <strong className="cashflow-income-value">
                    ₹
                    {predictedIncome.toLocaleString(
                      "en-IN",
                    )}
                  </strong>

                </div>

                {/* Expenses */}

                <div className="cashflow-item">

                  <div className="cashflow-item-left">

                    <div className="cashflow-item-icon cashflow-expense-icon">
                      ↓
                    </div>

                    <div className="cashflow-item-info">

                      <span>
                        Predicted Expenses
                      </span>

                      <small>
                        Next month
                      </small>

                    </div>

                  </div>

                  <strong className="cashflow-expense-value">
                    ₹
                    {predictedExpense.toLocaleString(
                      "en-IN",
                    )}
                  </strong>

                </div>

              </div>

              {/* -----------------------------------------------
                  EXPENSE RATIO
              ----------------------------------------------- */}

              <div className="cashflow-bar-wrapper">

                <div className="cashflow-bar-header">

                  <span>
                    Expected expense ratio
                  </span>

                  <span>
                    {expenseRatio.toFixed(0)}%
                  </span>

                </div>

                <div className="cashflow-bar">

                  <div
                    className="cashflow-bar-fill"
                    style={{
                      width: `${expenseRatio}%`,
                    }}
                  />

                </div>

              </div>

              {/* -----------------------------------------------
                  FORECASTED BALANCE
              ----------------------------------------------- */}

              <div className="cashflow-total">

                <span>
                  Forecasted balance
                </span>

                <strong
                  className={
                    predictedCashflow >= 0
                      ? "cashflow-positive"
                      : "cashflow-negative"
                  }
                >

                  {predictedCashflow >= 0
                    ? "+₹"
                    : "-₹"}

                  {Math.abs(
                    predictedCashflow,
                  ).toLocaleString(
                    "en-IN",
                  )}

                </strong>

              </div>

              {/* -----------------------------------------------
                  HISTORICAL MONTHS
              ----------------------------------------------- */}

              {cashflow?.historicalData
                ?.months?.length > 0 && (
                <div className="cashflow-history-info">

                  Based on{" "}
                  {
                    cashflow.historicalData
                      .months.length
                  }{" "}
                  months of transaction data.

                </div>
              )}

            </>
          )}

        {/* ===================================================
            NO DATA
        =================================================== */}

        {!cashflowLoading &&
          !cashflowError &&
          (!cashflow?.success ||
            !cashflow?.prediction) && (
            <div className="cashflow-empty">

              <div className="cashflow-empty-icon">
                ₹
              </div>

              <p>
                Add transactions from at least
                2 different months to generate
                a forecast.
              </p>

            </div>
          )}

      </div>

    </div>
  );
};

export default Dashboard;

