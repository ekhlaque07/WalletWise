
import numpy as np
from sklearn.linear_model import LinearRegression


def predict_next_spending(monthly_spending):
    """
    Predict next month's spending using historical
    monthly spending data.

    Uses Linear Regression for trend detection and
    recent historical spending to keep the prediction
    realistic, especially when only a few months of
    data are available.
    """

    if len(monthly_spending) < 2:
        return None

    # Convert to numeric numpy array
    spending = np.array(
        monthly_spending,
        dtype=float
    )

    # Spending cannot be negative
    spending = np.maximum(spending, 0)

    # Month numbers
    X = np.arange(
        1,
        len(spending) + 1
    ).reshape(-1, 1)

    # Train Linear Regression model
    model = LinearRegression()
    model.fit(X, spending)

    # Next month
    next_month = np.array([
        [len(spending) + 1]
    ])

    # Trend-based prediction
    trend_prediction = float(
        model.predict(next_month)[0]
    )

    # Use recent months to stabilize the prediction
    recent_count = min(3, len(spending))

    recent_average = float(
        np.mean(spending[-recent_count:])
    )

    # Blend trend with recent spending
    prediction = (
        0.5 * trend_prediction
        + 0.5 * recent_average
    )

    # Never allow negative spending
    prediction = max(0, prediction)

    return round(
        float(prediction),
        2
    )

