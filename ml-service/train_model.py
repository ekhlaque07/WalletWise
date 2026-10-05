import os
import joblib
import numpy as np

from sklearn.ensemble import RandomForestRegressor


# Historical monthly spending data

monthly_spending = np.array([
    18000,
    19000,
    19500,
    21000,
    22000,
    21500,
    23000,
    24000,
    23500,
    25000,
    26000,
    27000,
    28000,
    27500,
    29000,
    30000,
    31000,
    32000,
    31500,
    33000
])


X = []
y = []


for i in range(2, len(monthly_spending)):

    previous_month = monthly_spending[i - 1]

    two_months_ago = monthly_spending[i - 2]

    X.append([
        previous_month,
        two_months_ago
    ])

    y.append(
        monthly_spending[i]
    )


X = np.array(X)
y = np.array(y)


model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)


model.fit(X, y)


os.makedirs("models", exist_ok=True)


joblib.dump(
    model,
    "models/spending_model.pkl"
)


print("Model trained successfully.")

print(
    "Model saved to models/spending_model.pkl"
)