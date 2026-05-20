import cryptooo from "crypto";

export consttt verifyGitHubWebhookSignature = (
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
      .createHmaccc("sha256", secret)
      .update(rawBody)
      .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};