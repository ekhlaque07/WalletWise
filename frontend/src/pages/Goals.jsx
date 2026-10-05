import { useCallback, useEffect, useState } from "react";

import {
  createGoal,
  deleteGoal,
  getGoals,
  updateGoal,
} from "../services/goalService";

import "./Goals.css";

const initialForm = {
  name: "",
  targetAmount: "",
  currentAmount: "",
  deadline: "",
};

function Goals() {
  const [goals, setGoals] = useState([]);

  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getGoals();

      setGoals(Array.isArray(data) ? data : data.goals || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

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

      const targetAmount = Number(form.targetAmount);
      const currentAmount = Number(form.currentAmount || 0);

      // Frontend validation
      if (!form.name.trim()) {
        throw new Error("Goal name is required.");
      }

      if (!targetAmount || targetAmount <= 0) {
        throw new Error("Target amount must be greater than 0.");
      }

      if (currentAmount < 0) {
        throw new Error("Current amount cannot be negative.");
      }

      if (currentAmount > targetAmount) {
        throw new Error("Current amount cannot exceed target amount.");
      }

      const goalData = {
        name: form.name.trim(),
        targetAmount,
        currentAmount,
        deadline: form.deadline || undefined,
      };

      console.log("Sending goal data:", goalData);

      if (editingId) {
        await updateGoal(editingId, goalData);
      } else {
        await createGoal(goalData);
      }

      setForm(initialForm);
      setEditingId(null);

      await loadGoals();
    } catch (err) {
      console.error("Goal creation error:", err.response?.data || err);

      setError(
        err.response?.data?.message || err.message || "Failed to save goal.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingId(goal._id);

    setForm({
      name: goal.name || "",
      targetAmount: goal.targetAmount || "",
      currentAmount: goal.currentAmount || "",
      deadline: goal.deadline
        ? new Date(goal.deadline).toISOString().split("T")[0]
        : "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this goal?")) {
      return;
    }

    try {
      await deleteGoal(id);

      await loadGoals();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  return (
    <div className="page-container goals-page">
      <div className="page-header">
        <h1 className="page-title">Financial Goals</h1>

        <p className="page-subtitle">
          Set targets and track your financial progress.
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="goals-layout">
        <div className="card goal-form-card">
          <h2>{editingId ? "Edit Goal" : "Create Goal"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Goal Name</label>

              <input
                className="form-control"
                type="text"
                name="name"
                placeholder="Buy a Laptop"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Target Amount</label>

              <input
                className="form-control"
                type="number"
                name="targetAmount"
                placeholder="80000"
                value={form.targetAmount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Current Amount</label>

              <input
                className="form-control"
                type="number"
                name="currentAmount"
                placeholder="10000"
                value={form.currentAmount}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Deadline</label>

              <input
                className="form-control"
                type="date"
                name="deadline"
                value={form.deadline}
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
                    ? "Update Goal"
                    : "Create Goal"}
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

        <div className="goals-grid">
          {loading ? (
            <div className="card loading">Loading goals...</div>
          ) : goals.length === 0 ? (
            <div className="card empty-state">No goals created yet.</div>
          ) : (
            goals.map((goal) => {
              const target = Number(goal.targetAmount) || 0;

              const current = Number(goal.currentAmount) || 0;

              const percentage =
                target > 0 ? Math.min((current / target) * 100, 100) : 0;

              return (
                <div className="card goal-card" key={goal._id}>
                  <div className="goal-header">
                    <div>
                      <h3>{goal.name}</h3>

                      <span>
                        Target: ₹{Number(target || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="goal-percentage">
                      {Math.round(percentage)}%
                    </div>
                  </div>

                  <div className="goal-progress">
                    <div className="goal-progress-bar">
                      <div
                        className="goal-progress-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="goal-values">
                    <div>
                      <span>Saved</span>

                      <strong>₹{Number(current || 0).toLocaleString()}</strong>
                    </div>

                    <div>
                      <span>Remaining</span>

                      <strong>
                        ₹{Math.max(target - current, 0).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div className="goal-deadline">
                    Deadline:{" "}
                    {goal.deadline
                      ? new Date(goal.deadline).toLocaleDateString()
                      : "-"}
                  </div>

                  <div className="goal-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(goal)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(goal._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Goals;
