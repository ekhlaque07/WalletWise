import { Link } from "react-router-dom";

const RecentTransactions = ({ transactions }) => {

    return (
        <div className="dashboard-section">

            <div className="section-header">

                <h3>Recent Transactions</h3>

                <Link to="/transactions">
                    View All
                </Link>

            </div>

            {transactions.length === 0 ? (

                <div className="empty-state">
                    No transactions yet.
                </div>

            ) : (

                <div className="transaction-list">

                    {transactions
                        .slice(0, 5)
                        .map((transaction) => (

                            <div
                                className="transaction-item"
                                key={transaction._id}
                            >

                                <div>

                                    <strong>
                                        {transaction.title ||
                                            transaction.description ||
                                            "Transaction"}
                                    </strong>

                                    <span>
                                        {transaction.category ||
                                            "Other"}
                                    </span>

                                </div>

                                <strong
                                    className={
                                        transaction.type === "income"
                                            ? "income"
                                            : "expense"
                                    }
                                >
                                    {transaction.type === "income"
                                        ? "+"
                                        : "-"}
                                    ₹
                                    {Number(
                                        transaction.amount || 0
                                    ).toLocaleString("en-IN")}
                                </strong>

                            </div>

                        ))}

                </div>

            )}

        </div>
    );
};

export default RecentTransactions;