from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from app.anomaly import detect_anomalies
from app.cashflow_model import predict_cashflow


from models.spending_model import predict_next_spending


app = FastAPI(
    title="WalletWise ML Service",
    description="Machine Learning service for WalletWise",
    version="1.0"
)


# ==========================================
# REQUEST MODEL
# ==========================================

class SpendingRequest(BaseModel):
    monthly_spending: List[float]

class AnomalyTransaction(BaseModel):
    _id: Optional[str] = None
    type: str
    amount: float
    category: str
    description: Optional[str] = ""


class AnomalyRequest(BaseModel):
    transactions: List[AnomalyTransaction]


class CashFlowRequest(BaseModel):
    incomes: list[float]
    expenses: list[float]


# ==========================================
# TRANSACTION CATEGORY REQUEST
# ==========================================

class CategoryRequest(BaseModel):
    description: str


# ==========================================
# AI TRANSACTION CATEGORIZATION
# ==========================================

def categorize_transaction(description: str):

    text = description.lower().strip()

    category_keywords = {

        "Food": [
            "food",
            "pizza",
            "burger",
            "restaurant",
            "zomato",
            "swiggy",
            "dominos",
            "mcdonald",
            "kfc",
            "cafe",
            "coffee",
            "lunch",
            "dinner",
            "breakfast",
            "snacks",
            "grocery",
            "groceries",
            "blinkit",
            "zepto",
            "instamart"
        ],

        "Transport": [
            "uber",
            "ola",
            "rapido",
            "cab",
            "taxi",
            "metro",
            "bus",
            "train",
            "fuel",
            "petrol",
            "diesel",
            "parking",
            "transport"
        ],

        "Shopping": [
            "amazon",
            "flipkart",
            "myntra",
            "ajio",
            "meesho",
            "shopping",
            "shoes",
            "shirt",
            "clothes",
            "dress",
            "watch",
            "mobile",
            "laptop",
            "headphones"
        ],

        "Bills": [
            "electricity",
            "water bill",
            "gas bill",
            "internet",
            "wifi",
            "broadband",
            "mobile recharge",
            "recharge",
            "bill",
            "rent",
            "maintenance"
        ],

        "Entertainment": [
            "movie",
            "cinema",
            "pvr",
            "inox",
            "netflix",
            "prime video",
            "spotify",
            "youtube premium",
            "concert",
            "game",
            "gaming"
        ],

        "Health": [
            "hospital",
            "doctor",
            "medicine",
            "medical",
            "pharmacy",
            "apollo",
            "clinic",
            "health",
            "test",
            "diagnostic"
        ],

        "Education": [
            "college",
            "school",
            "university",
            "course",
            "udemy",
            "coursera",
            "book",
            "books",
            "exam",
            "tuition",
            "fees",
            "education"
        ],

        "Travel": [
            "hotel",
            "flight",
            "airbnb",
            "trip",
            "travel",
            "booking",
            "makemytrip",
            "goibibo",
            "resort",
            "vacation"
        ]
    }

    # --------------------------------------
    # Match description against keywords
    # --------------------------------------

    for category, keywords in category_keywords.items():

        for keyword in keywords:

            if keyword in text:

                return {
                    "category": category,
                    "confidence": 0.90,
                    "method": "keyword_nlp"
                }

    # --------------------------------------
    # Unknown transaction
    # --------------------------------------

    return {
        "category": "Other",
        "confidence": 0.50,
        "method": "default"
    }


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():
    return {
        "message": "WalletWise ML Service is running"
    }


# ==========================================
# SPENDING PREDICTION
# ==========================================

@app.post("/predict")
def predict_spending(data: SpendingRequest):

    monthly_spending = data.monthly_spending

    # Need at least 2 months
    if len(monthly_spending) < 2:
        return {
            "success": False,
            "message": "At least 2 months of spending data are required"
        }

    prediction = predict_next_spending(
        monthly_spending
    )

    return {
        "success": True,
        "prediction": prediction,
        "months_used": len(monthly_spending)
    }


@app.post("/detect-anomalies")
def detect_anomalies_api(request: AnomalyRequest):

    transactions = [
        transaction.model_dump()
        for transaction in request.transactions
    ]

    anomalies = detect_anomalies(transactions)

    return {
        "success": True,
        "totalTransactions": len(transactions),
        "anomalyCount": len(anomalies),
        "anomalies": anomalies
    }


@app.post("/predict-cashflow")
def predict_cashflow_endpoint(data: CashFlowRequest):

    try:

        result = predict_cashflow(
            data.incomes,
            data.expenses
        )

        return {
            "success": True,
            "prediction": result
        }

    except ValueError as e:

        return {
            "success": False,
            "message": str(e)
        }

    except Exception as e:

        return {
            "success": False,
            "message": "Cash-flow prediction failed",
            "error": str(e)
        }


@app.post("/categorize")
def categorize(request: CategoryRequest):

    if not request.description.strip():

        return {
            "category": "Other",
            "confidence": 0.0,
            "method": "empty_description"
        }

    return categorize_transaction(request.description)