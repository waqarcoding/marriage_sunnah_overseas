import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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

import { initSocket } from "./config/socket.js";

const app = express();
const PORT = process.env.PORT || 8080;

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(bodyParser.json());

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

/* ---------------- HEALTH CHECK ---------------- */
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));

/* ---------------- SERVE REACT BUILD ---------------- */
const clientDist = join(__dirname, "../client/dist");
app.use(express.static(clientDist));

// catch-all → serve React for any non-API route
app.get("/{*path}", (req, res) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
    return res.status(404).json({ error: "Not found" });
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

    initSocket(server);

    // @ts-ignore
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

startServer();