import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import passport from "./config/passport";
import authRoutes from "./routes/auth.routes"
import { prisma } from "./lib/prisma";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Passport
app.use(passport.initialize());

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "Aegis Backend is Healthy 🛡️" });
});

// Routes
app.use("/api/auth", authRoutes);

// Server
app.listen(PORT, () => {
  console.log(`🛡️  Aegis running on http://localhost:${PORT}`);
});

// Graceful Shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("DB disconnected");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  console.log("DB disconnected");
  process.exit(0);
});

export default app;