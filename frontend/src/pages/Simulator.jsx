import { useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import {
  Calculator,
  TrendingUp,
  Wallet,
  IndianRupee,
  RotateCcw,
} from "lucide-react";

import { simulateScenario } from "../services/simulatorService";
import "./Simulator.css";

const initialForm = {
  monthlyIncome: "30000",
  monthlyExpenses: "20000",
  expenseReduction: 20,
  additionalIncome: "0",
  additionalExpense: "0",
  duration: 6,
};

function Simulator() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSimulation = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = {
        monthlyIncome: Number(form.monthlyIncome),
        monthlyExpenses: Number(form.monthlyExpenses),
        expenseReduction: Number(form.expenseReduction),
        additionalIncome: Number(form.additionalIncome),
        additionalExpense: Number(form.additionalExpense),
        duration: Number(form.duration),
      };

      const response = await simulateScenario(data);

      setResult(response);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to run the simulation."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setResult(null);
    setError("");
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const chartData = result
    ? [
        {
          name: "Monthly Savings",
          Current: result.current.monthlySavings,
          Simulated: result.simulated.monthlySavings,
        },
        {
          name: `${result.scenario.duration}-Month Savings`,
          Current: result.current.projectedSavings,
          Simulated: result.simulated.projectedSavings,
        },
      ]
    : [];

  return (
    <div className="simulator-page">
      <div className="simulator-header">
        <div>
          <span className="simulator-eyebrow">
            FINANCIAL PLANNING
          </span>

          <h1>What-If Simulator</h1>

          <p>
            Explore hypothetical financial decisions
            before making them.
          </p>
        </div>

        <div className="simulator-header-icon">
          <Calculator size={28} />
        </div>
      </div>

      <div className="simulator-layout">
        <form
          className="simulator-form"
          onSubmit={handleSimulation}
        >
          <div className="simulator-section-heading">
            <h2>Your Financial Situation</h2>
            <span>01</span>
          </div>

          <div className="simulator-field">
            <label>Monthly Income (₹)</label>

            <input
              type="number"
              name="monthlyIncome"
              min="0"
              step="0.01"
              value={form.monthlyIncome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="simulator-field">
            <label>Monthly Expenses (₹)</label>

            <input
              type="number"
              name="monthlyExpenses"
              min="0"
              step="0.01"
              value={form.monthlyExpenses}
              onChange={handleChange}
              required
            />
          </div>

          <div className="simulator-divider" />

          <div className="simulator-section-heading">
            <h2>What Would You Change?</h2>
            <span>02</span>
          </div>

          <div className="simulator-field">
            <div className="slider-label">
              <label>Reduce Expenses</label>
              <strong>{form.expenseReduction}%</strong>
            </div>

            <input
              type="range"
              name="expenseReduction"
              min="0"
              max="100"
              step="5"
              value={form.expenseReduction}
              onChange={handleChange}
              className="simulator-slider"
            />

            <div className="slider-range">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="simulator-field">
            <label>Additional Monthly Income (₹)</label>

            <input
              type="number"
              name="additionalIncome"
              min="0"
              step="0.01"
              value={form.additionalIncome}
              onChange={handleChange}
            />
          </div>

          <div className="simulator-field">
            <label>Additional Monthly Expenses (₹)</label>

            <input
              type="number"
              name="additionalExpense"
              min="0"
              step="0.01"
              value={form.additionalExpense}
              onChange={handleChange}
            />
          </div>

          <div className="simulator-field">
            <label>Projection Duration</label>

            <select
              name="duration"
              value={form.duration}
              onChange={handleChange}
            >
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
              <option value="24">24 Months</option>
              <option value="36">36 Months</option>
            </select>
          </div>

          <div className="simulator-actions">
            <button
              type="submit"
              className="simulate-button"
              disabled={loading}
            >
              {loading ? (
                "Simulating..."
              ) : (
                <>
                  <Calculator size={18} />
                  Run Simulation
                </>
              )}
            </button>

            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>

          {error && (
            <div className="simulator-error">
              {error}
            </div>
          )}
        </form>

        <div className="simulator-results">
          {!result ? (
            <div className="simulator-empty">
              <div className="empty-icon">
                <TrendingUp size={34} />
              </div>

              <h2>Your Simulation Results</h2>

              <p>
                Adjust your financial situation and
                run a simulation to see its impact.
              </p>
            </div>
          ) : (
            <>
              <div className="simulator-section-heading">
                <h2>Simulation Results</h2>
                <span>03</span>
              </div>

              <div className="result-cards">
                <div className="result-card">
                  <div className="result-card-top">
                    <span>Current Savings</span>
                    <Wallet size={19} />
                  </div>

                  <h3>
                    {formatCurrency(
                      result.current.monthlySavings
                    )}
                  </h3>

                  <small>Per month</small>
                </div>

                <div className="result-card highlighted">
                  <div className="result-card-top">
                    <span>Simulated Savings</span>
                    <IndianRupee size={19} />
                  </div>

                  <h3>
                    {formatCurrency(
                      result.simulated.monthlySavings
                    )}
                  </h3>

                  <small>Per month</small>
                </div>
              </div>

              <div className="impact-card">
                <div className="impact-icon">
                  <TrendingUp size={22} />
                </div>

                <div>
                  <span>
                    Additional savings over{" "}
                    {result.scenario.duration} months
                  </span>

                  <h2>
                    {formatCurrency(
                      result.impact.totalSavingsDifference
                    )}
                  </h2>
                </div>
              </div>

              <div className="simulator-chart-card">
                <h2>Savings Comparison</h2>

                <p>
                  Current financial situation vs.
                  hypothetical scenario
                </p>

                <div className="simulator-chart">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 15,
                        right: 10,
                        left: 10,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#293247"
                      />

                      <XAxis
                        dataKey="name"
                        stroke="#a1a1aa"
                        tick={{ fontSize: 11 }}
                      />

                      <YAxis
                        stroke="#a1a1aa"
                        tick={{ fontSize: 11 }}
                      />

                      <Tooltip
                        formatter={(value) =>
                          formatCurrency(value)
                        }
                        contentStyle={{
                          background: "#151c2e",
                          border: "1px solid #293247",
                          borderRadius: "10px",
                          color: "#fff",
                        }}
                      />

                      <Legend />

                      <Bar
                        dataKey="Current"
                        fill="#64748b"
                        radius={[5, 5, 0, 0]}
                      />

                      <Bar
                        dataKey="Simulated"
                        fill="#00d4a0"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="simulator-breakdown">
                <h2>Financial Breakdown</h2>

                <div className="breakdown-row">
                  <span>Current monthly income</span>
                  <strong>
                    {formatCurrency(
                      result.current.monthlyIncome
                    )}
                  </strong>
                </div>

                <div className="breakdown-row">
                  <span>Simulated monthly income</span>
                  <strong>
                    {formatCurrency(
                      result.simulated.monthlyIncome
                    )}
                  </strong>
                </div>

                <div className="breakdown-row">
                  <span>Current monthly expenses</span>
                  <strong>
                    {formatCurrency(
                      result.current.monthlyExpenses
                    )}
                  </strong>
                </div>

                <div className="breakdown-row">
                  <span>Simulated monthly expenses</span>
                  <strong>
                    {formatCurrency(
                      result.simulated.monthlyExpenses
                    )}
                  </strong>
                </div>
              </div>

              <div className="simulator-disclaimer">
                These are hypothetical projections based
                on constant monthly income and expenses.
                Actual savings may differ.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Simulator;