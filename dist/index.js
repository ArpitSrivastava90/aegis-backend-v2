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
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./config/passport"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const prisma_1 = require("./lib/prisma");
const github_routes_1 = __importDefault(require("./routes/github.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
// Session — only needed to bridge OAuth round trip
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 5 * 60 * 1000, // 5 mins — only needed during OAuth flow
    },
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.get("/health", (req, res) => {
    res.status(200).json({ status: "Aegis Backend is Healthy 🛡️" });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/github", github_routes_1.default);
app.listen(PORT, () => {
    console.log(`🛡️  Aegis running on http://localhost:${PORT}`);
});
process.on("SIGINT", async () => {
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
process.on("SIGTERM", async () => {
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
exports.default = app;
