import dotenv from "dotenv";

dotenv.config({ path: "./.env" });
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { pool } from "./db.js";
import authRouter from "./routes/auth.js";
import profilesRouter from "./routes/profiles.js";
import forumRouter from "./routes/forum.js";
import peerChatsRouter from "./routes/peerChats.js";
import moodLogsRouter from "./routes/moodLogs.js";
import notificationsRouter from "./routes/notifications.js";
import aiChatsRouter from "./routes/aiChats.js";
import aiStreamRouter from "./routes/aiStream.js";
import securityRouter from "./routes/security.js";
import uploadsRouter from "./routes/uploads.js";

async function applySchema() {
  const schemaPath = path.resolve(process.cwd(), "server/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");
  await pool.query(sql);
  console.log("[db] schema applied");
}

async function main() {
  await applySchema();

  const app = express();

  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());

  // Static uploads
  const uploadDir = path.resolve(process.cwd(), "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });
  app.use("/uploads", express.static(uploadDir, { maxAge: "7d" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/profiles", profilesRouter);
  app.use("/api/forum", forumRouter);
  app.use("/api/peer-chats", peerChatsRouter);
  app.use("/api/mood-logs", moodLogsRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/ai-chats", aiChatsRouter);
  app.use("/api/ai-stream", aiStreamRouter);
  app.use("/api/security", securityRouter);
  app.use("/api/uploads", uploadsRouter);

  // Production: serve built frontend
  const distDir = path.resolve(process.cwd(), "dist");
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/uploads"))
        return next();
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  const port = parseInt(process.env.API_PORT || "3001", 10);
  app.listen(port, "0.0.0.0", () => {
    console.log(`[api] listening on :${port}`);
  });
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
