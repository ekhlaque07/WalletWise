import { Link } from "react-router-dom";

const GoalOverview = ({ goals }) => {

    return (
        <div className="dashboard-section">

            <div className="section-header">

                <h3>Financial Goals</h3>

                <Link to="/goals">
                    View All
                </Link>

            </div>

            {goals.length === 0 ? (

                <div className="empty-state">
                    No financial goals yet.
                </div>

            ) : (

                <div className="goal-list">

                    {goals.slice(0, 4).map((goal) => {

                        const target = Number(
                            goal.targetAmount ||
                            goal.target ||
                            0
                        );

                        const saved = Number(
                            goal.currentAmount ||
                            goal.savedAmount ||
                            0
                        );

                        const percentage =
                            target > 0
                                ? Math.min(
                                      (saved / target) * 100,
                                      100
                                  )
                                : 0;

                        return (
                            <div
                                className="goal-item"
                                key={goal._id}
                            >

                                <div className="goal-header">

                                    <span>
                                        {goal.name ||
                                            goal.title ||
                                            "Goal"}
                                    </span>

                                    <span>
                                        {Math.round(
                                            percentage
                                        )}%
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

                                <small>
                                    ₹{saved} / ₹{target}
                                </small>

                            </div>
                        );
                    })}

                </div>

            )}

        </div>
    );
};

export default GoalOverview;