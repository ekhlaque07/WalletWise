import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { askAIAdvisor } from "../services/aiService";
import ReactMarkdown from "react-markdown";

import "./AIAdvisor.css";

const suggestions = [
    "How am I spending my money this month?",
    "Where can I reduce my expenses?",
    "How much am I saving?",
    "Give me a summary of my finances.",
];

function AIAdvisor() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAsk = async (e) => {
        e.preventDefault();

        if (!question.trim()) {
            return;
        }

        try {
            setLoading(true);
            setError("");
            setAnswer("");

            const data = await askAIAdvisor(question);

            setAnswer(data.answer);
        } catch (err) {
            setError(
                err.message || "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestion = (text) => {
        setQuestion(text);
    };

    return (
        <div className="ai-advisor-page">

            <div className="ai-advisor-header">
                <div>
                    <h1>
                        <Bot size={30} />
                        AI Financial Advisor
                    </h1>

                    <p>
                        Ask WalletWise about your spending,
                        budgets and financial goals.
                    </p>
                </div>

                <div className="ai-badge">
                    <Sparkles size={16} />
                    GenAI Powered
                </div>
            </div>

            <div className="ai-advisor-container">

                <div className="ai-welcome-card">
                    <div className="ai-icon">
                        <Bot size={32} />
                    </div>

                    <h2>
                        How can I help you?
                    </h2>

                    <p>
                        I can analyze your WalletWise financial
                        data and help you understand your spending,
                        savings and budgets.
                    </p>
                </div>

                <div className="suggestion-container">

                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion}
                            className="suggestion-card"
                            onClick={() =>
                                handleSuggestion(suggestion)
                            }
                        >
                            {suggestion}
                        </button>
                    ))}

                </div>

                {answer && (
                    <div className="ai-response">

                        <div className="response-header">
                            <div className="response-icon">
                                <Bot size={20} />
                            </div>

                            <span>
                                WalletWise AI
                            </span>
                        </div>

                        <div className="response-content">
                            <ReactMarkdown>{answer}</ReactMarkdown>
                        </div>

                    </div>
                )}

                {error && (
                    <div className="ai-error">
                        {error}
                    </div>
                )}

                <form
                    className="ai-input-container"
                    onSubmit={handleAsk}
                >

                    <input
                        type="text"
                        value={question}
                        onChange={(e) =>
                            setQuestion(e.target.value)
                        }
                        placeholder="Ask something about your finances..."
                    />

                    <button
                        type="submit"
                        disabled={loading || !question.trim()}
                    >
                        {loading ? (
                            "Thinking..."
                        ) : (
                            <>
                                <Send size={18} />
                                Ask AI
                            </>
                        )}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default AIAdvisor;