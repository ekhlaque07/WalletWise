import { useEffect, useState } from "react";

import {
  Check,
  X,
  Clock,
  Bot,
} from "lucide-react";

import {
  getApprovals,
  approveApproval,
  rejectApproval,
} from "../services/approvalService";

import "./Approvals.css";

function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState("");

  const loadApprovals = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getApprovals();

      setApprovals(data.approvals || []);
    } catch (err) {
      console.error(
        "Load approvals error:",
        err
      );

      setError(
        err.message ||
        "Failed to load approvals."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  // =====================================================
  // APPROVE
  // =====================================================

  const handleApprove = async (id) => {
    try {
      setProcessing(id);
      setError("");

      /*
       * IMPORTANT:
       *
       * approveApproval() already executes the
       * approved action on the backend.
       *
       * Do NOT call executeApproval() separately.
       */

      await approveApproval(id);

      await loadApprovals();

    } catch (err) {
      console.error(
        "Approve error:",
        err
      );

      setError(
        err.message ||
        "Failed to approve action."
      );

    } finally {
      setProcessing(null);
    }
  };

  // =====================================================
  // REJECT
  // =====================================================

  const handleReject = async (id) => {
    try {
      setProcessing(id);
      setError("");

      await rejectApproval(id);

      await loadApprovals();

    } catch (err) {
      console.error(
        "Reject error:",
        err
      );

      setError(
        err.message ||
        "Failed to reject action."
      );

    } finally {
      setProcessing(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="approvals-page">

        <div className="approval-loading">
          Loading approval requests...
        </div>

      </div>
    );
  }

  return (
    <div className="approvals-page">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="approvals-header">

        <div>

          <h1>
            AI Approvals
          </h1>

          <p>
            Review actions suggested by your
            WalletWise AI agent.
          </p>

        </div>

        <div className="approval-header-icon">
          <Bot size={28} />
        </div>

      </div>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="approval-error">
          {error}
        </div>
      )}


      {/* ================================================= */}
      {/* EMPTY */}
      {/* ================================================= */}

      {approvals.length === 0 ? (

        <div className="empty-approvals">

          <Check size={42} />

          <h2>
            No approval requests
          </h2>

          <p>
            Your AI agent does not currently
            need your approval.
          </p>

        </div>

      ) : (

        <div className="approval-list">

          {approvals.map((approval) => {

            const isPending =
              approval.status === "pending";

            const isProcessing =
              processing === approval._id;

            return (
              <div
                className="approval-card"
                key={approval._id}
              >

                {/* ======================================= */}
                {/* CARD */}
                {/* ======================================= */}

                <div className="approval-card-top">

                  <div className="approval-icon">
                    <Bot size={22} />
                  </div>

                  <div className="approval-content">

                    <h2>
                      {approval.action ||
                        approval.title ||
                        "AI Action"}
                    </h2>

                    <p>
                      {approval.reason ||
                        approval.description ||
                        "The AI agent requested this action."}
                    </p>


                    <div className="approval-meta">

                      <span>

                        <Clock size={15} />

                        {new Date(
                          approval.createdAt
                        ).toLocaleString()}

                      </span>


                      <span
                        className={`approval-status status-${approval.status}`}
                      >
                        {approval.status}
                      </span>

                    </div>

                  </div>

                </div>


                {/* ======================================= */}
                {/* ACTIONS */}
                {/* ======================================= */}

                {isPending ? (

                  <div className="approval-actions">

                    <button
                      className="reject-btn"
                      onClick={() =>
                        handleReject(
                          approval._id
                        )
                      }
                      disabled={isProcessing}
                    >

                      <X size={17} />

                      Reject

                    </button>


                    <button
                      className="approve-btn"
                      onClick={() =>
                        handleApprove(
                          approval._id
                        )
                      }
                      disabled={isProcessing}
                    >

                      <Check size={17} />

                      {isProcessing
                        ? "Processing..."
                        : "Approve & Execute"}

                    </button>

                  </div>

                ) : (

                  <div className="approval-completed">

                    {approval.status ===
                    "executed" ? (
                      <>
                        <Check size={17} />
                        Action executed
                      </>
                    ) : approval.status ===
                      "rejected" ? (
                      <>
                        <X size={17} />
                        Action rejected
                      </>
                    ) : (
                      <>
                        <Clock size={17} />
                        {approval.status}
                      </>
                    )}

                  </div>

                )}

              </div>
            );
          })}

        </div>

      )}

    </div>
  );
}

export default Approvals;