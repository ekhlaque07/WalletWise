import os
import joblib
import numpy as np


MODEL_PATH = os.path.join(
    os.path.dirname(
        os.path.dirname(__file__)
    ),
    "models",
    "spending_model.pkl"
)


class SpendingModel:

    def __init__(self):

        self.model = None

        self.load_model()


    def load_model(self):

        if os.path.exists(MODEL_PATH):

            self.model = joblib.load(
                MODEL_PATH
            )


    def predict(self, previous_month, two_months_ago):

        if self.model is None:

            raise ValueError(
                "ML model is not available."
            )

        features = np.array([
            [
                previous_month,
                two_months_ago
            ]
        ])

        prediction = self.model.predict(
            features
        )

        return float(prediction[0])


spending_model = SpendingModel()