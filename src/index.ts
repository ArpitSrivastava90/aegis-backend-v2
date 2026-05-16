import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./config/passport";
import authRoutes from "./routes/auth.routes";
import { prisma } from "./lib/prisma";
import githubRoutes from "./routes/github.routes"
import githubWebhookRoutes from "./routes/github.webhook.routes";
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(
  "/api/github/webhooks",
  express.raw({ type: "application/json" })
);
app.use(express.json());


// Session — only needed to bridge OAuth round trip
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 5 * 60 * 1000, // 5 mins — only needed during OAuth flow
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "Aegis Backend is Healthy 🛡️" });
});

app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/github/webhooks", githubWebhookRoutes);

app.listen(PORT, () => {
  console.log(`🛡️  Aegis running on http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;