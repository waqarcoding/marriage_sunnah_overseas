import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

dotenv.config();

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ---------------- IMPORT DB ---------------- */
import db from "./models/index.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import matchRoutes from "./routes/match.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import exploreRoutes from "./routes/explore.routes.js";
import interestRoutes from "./routes/interest.routes.js";
import guardianRoutes from "./routes/guardian.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import subscriptionRoutes from './routes/subscription.routes.js';
import referralRoutes from './routes/referral.routes.js';
import { initSocket } from "./config/socket.js";

// ✅ Import cron job schedulers
import {
  scheduleExpiryNotifications,
  scheduleExpiredSubscriptionChecker,
  notifyExpiringSubscriptions,
  markExpiredSubscriptions
} from './config/cronjobs.js';

const app = express();
const PORT = process.env.PORT || 8080;

/* ---------------- CORS Configuration ---------------- */
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://marriagesunnaoverseas.com',
  'https://www.marriagesunnaoverseas.com'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/* ---------------- DEBUG: Log all requests ---------------- */
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} ${req.url}`);
  next();
});


/* ---------------- CRITICAL: Webhook route BEFORE bodyParser ---------------- */
// This route needs raw body for Stripe signature verification
app.use('/api/subscription/webhook',
  express.raw({ type: 'application/json' }),
  subscriptionRoutes
);
// Handle without /api prefix (for ingress stripping)
app.use('/subscription/webhook',
  express.raw({ type: 'application/json' }),
  subscriptionRoutes
);

/* ---------------- MIDDLEWARE (After webhook route) ---------------- */
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ---------------- STATIC UPLOADS ---------------- */
app.use("/uploads", express.static("uploads"));

/* ---------------- API ROUTES (with /api prefix) ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/interest", interestRoutes);
app.use("/api/guardian", guardianRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/referrals', referralRoutes);

/* ---------------- API ROUTES (without /api prefix - for ingress stripping) ---------------- */
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/match", matchRoutes);
app.use("/chat", chatRoutes);
app.use("/admin", adminRoutes);
app.use("/explore", exploreRoutes);
app.use("/interest", interestRoutes);
app.use("/guardian", guardianRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/notifications', notificationRoutes);
app.use('/referrals', referralRoutes);

/* ---------------- HEALTH CHECK ---------------- */
app.get("/api/health", (req, res) => res.json({
  status: "ok",
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  environment: process.env.NODE_ENV
}));
app.get("/health", (req, res) => res.json({
  status: "ok",
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  environment: process.env.NODE_ENV
}));

/* ✅ ADMIN ENDPOINTS - Manual Cron Triggers (for testing/debugging) ---------------- */
app.post('/api/admin/trigger-expiry-check', async (req, res) => {
  try {
    console.log('🔔 Manual trigger: Expiry notification check');
    const result = await notifyExpiringSubscriptions();
    res.json({
      ...result,
      success: true,
      message: 'Expiry check completed'
    });
  } catch (error) {
    console.error('Error in manual expiry check:', error);
    res.status(500).json({
      success: false,
      error: error
    });
  }
});

app.post('/api/admin/trigger-expired-check', async (req, res) => {
  try {
    console.log('🔔 Manual trigger: Expired subscription check');
    const result = await markExpiredSubscriptions();
    res.json({
      ...result,
      success: true,
      message: 'Expired subscription check completed'
    });
  } catch (error) {
    console.error('Error in manual expired check:', error);
    res.status(500).json({
      success: false,
      error: error
    });
  }
});

/* ---------------- SERVE REACT BUILD (Only in local/monolith deployment) ---------------- */
const shouldServeClient = process.env.SERVE_CLIENT === 'true';

if (shouldServeClient) {
  const clientDist = join(__dirname, "../client/dist");
  console.log(`📁 Attempting to serve client from: ${clientDist}`);

  if (existsSync(clientDist)) {
    console.log('✅ Client dist folder found, serving static files');
    app.use(express.static(clientDist));

    app.use((req, res, next) => {
      if (req.headers.host === "marriagesunnaoverseas.com") {
        return res.redirect(301, "https://www.marriagesunnaoverseas.com" + req.url);
      }
      next();
    });

    // Catch-all for SPA routing
    app.use((req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
        return next();
      }
      res.sendFile(join(clientDist, "index.html"));
    });
  } else {
    console.log('⚠️  Client dist folder not found at:', clientDist);
  }
} else {
  console.log('🚫 API-only mode: Not serving client files');
}

/* ---------------- 404 HANDLER (Must be AFTER all routes) ---------------- */
app.use((req, res, next) => {
  // ✅ Skip 404 for Socket.IO paths
  if (req.path.startsWith('/socket.io')) {
    return next();
  }

  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
    message: "The endpoint you are looking for does not exist."
  });
});

/* ---------------- ERROR HANDLER (Must be last) ---------------- */
app.use(errorMiddleware);

/* ---------------- HTTP SERVER ---------------- */
const server = http.createServer(app);

/* ---------------- START ---------------- */
const startServer = async () => {
  try {
    console.log("🚀 Starting server...");
    await db.authenticateDatabase();

    if (process.env.NODE_ENV !== "production") {
      await db.syncDatabase();
      console.log("🛠️ DB sync completed (development only)");
    } else {
      console.log("🚫 Production mode: skipping DB sync");
    }

    // ✅ Initialize Cron Jobs (skip in test/development environment)
    if (process.env.NODE_ENV === 'production') {
      console.log('\n⏰ Initializing cron jobs...');
      scheduleExpiryNotifications();
      scheduleExpiredSubscriptionChecker();
      console.log('✅ Cron jobs initialized successfully');
      console.log('   📧 Expiry notifications: Daily at 9:00 AM');
      console.log('   🔍 Expired checker: Every hour');
      console.log('   🛠️  Manual triggers available at:');
      console.log('      POST /api/admin/trigger-expiry-check');
      console.log('      POST /api/admin/trigger-expired-check\n');
    } else {
      console.log('🚫 Development mode: Skipping cron job initialization');
      console.log('   Use manual triggers for testing:');
      console.log('   POST /api/admin/trigger-expiry-check');
      console.log('   POST /api/admin/trigger-expired-check\n');
    }

    // Start server
    // @ts-ignore
    server.listen(PORT, "0.0.0.0", () => {
      const isProduction = process.env.NODE_ENV === 'production';
      const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;

      // ✅ Initialize Socket.IO ONCE - AFTER server is listening
      try {
        console.log('🔌 Initializing Socket.IO...');
        initSocket(server);
        console.log('✅ Socket.IO initialized successfully');
      } catch (socketError) {
        const msg = socketError instanceof Error ? socketError.message : String(socketError);
        console.error('❌ Socket.IO initialization failed:', msg);
        console.log('   Server will continue without real-time features');
      }

      console.log('\n' + '='.repeat(70));
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Base URL: ${baseUrl}`);
      console.log('='.repeat(70));
      console.log(`📡 Webhook: ${baseUrl}/api/subscription/webhook`);
      console.log(`🏥 Health: ${baseUrl}/api/health`);
      console.log(`🔌 Socket.IO: ${baseUrl}/socket.io/`);
      console.log(`🌐 Client: ${process.env.CLIENT_URL || 'Not set'}`);
      console.log(`📧 Email: ${process.env.MAIL_USER ? 'Configured ✓' : 'Not configured ✗'}`);
      console.log(`💬 WebSocket: ${process.env.SOCKET_ENABLED !== 'false' ? 'Enabled ✓' : 'Disabled ✗'}`);
      console.log(`🎯 Mode: ${shouldServeClient ? 'Monolith (API + Client)' : 'API Only'}`);
      console.log(`🔐 CORS: ${allowedOrigins.length} origins allowed`);
      console.log('='.repeat(70) + '\n');
    });

  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

startServer();