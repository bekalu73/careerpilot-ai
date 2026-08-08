"use strict";
// CareerPilot AI — Express Backend
// Loads env vars first, before any other imports
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const career_js_1 = __importDefault(require("./routes/career.js"));
const jobs_js_1 = __importDefault(require("./routes/jobs.js"));
const applications_js_1 = __importDefault(require("./routes/applications.js"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env["PORT"] ?? "5001", 10);
// ─── Middleware ───────────────────────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        process.env["FRONTEND_URL"] ?? "",
    ].filter(Boolean),
    credentials: true,
}));
app.use(express_1.default.json({ limit: "5mb" })); // Resume HTML can be large
app.use(express_1.default.urlencoded({ extended: true }));
// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "careerpilot-api",
        timestamp: new Date().toISOString(),
    });
});
// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/career", career_js_1.default);
app.use("/api/jobs", jobs_js_1.default);
app.use("/api/applications", applications_js_1.default);
// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
});
// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error("[Unhandled Error]", err);
    res.status(500).json({ error: "Internal server error" });
});
// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 CareerPilot API running on http://localhost:${PORT}`);
    console.log(`📡 Health: http://localhost:${PORT}/api/health\n`);
});
exports.default = app;
//# sourceMappingURL=server.js.map