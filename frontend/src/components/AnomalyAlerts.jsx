import { useEffect, useState } from "react";
import {
    AlertTriangle,
    ShieldCheck
} from "lucide-react";

import { getAnomalies } from "../services/anomalyService";
import "../styles/AnomalyAlerts.css";

function AnomalyAlerts() {
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAnomalies = async () => {
            try {
                const data = await getAnomalies();
                setAnomalies(data.anomalies || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load anomaly alerts"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAnomalies();
    }, []);

    if (loading) {
        return <div>Analyzing transactions...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="anomaly-card">
            <h2>
                <AlertTriangle size={22} />
                Unusual Transactions
            </h2>

            {anomalies.length === 0 ? (
                <div className="no-anomalies">
                    <ShieldCheck size={40} />
                    <h3>No unusual transactions detected</h3>
                    <p>
                        No transactions were flagged
                        by the model.
                    </p>
                </div>
            ) : (
                <div className="anomaly-list">
                    {anomalies.map((item) => (
                        <div
                            className="anomaly-item"
                            key={item.transactionId}
                        >
                            <div>
                                <h3>{item.category}</h3>
                                <p>{item.description}</p>
                            </div>

                            <div className="anomaly-amount">
                                <strong>
                                    ₹{Number(
                                        item.amount
                                    ).toLocaleString("en-IN")}
                                </strong>
                                <span>Unusual</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AnomalyAlerts;