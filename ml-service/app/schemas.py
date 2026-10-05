from pydantic import BaseModel, Field
from typing import List


class TransactionData(BaseModel):
    amount: float = Field(gt=0)
    type: str
    category: str


class SpendingPredictionRequest(BaseModel):
    transactions: List[TransactionData]

    previous_month_spending: float = Field(
        ge=0
    )

    two_months_ago_spending: float = Field(
        ge=0
    )


class SpendingPredictionResponse(BaseModel):
    current_month_spending: float
    predicted_next_month_spending: float
    risk_score: float
    risk_level: str