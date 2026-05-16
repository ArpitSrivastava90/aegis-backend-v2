"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGitHubWebhookSignature = void 0;
const crypto_1 = __importDefault(require("crypto"));
const verifyGitHubWebhookSignature = (signature, rawBody) => {
    if (!signature) {
        return false;
    }
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    const expectedSignature = "sha256=" +
        crypto_1.default
            .createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");
    return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
};
exports.verifyGitHubWebhookSignature = verifyGitHubWebhookSignature;
