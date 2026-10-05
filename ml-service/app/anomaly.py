import pandas as pd
import numpy as np

from sklearn.ensemble import IsolationForest


def detect_anomalies(transactions):

    if not transactions:
        return []

    # ==========================================
    # Convert transactions to DataFrame
    # ==========================================

    df = pd.DataFrame(transactions)

    # Keep only expenses
    df = df[df["type"] == "expense"].copy()

    if df.empty:
        return []

    # ==========================================
    # Clean amount
    # ==========================================

    df["amount"] = pd.to_numeric(
        df["amount"],
        errors="coerce"
    )

    df = df.dropna(subset=["amount"])

    df = df[df["amount"] > 0]

    if df.empty:
        return []

    # ==========================================
    # Not enough historical data
    # ==========================================

    if len(df) < 5:
        return []

    # ==========================================
    # Amount-based anomaly detection
    # ==========================================

    amounts = df["amount"].values

    median = np.median(amounts)

    # Median Absolute Deviation
    absolute_deviation = np.abs(amounts - median)

    mad = np.median(absolute_deviation)

    # Avoid division by zero
    if mad == 0:
        mad = 1

    # Robust Z-score
    df["robust_z"] = (
        0.6745 * (df["amount"] - median) / mad
    )

    # ==========================================
    # Isolation Forest
    # ==========================================

    df["log_amount"] = np.log1p(df["amount"])

    model = IsolationForest(
        n_estimators=200,
        contamination="auto",
        random_state=42
    )

    isolation_features = df[
        ["log_amount"]
    ].values

    predictions = model.fit_predict(
        isolation_features
    )

    isolation_scores = model.decision_function(
        isolation_features
    )

    df["isolation_prediction"] = predictions
    df["isolation_score"] = isolation_scores

    # ==========================================
    # Final anomaly decision
    # ==========================================

    # Strong statistical anomaly
    df["statistical_anomaly"] = (
        np.abs(df["robust_z"]) >= 3.5
    )

    # Extremely large transaction compared
    # with the user's median spending
    df["amount_anomaly"] = (
        df["amount"] >= median * 5
    )

    # Combine the signals
    df["is_anomaly"] = (
        df["statistical_anomaly"]
        | df["amount_anomaly"]
    )

    # ==========================================
    # Extract anomalies
    # ==========================================

    anomalies = df[
        df["is_anomaly"]
    ]

    results = []

    for _, row in anomalies.iterrows():

        results.append({

            "transactionId": str(
                row.get("_id", "")
            ),

            "amount": float(
                row["amount"]
            ),

            "category": str(
                row.get("category", "Other")
            ),

            "description": str(
                row.get("description", "")
            ),

            "anomalyScore": float(
                abs(row["robust_z"])
            ),

            "status": "unusual"

        })

    return results