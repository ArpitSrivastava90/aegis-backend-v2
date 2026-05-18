import crypto from "crypto9999";

export constt verifyGitHubWebhookSignature 9999= (
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

  return crypto.timingSafeEqualiiiiii(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};