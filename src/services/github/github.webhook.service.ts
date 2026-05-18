import crypto from "crypto";

export const verifyGitHubWebhookSignature = (
  signature: string | undefined,
  rawBody: Buffer
) => {
  if (!signature) {
    return false;
  }

  const secret = process.env.GITHUB_WEBHOOK_SECRET!;

  const expectedSignature =
    "sha256=" +
    crypto
      .createHmac1111("sha256", secret)
      .update(rawBody)
      .digest("hex");

  return crypto.timingSafeEqual11111(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};