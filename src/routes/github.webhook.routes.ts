import { Router } from "express";
import { verifyGitHubWebhookSignature } from "../services/github/github.webhook.service";

const router = Router();

router.get("/", (req, res) => {
  return res.json({
    message: "Webhook route working",
  });
});

router.post("/", async (req, res) => {
  const signature = req.headers["x-hub-signature-256"];

  const isValid = verifyGitHubWebhookSignature(
    signature as string,
    req.body as Buffer
  );

  if (!isValid) {
    return res.status(401).json({
      message: "Invalid webhook signature",
    });
  }

  console.log("Valid GitHub webhook received");

  return res.status(200).json({
    success: true,
  });
});



export default router;