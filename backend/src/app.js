const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const {
  generalLimiter,
} = require("./middleware/securityMiddleware");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// =====================================================
// SECURITY HEADERS
// =====================================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// =====================================================
// CORS
// =====================================================

const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests such as Postman/server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS: Origin not allowed"));
    },
    credentials: true,
  })
);

// =====================================================
// BODY PARSER
// =====================================================

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

// =====================================================
// GENERAL RATE LIMITER
// =====================================================

app.use(generalLimiter);

// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const goalRoutes = require("./routes/goalRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const mlRoutes = require("./routes/mlRoutes");
const anomalyRoutes = require("./routes/anomalyRoutes");
const cashflowRoutes = require("./routes/cashflowRoutes");

const aiAdvisorRoutes = require("./routes/aiAdvisorRoutes");
const simulatorRoutes = require("./routes/simulatorRoutes");
const agentRoutes = require("./routes/agentRoutes");
const approvalRoutes = require("./routes/approvalRoutes");
const hfTestRoutes = require("./routes/hfTestRoutes");

const notificationRoutes = require("./routes/notificationRoutes");

const userRoutes = require("./routes/userRoutes");

// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to WalletWise API",
  });
});

// =====================================================
// API TEST
// =====================================================

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "WalletWise API is working",
  });
});

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use("/api/ml", mlRoutes);
app.use("/api/anomalies", anomalyRoutes);
app.use("/api/cashflow", cashflowRoutes);

app.use("/api/ai-advisor", aiAdvisorRoutes);
app.use("/api/simulator", simulatorRoutes);

app.use("/api/agent", agentRoutes);
app.use("/api/approvals", approvalRoutes);

app.use("/api/hf", hfTestRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/user", userRoutes);

// =====================================================
// 404
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =====================================================
// CENTRAL ERROR HANDLER
// =====================================================

app.use(errorMiddleware);

module.exports = app;