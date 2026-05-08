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

/* ---------------- CORS (Must be first) ---------------- */
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));

/* ---------------- CRITICAL: Webhook route BEFORE bodyParser ---------------- */
// This route needs raw body for Stripe signature verification
app.use('/api/subscription/webhook',
  express.raw({ type: 'application/json' }),
  subscriptionRoutes
);

/* ---------------- MIDDLEWARE (After webhook route) ---------------- */
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- STATIC UPLOADS ---------------- */
app.use("/uploads", express.static("uploads"));

/* ---------------- API ROUTES ---------------- */
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

/* ---------------- HEALTH CHECK ---------------- */
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));

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

/* ---------------- SERVE REACT BUILD ---------------- */
const clientDist = join(__dirname, "../client/dist");
console.log(`📁 __dirname: ${__dirname}`);
console.log(`📁 clientDist: ${clientDist}`);
console.log(`📁 exists: ${existsSync(clientDist)}`);

app.use(express.static(clientDist));

app.use((req, res, next) => {
  if (req.headers.host === "marriagesunnaoverseas.com") {
    return res.redirect(301, "https://www.marriagesunnaoverseas.com" + req.url);
  }
  next();
});

// ✅ FIXED: Use middleware instead of route for catch-all
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
    return res.status(404).json({
      error: "Error 404",
      path: req.path,
      message: "The resource/route you are looking for could not be found. Have a wonderful day!"
    });
  }
  res.sendFile(join(clientDist, "index.html"));
});

/* ---------------- ERROR HANDLER ---------------- */
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

    // ✅ Initialize Socket.IO
    initSocket(server);

    // ✅ Initialize Cron Jobs (skip in test environment)
    if (process.env.NODE_ENV !== 'test') {
      console.log('\n⏰ Initializing cron jobs...');

      // Schedule expiry notifications (daily at 9:00 AM)
      scheduleExpiryNotifications();

      // Schedule expired subscription checker (every hour)
      scheduleExpiredSubscriptionChecker();

      console.log('✅ Cron jobs initialized successfully');
      console.log('   📧 Expiry notifications: Daily at 9:00 AM');
      console.log('   🔍 Expired checker: Every hour');
      console.log('   🛠️  Manual triggers available at:');
      console.log('      POST /api/admin/trigger-expiry-check');
      console.log('      POST /api/admin/trigger-expired-check\n');
    } else {
      console.log('🚫 Test mode: Skipping cron job initialization');
    }

    // @ts-ignore
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📡 Webhook endpoint: http://localhost:${PORT}/api/subscription/webhook`);
      console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'Not set'}`);
      console.log(`📧 Email service: ${process.env.MAIL_USER ? 'Configured ✓' : 'Not configured ✗'}`);
    });

  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

startServer();