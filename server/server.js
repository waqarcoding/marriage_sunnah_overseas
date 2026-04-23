import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";

dotenv.config();

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
app.use(cors());
app.use(bodyParser.json());

/* ---------------- STATIC FILES ---------------- */
app.use("/uploads", express.static("uploads"));

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/interest", interestRoutes);
app.use("/api/guardian", guardianRoutes);

/* ---------------- HEALTH CHECK ---------------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* fallback health */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ---------------- ERROR HANDLER (LAST) ---------------- */
app.use(errorMiddleware);

/* ---------------- SERVER ---------------- */
const server = http.createServer(app);

/* socket init */
initSocket(server);

/* IMPORTANT FIX FOR DIGITALOCEAN */
// @ts-ignore
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});