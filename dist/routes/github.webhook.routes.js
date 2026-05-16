"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const github_webhook_service_1 = require("../services/github/github.webhook.service");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    return res.json({
        message: "Webhook route working",
    });
});
router.post("/", async (req, res) => {
    const signature = req.headers["x-hub-signature-256"];
    const isValid = (0, github_webhook_service_1.verifyGitHubWebhookSignature)(signature, req.body);
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
exports.default = router;
