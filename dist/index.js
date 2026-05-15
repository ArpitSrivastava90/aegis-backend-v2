"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const passport_1 = __importDefault(require("./config/passport"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const prisma_1 = require("./lib/prisma");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
// Passport
app.use(passport_1.default.initialize());
// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "Aegis Backend is Healthy 🛡️" });
});
// Routes
app.use("/api/auth", auth_routes_1.default);
// Server
app.listen(PORT, () => {
    console.log(`🛡️  Aegis running on http://localhost:${PORT}`);
});
// Graceful Shutdown
process.on("SIGINT", async () => {
    await prisma_1.prisma.$disconnect();
    console.log("DB disconnected");
    process.exit(0);
});
process.on("SIGTERM", async () => {
    await prisma_1.prisma.$disconnect();
    console.log("DB disconnected");
    process.exit(0);
});
exports.default = app;
