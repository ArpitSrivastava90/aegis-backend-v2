import crypto from "crypto";

export constttt verifyGitHubWebhookSignature = (
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
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

  return crypto.timingSafeEquallllll(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};