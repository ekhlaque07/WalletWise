import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

import { getAnalytics } from "../services/analyticsService";
import "./Analytics.css";

const COLORS = [
  "#00E5A8",
  "#00C6FF",
  "#0072FF",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#14B8A6",
];

const money = (value) =>
  `₹${(Number(value) || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const num = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const chartTooltipStyle = {
  backgroundColor: "#111a2d",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  color: "#fff",
};

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAnalytics();

      setAnalytics(result?.data ?? result ?? {});
    } catch (err) {
      console.error("Analytics request failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const normalized = useMemo(() => {
    const summary = analytics?.summary || {};

    const categories = Array.isArray(
      analytics?.categoryExpenses
    )
      ? analytics.categoryExpenses
      : [];

    const months = Array.isArray(
      analytics?.monthlyAnalytics
    )
      ? analytics.monthlyAnalytics
      : [];

    const daily = Array.isArray(
      analytics?.dailyExpenseAnalytics
    )
      ? analytics.dailyExpenseAnalytics
      : [];

    const budgets = Array.isArray(
      analytics?.budgetAnalytics
    )
      ? analytics.budgetAnalytics
      : [];

    const goals = Array.isArray(
      analytics?.goalAnalytics
    )
      ? analytics.goalAnalytics
      : [];

    return {
      totalIncome: num(summary.totalIncome),
      totalExpense: num(summary.totalExpense),
      balance: num(summary.balance),
      savingsRate: num(summary.savingsRate),
      averageExpense: num(summary.averageExpense),
      expenseToIncomeRatio: num(
        summary.expenseToIncomeRatio
      ),

      incomeTransactions: num(
        summary.incomeTransactions
      ),

      expenseTransactions: num(
        summary.expenseTransactions
      ),

      totalTransactions: num(
        summary.totalTransactions
      ),

      categories: categories.map((item) => ({
        category: item?.category || "Other",
        amount: num(item?.amount),
      })),

      months: months.map((item) => ({
        month: item?.month || "",
        income: num(item?.income),
        expense: num(item?.expense),
        savings: num(item?.savings),
      })),

      daily: daily.map((item) => ({
        date: item?.date || "",
        displayDate:
          item?.displayDate || item?.date || "",
        expense: num(item?.expense),
      })),

      budgets: budgets.map((item) => ({
        category: item?.category || "Other",
        budget: num(item?.budget),
        spent: num(item?.spent),
        remaining: num(item?.remaining),
        percentage: num(item?.percentage),
      })),

      goals: goals.map((item) => ({
        name: item?.name || "Goal",
        targetAmount: num(item?.targetAmount),
        savedAmount: num(item?.savedAmount),
        remaining: num(item?.remaining),
        percentage: num(item?.percentage),
      })),

      highestExpense: analytics?.highestExpense || null,

      largestIncome: analytics?.largestIncome || null,

      topSpendingCategory:
        analytics?.topSpendingCategory || null,

      insights: Array.isArray(analytics?.insights)
        ? analytics.insights
        : [],
    };
  }, [analytics]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          {error}
        </div>

        <button
          className="secondary-button analytics-retry"
          onClick={loadAnalytics}
        >
          Retry
        </button>
      </div>
    );
  }

  const highestExpense = normalized.highestExpense;
  const largestIncome = normalized.largestIncome;

  return (
    <div className="analytics-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="analytics-header">
        <div>
          <h1>Analytics</h1>

          <p>
            Understand your income, expenses, savings
            and spending patterns.
          </p>
        </div>

        <button
          className="analytics-refresh"
          onClick={loadAnalytics}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <div className="analytics-summary-grid">

        <div className="analytics-card">
          <span className="analytics-card-label">
            TOTAL INCOME
          </span>

          <h2 className="income-value">
            {money(normalized.totalIncome)}
          </h2>

          <span className="analytics-card-info">
            {normalized.incomeTransactions} income
            transactions
          </span>
        </div>

        <div className="analytics-card">
          <span className="analytics-card-label">
            TOTAL EXPENSE
          </span>

          <h2 className="expense-value">
            {money(normalized.totalExpense)}
          </h2>

          <span className="analytics-card-info">
            {normalized.expenseTransactions} expense
            transactions
          </span>
        </div>

        <div className="analytics-card">
          <span className="analytics-card-label">
            NET BALANCE
          </span>

          <h2
            className={
              normalized.balance >= 0
                ? "balance-value"
                : "negative-value"
            }
          >
            {money(normalized.balance)}
          </h2>

          <span className="analytics-card-info">
            Income − Expenses
          </span>
        </div>

        <div className="analytics-card">
          <span className="analytics-card-label">
            SAVINGS RATE
          </span>

          <h2 className="saving-value">
            {normalized.savingsRate.toFixed(1)}%
          </h2>

          <span className="analytics-card-info">
            Income retained as savings
          </span>
        </div>

      </div>

      {/* ======================================
          SECONDARY INSIGHTS
      ====================================== */}

      <div className="analytics-insights-grid">

        <div className="analytics-insight">
          <div>
            <span>Average Expense</span>
            <small>Per expense transaction</small>
          </div>

          <strong>
            {money(normalized.averageExpense)}
          </strong>
        </div>

        <div className="analytics-insight">
          <div>
            <span>Highest Expense</span>
            <small>
              {highestExpense?.category || "No data"}
            </small>
          </div>

          <strong>
            {money(highestExpense?.amount)}
          </strong>
        </div>

        <div className="analytics-insight">
          <div>
            <span>Largest Income</span>
            <small>
              {largestIncome?.category || "No data"}
            </small>
          </div>

          <strong className="income-text">
            {money(largestIncome?.amount)}
          </strong>
        </div>

        <div className="analytics-insight">
          <div>
            <span>Top Spending Category</span>
            <small>
              {normalized.topSpendingCategory?.category ||
                "No data"}
            </small>
          </div>

          <strong className="expense-text">
            {money(
              normalized.topSpendingCategory?.amount
            )}
          </strong>
        </div>

      </div>

      {/* ======================================
          MONTHLY INCOME VS EXPENSE
      ====================================== */}

      <div className="chart-card chart-wide">
        <div className="chart-header">
          <div>
            <h3>Income vs Expense</h3>

            <p>
              Compare your monthly income and spending.
            </p>
          </div>
        </div>

        <div className="chart-container large-chart">

          {normalized.months.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={normalized.months}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.1}
                />

                <XAxis
                  dataKey="month"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />

                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />

                <Tooltip
                  formatter={(value) => money(value)}
                  contentStyle={chartTooltipStyle}
                />

                <Legend />

                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#00E5A8"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#FF5C7A"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              Add income and expense transactions
              to see your monthly comparison.
            </div>
          )}

        </div>
      </div>

      {/* ======================================
          CATEGORY CHARTS
      ====================================== */}

      <div className="analytics-chart-grid">

        {/* PIE */}

        <div className="chart-card">

          <div className="chart-header">
            <div>
              <h3>Expense Distribution</h3>

              <p>
                Percentage of total spending by category.
              </p>
            </div>
          </div>

          <div className="chart-container">

            {normalized.categories.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={normalized.categories}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="45%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={3}
                  >
                    {normalized.categories.map(
                      (entry, index) => (
                        <Cell
                          key={`${entry.category}-${index}`}
                          fill={
                            COLORS[
                              index % COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    formatter={(value) => money(value)}
                    contentStyle={chartTooltipStyle}
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                No expense data available.
              </div>
            )}

          </div>
        </div>

        {/* BAR */}

        <div className="chart-card">

          <div className="chart-header">
            <div>
              <h3>Category Spending</h3>

              <p>
                Compare how much you spend in each
                category.
              </p>
            </div>
          </div>

          <div className="chart-container">

            {normalized.categories.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={normalized.categories}
                  layout="vertical"
                  margin={{
                    left: 10,
                    right: 20,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={0.1}
                  />

                  <XAxis
                    type="number"
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    type="category"
                    dataKey="category"
                    width={85}
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 10,
                    }}
                  />

                  <Tooltip
                    formatter={(value) => money(value)}
                    contentStyle={chartTooltipStyle}
                  />

                  <Bar
                    dataKey="amount"
                    name="Expense"
                    radius={[0, 7, 7, 0]}
                  >
                    {normalized.categories.map(
                      (entry, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={
                            COLORS[
                              index % COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                No category data available.
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ======================================
          MONTHLY SAVINGS
      ====================================== */}

      <div className="chart-card chart-wide">

        <div className="chart-header">
          <div>
            <h3>Monthly Savings Trend</h3>

            <p>
              See how much money you retained each month.
            </p>
          </div>
        </div>

        <div className="chart-container">

          {normalized.months.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart data={normalized.months}>

                <defs>
                  <linearGradient
                    id="savingsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#00E5A8"
                      stopOpacity={0.35}
                    />

                    <stop
                      offset="95%"
                      stopColor="#00E5A8"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.1}
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  formatter={(value) => money(value)}
                  contentStyle={chartTooltipStyle}
                />

                <Area
                  type="monotone"
                  dataKey="savings"
                  name="Savings"
                  stroke="#00E5A8"
                  fill="url(#savingsGradient)"
                  strokeWidth={3}
                />

              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              Add transactions to see your savings trend.
            </div>
          )}

        </div>
      </div>

      {/* ======================================
          DAILY EXPENSE TREND
      ====================================== */}

      <div className="chart-card chart-wide">

        <div className="chart-header">
          <div>
            <h3>Daily Expense Trend</h3>

            <p>
              Track how your spending changes day by day.
            </p>
          </div>
        </div>

        <div className="chart-container">

          {normalized.daily.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={normalized.daily}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.1}
                />

                <XAxis
                  dataKey="displayDate"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 10,
                  }}
                />

                <YAxis
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 10,
                  }}
                />

                <Tooltip
                  formatter={(value) => money(value)}
                  contentStyle={chartTooltipStyle}
                />

                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Daily Expense"
                  stroke="#FF5C7A"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />

              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              Add expense transactions to see your daily
              spending trend.
            </div>
          )}

        </div>
      </div>

      {/* ======================================
          BUDGET UTILIZATION
      ====================================== */}

      <div className="chart-card chart-wide">

        <div className="chart-header">
          <div>
            <h3>Budget Utilization</h3>

            <p>
              Compare your budget limits with actual
              spending.
            </p>
          </div>
        </div>

        <div className="chart-container">

          {normalized.budgets.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={normalized.budgets}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.1}
                />

                <XAxis
                  dataKey="category"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 10,
                  }}
                />

                <YAxis
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 10,
                  }}
                />

                <Tooltip
                  formatter={(value) => money(value)}
                  contentStyle={chartTooltipStyle}
                />

                <Legend />

                <Bar
                  dataKey="budget"
                  name="Budget"
                  fill="#0072FF"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="spent"
                  name="Spent"
                  fill="#FF5C7A"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              Create budgets to see budget utilization.
            </div>
          )}

        </div>
      </div>

      {/* ======================================
          FINANCIAL HEALTH
      ====================================== */}

      <div className="analytics-health-grid">

        <div className="health-card">

          <div className="health-title">
            <span>Expense / Income Ratio</span>

            <strong>
              {normalized.expenseToIncomeRatio.toFixed(
                1
              )}
              %
            </strong>
          </div>

          <div className="health-progress">
            <div
              className="health-progress-fill"
              style={{
                width: `${Math.min(
                  normalized.expenseToIncomeRatio,
                  100
                )}%`,
              }}
            />
          </div>

          <p>
            This shows how much of your income is being
            consumed by expenses.
          </p>

        </div>

        <div className="health-card">

          <div className="health-title">
            <span>Total Transactions</span>

            <strong>
              {normalized.totalTransactions}
            </strong>
          </div>

          <p>
            {normalized.incomeTransactions} income
            transactions and{" "}
            {normalized.expenseTransactions} expense
            transactions recorded.
          </p>

        </div>

      </div>

      {/* ======================================
          AI-READY INSIGHTS
      ====================================== */}

      {normalized.insights.length > 0 && (
        <div className="analytics-insights-section">

          <div className="chart-header">
            <div>
              <h3>Financial Insights</h3>

              <p>
                Important observations from your
                transaction data.
              </p>
            </div>
          </div>

          <div className="insight-list">

            {normalized.insights.map(
              (insight, index) => (
                <div
                  className="insight-item"
                  key={index}
                >
                  <span className="insight-icon">
                    ✦
                  </span>

                  <p>{insight}</p>
                </div>
              )
            )}

          </div>

        </div>
      )}

      {/* ======================================
          GOALS
      ====================================== */}

      {normalized.goals.length > 0 && (
        <div className="goals-analytics-section">

          <div className="chart-header">
            <div>
              <h3>Goal Progress</h3>

              <p>
                Track your financial goals.
              </p>
            </div>
          </div>

          <div className="goal-analytics-grid">

            {normalized.goals.map((goal) => (
              <div
                className="goal-analytics-card"
                key={goal.name}
              >
                <div className="goal-top">

                  <strong>{goal.name}</strong>

                  <span>
                    {goal.percentage.toFixed(0)}%
                  </span>

                </div>

                <div className="goal-progress">
                  <div
                    style={{
                      width: `${Math.min(
                        goal.percentage,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="goal-money">

                  <span>
                    Saved {money(goal.savedAmount)}
                  </span>

                  <span>
                    Target {money(goal.targetAmount)}
                  </span>

                </div>
              </div>
            ))}

          </div>
        </div>
      )}

    </div>
  );
}

export default Analytics;