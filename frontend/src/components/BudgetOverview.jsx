import { Link } from "react-router-dom";

const BudgetOverview = ({ budgets }) => {

    return (
        <div className="dashboard-section">

            <div className="section-header">

                <h3>Budget Overview</h3>

                <Link to="/budgets">
                    View All
                </Link>

            </div>

            {budgets.length === 0 ? (

                <div className="empty-state">
                    No budgets created yet.
                </div>

            ) : (

                <div className="budget-list">

                    {budgets.slice(0, 4).map((budget) => {

                        const limit = Number(
                            budget.limit ||
                            budget.amount ||
                            0
                        );

                        const spent = Number(
                            budget.spent || 0
                        );

                        const percentage =
                            limit > 0
                                ? Math.min(
                                      (spent / limit) * 100,
                                      100
                                  )
                                : 0;

                        return (
                            <div
                                className="budget-item"
                                key={budget._id}
                            >

                                <div className="budget-header">

                                    <span>
                                        {budget.category}
                                    </span>

                                    <span>
                                        ₹{spent} / ₹{limit}
                                    </span>

                                </div>

                                <div className="progress-bar">

                                    <div
                                        className="progress"
                                        style={{
                                            width: `${percentage}%`,
                                        }}
                                    />

                                </div>

                            </div>
                        );
                    })}

                </div>

            )}

        </div>
    );
};

export default BudgetOverview;