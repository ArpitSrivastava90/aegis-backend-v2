import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  return res.json({
    message: "Webhook route working",
  });
});

router.post("/", async (req, res) => {
  console.log("GitHub webhook received");

  return res.status(200).json({
    success: true,
  });
});

export default router;