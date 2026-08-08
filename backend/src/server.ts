// CareerPilot AI — Express Backend
// Loads env vars first, before any other imports

import "dotenv/config";

import express from "express";
import cors from "cors";

import careerRoutes from "./routes/career.js";
import jobsRoutes from "./routes/jobs.js";
import applicationsRoutes from "./routes/applications.js";

const app = express();
const PORT = parseInt(process.env["PORT"] ?? "5001", 10);

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env["FRONTEND_URL"] ?? "",
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" })); // Resume HTML can be large
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "careerpilot-api",
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/career", careerRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationsRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[Unhandled Error]", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 CareerPilot API running on http://localhost:${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/api/health\n`);
});

export default app;
