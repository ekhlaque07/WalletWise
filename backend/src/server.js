const dotenv = require("dotenv");

dotenv.config();

// =====================================================
// ENVIRONMENT VARIABLES
// =====================================================

console.log(
  "Email loaded:",
  !!process.env.EMAIL_USER
);

console.log(
  "Password loaded:",
  !!process.env.EMAIL_PASS
);

// =====================================================
// ENV VALIDATION
// =====================================================

const validateEnv = require("./config/env");

validateEnv();

// =====================================================
// APP
// =====================================================

const app = require("./app");

// =====================================================
// DATABASE
// =====================================================

const connectDB = require("./config/db");

// =====================================================
// HTTP SERVER
// =====================================================

const http = require("http");

const server = http.createServer(app);

// =====================================================
// SOCKET.IO
// =====================================================

const { Server } = require("socket.io");

const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = new Server(server, {
  path: "/socket.io",

  cors: {
    origin: allowedOrigins,

    methods: ["GET", "POST"],

    credentials: true,
  },

  transports: ["polling", "websocket"],
});

// =====================================================
// JWT
// =====================================================

const jwt = require("jsonwebtoken");

// =====================================================
// NOTIFICATION SERVICE
// =====================================================

const {
  setSocketIO,
} = require("./services/notificationService");

// =====================================================
// SOCKET AUTHENTICATION
// =====================================================

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    // -----------------------------------------------
    // TOKEN REQUIRED
    // -----------------------------------------------

    if (!token) {
      return next(
        new Error("Authentication required")
      );
    }

    // -----------------------------------------------
    // VERIFY JWT
    // -----------------------------------------------

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // -----------------------------------------------
    // GET USER ID
    // -----------------------------------------------

    const userId =
      decoded.userId ||
      decoded.id ||
      decoded._id;

    if (!userId) {
      return next(
        new Error("Invalid authentication token")
      );
    }

    // -----------------------------------------------
    // STORE USER ID ON SOCKET
    // -----------------------------------------------

    socket.userId = userId.toString();

    next();
  } catch (error) {
    console.error(
      "Socket authentication error:",
      error.message
    );

    next(
      new Error("Invalid or expired token")
    );
  }
});

// =====================================================
// SOCKET CONNECTION
// =====================================================

io.on("connection", (socket) => {
  const room = `user:${socket.userId}`;

  // -----------------------------------------------
  // USER-SPECIFIC ROOM
  // -----------------------------------------------

  socket.join(room);

  console.log(
    `🔔 Notification socket connected: ${socket.userId}`
  );

  console.log(
    `Socket ID: ${socket.id}`
  );

  // -----------------------------------------------
  // DISCONNECT
  // -----------------------------------------------

  socket.on("disconnect", (reason) => {
    console.log(
      `🔌 Socket disconnected: ${socket.userId}`
    );

    console.log(
      `Disconnect reason: ${reason}`
    );
  });
});

// =====================================================
// GIVE SOCKET.IO TO NOTIFICATION SERVICE
// =====================================================

setSocketIO(io);

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // ---------------------------------------------
    // CONNECT DATABASE
    // ---------------------------------------------

    await connectDB();

    // ---------------------------------------------
    // START HTTP SERVER
    // ---------------------------------------------

    server.listen(PORT, () => {
      console.log(
        `🚀 WalletWise backend running on port ${PORT}`
      );

      console.log(
        `🔌 Socket.IO running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "❌ Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();