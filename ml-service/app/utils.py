import numpy as np


def calculate_total_expense(transactions):
    total = 0

    for transaction in transactions:

        if transaction["type"].lower() == "expense":
            total += float(transaction["amount"])

    return total


def calculate_total_income(transactions):
    total = 0

    for transaction in transactions:

        if transaction["type"].lower() == "income":
            total += float(transaction["amount"])

    return total


def calculate_risk_score(income, expense):

    if income <= 0:
        return 100.0

    expense_ratio = expense / income

    if expense_ratio >= 1:
        score = 100

    elif expense_ratio >= 0.8:
        score = 80

    elif expense_ratio >= 0.6:
        score = 60

    elif expense_ratio >= 0.4:
        score = 30

    else:
        score = 10

    return float(score)


def get_risk_level(score):

    if score >= 80:
        return "High"

    elif score >= 50:
        return "Medium"

    return "Low"


def create_prediction_features(monthly_spending):

    values = np.array(monthly_spending, dtype=float)

    features = []

    for i in range(2, len(values)):

        previous_month = values[i - 1]
        two_months_ago = values[i - 2]

        features.append([
            previous_month,
            two_months_ago
        ])

    return np.array(features)


def create_prediction_target(monthly_spending):

    values = np.array(monthly_spending, dtype=float)

    return values[2:]