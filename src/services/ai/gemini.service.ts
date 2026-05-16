import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ✅ Use the current, active 2.x generation model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generatePRSummary = async (prData: string) => {
 const prompt = `
You are an expert senior software engineer.

Analyze this pull request diff.

Return ONLY:

1. Short summary (2-4 lines)
2. Main technical changes
3. Potential impact

Keep response:
- concise
- mobile-friendly
- developer-focused
- no unnecessary explanations

PR Diff:
${prData}
`;

  const result = await model.generateContent(prompt);

  const response = result.response.text();

  return response;
};


export const analyzePRVulnerabilities = async (
  prData: string
) => {
  const prompt = `
You are a senior security engineer.

Analyze this pull request diff for:
- auth bypass risks
- secret exposure
- unsafe queries
- insecure configs
- validation bypasses
- dangerous environment usage
- security vulnerabilities

Return ONLY valid JSON.

Format:

{
  "vulnerabilities": [
    {
      "severity": "low | medium | high | critical",
      "title": "short vulnerability title",
      "reason": "short explanation"
    }
  ]
}

If no vulnerabilities exist:

{
  "vulnerabilities": []
}

PR Diff:
${prData}
`;

  const result = await model.generateContent(prompt);

  const text = result.response
  .text()
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

return JSON.parse(text);
};

export const generatePRRiskScore = async (
  prData: string
) => {
  const prompt = `
You are a senior software architect and security engineer.

Analyze this pull request diff.

Estimate deployment and system risk.

Consider:
- authentication changes
- database/schema changes
- infrastructure modifications
- deployment config changes
- dangerous logic
- validation removal
- environment variable changes
- sensitive file modifications

Return ONLY valid JSON.

Format:

{
  "riskScore": 1-10,
  "severity": "low | medium | high | critical",
  "reasons": [
    "reason 1",
    "reason 2"
  ]
}

PR Diff:
${prData}
`;

  const result = await model.generateContent(prompt);

  const text = result.response
  .text()
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

return JSON.parse(text);
};