
import numpy as np
from sklearn.linear_model import LinearRegression


def predict_cashflow(incomes, expenses):
    """
    Predict next-period income, expense and net cash flow
    using historical monthly data.

    Uses Linear Regression for trend detection and
    historical averages to make the forecast more stable.
    """

    # ---------------------------------------------------------
    # VALIDATION
    # ---------------------------------------------------------

    if len(incomes) < 2 or len(expenses) < 2:
        raise ValueError(
            "At least 2 months of data are required"
        )

    if len(incomes) != len(expenses):
        raise ValueError(
            "Income and expense data must have same length"
        )

    # Convert values to float
    incomes = np.array(incomes, dtype=float)
    expenses = np.array(expenses, dtype=float)

    # Prevent negative historical values
    incomes = np.maximum(incomes, 0)
    expenses = np.maximum(expenses, 0)

    # ---------------------------------------------------------
    # MONTH NUMBERS
    # ---------------------------------------------------------

    X = np.arange(
        1,
        len(incomes) + 1
    ).reshape(-1, 1)

    next_month = np.array([
        [len(incomes) + 1]
    ])

    # ---------------------------------------------------------
    # LINEAR REGRESSION MODELS
    # ---------------------------------------------------------

    income_model = LinearRegression()
    expense_model = LinearRegression()

    income_model.fit(X, incomes)
    expense_model.fit(X, expenses)

    # ---------------------------------------------------------
    # TREND PREDICTIONS
    # ---------------------------------------------------------

    trend_income = float(
        income_model.predict(next_month)[0]
    )

    trend_expense = float(
        expense_model.predict(next_month)[0]
    )

    # ---------------------------------------------------------
    # RECENT AVERAGE
    # ---------------------------------------------------------

    # Use the last 3 months when available.
    # With only 2 months, use both months.

    recent_count = min(3, len(incomes))

    recent_income_avg = float(
        np.mean(incomes[-recent_count:])
    )

    recent_expense_avg = float(
        np.mean(expenses[-recent_count:])
    )

    # ---------------------------------------------------------
    # STABLE FORECAST
    # ---------------------------------------------------------

    # Blend the regression trend with the recent average.

    predicted_income = (
        0.7 * trend_income
        + 0.3 * recent_income_avg
    )

    predicted_expense = (
        0.7 * trend_expense
        + 0.3 * recent_expense_avg
    )

    # ---------------------------------------------------------
    # SAFETY LIMITS
    # ---------------------------------------------------------

    # Income cannot be negative.
    predicted_income = max(
        0,
        predicted_income
    )

    # Expense cannot be negative.
    predicted_expense = max(
        0,
        predicted_expense
    )

    # Prevent an extreme regression drop.
    #
    # The predicted expense should not be lower than
    # 50% of the recent average.

    minimum_expense = (
        recent_expense_avg * 0.50
    )

    predicted_expense = max(
        predicted_expense,
        minimum_expense
    )

    # ---------------------------------------------------------
    # CASH FLOW
    # ---------------------------------------------------------

    predicted_cashflow = (
        predicted_income
        - predicted_expense
    )

    # ---------------------------------------------------------
    # RESULT
    # ---------------------------------------------------------

    return {
        "predicted_income": round(
            float(predicted_income),
            2
        ),

        "predicted_expense": round(
            float(predicted_expense),
            2
        ),

        "predicted_cashflow": round(
            float(predicted_cashflow),
            2
        )
    }

