
import { useState } from "react";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { chatWithAgent } from "../services/agentService";
import "./Agent.css";

const suggestions = [
  "Analyze my financial situation",
  "How can I save ₹5,000 next month?",
  "Am I spending too much?",
  "Analyze my spending predictions",
];

function Agent() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your WalletWise AI Agent. I can analyze your transactions, budgets, savings goals, and spending predictions. What would you like to know?",
    },
  ]);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async (text = question) => {
    const trimmedQuestion = text.trim();

    if (!trimmedQuestion || loading) return;

    setError("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmedQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await chatWithAgent(
        trimmedQuestion
      );

      console.log("Agent response:", response);

      /*
       * Normal AI advice
       */
      if (response.type === "advice") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              response.message ||
              "I couldn't generate a response.",
          },
        ]);
      }

      /*
       * AI wants to perform an action
       * and approval is required.
       */
      else if (
        response.type === "approval_required"
      ) {
        const approval = response.approval;

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              response.message ||
              "I have prepared an action that requires your approval.",
          },
          {
            role: "assistant",
            content: approval
              ? `Approval created for "${approval.action}". You can review it from the Approvals page.`
              : "Please review the pending action in the Approvals page.",
          },
        ]);
      }

      /*
       * Fallback
       */
      else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              response.message ||
              "I received a response, but couldn't understand it.",
          },
        ]);
      }
    } catch (err) {
      console.error("Agent error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <div className="agent-page">
      <div className="agent-header">
        <div className="agent-title">
          <div className="agent-icon">
            <Bot size={25} />
          </div>

          <div>
            <h1>AI Financial Agent</h1>
            <p>
              Your intelligent financial analysis assistant
            </p>
          </div>
        </div>

        <div className="agent-status">
          <span className="status-dot"></span>
          Agent Ready
        </div>
      </div>

      <div className="agent-chat">
        <div className="agent-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`agent-message ${message.role}`}
            >
              <div className="message-avatar">
                {message.role === "assistant" ? (
                  <Bot size={19} />
                ) : (
                  <User size={19} />
                )}
              </div>

              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="agent-message assistant">
              <div className="message-avatar">
                <Bot size={19} />
              </div>

              <div className="message-content typing">
                Analyzing your financial data...
              </div>
            </div>
          )}

          {error && (
            <div className="agent-error">
              {error}
            </div>
          )}
        </div>

        {messages.length === 1 && (
          <div className="agent-suggestions">
            <h3>
              <Sparkles size={17} />
              Try asking
            </h3>

            <div className="suggestion-list">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() =>
                    sendMessage(suggestion)
                  }
                  disabled={loading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          className="agent-input"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Ask about your finances..."
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            disabled={loading}
          />

          <button
            type="submit"
            disabled={
              loading || !question.trim()
            }
            aria-label="Send message"
          >
            <Send size={19} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Agent;
