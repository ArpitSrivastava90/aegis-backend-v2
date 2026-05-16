import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

const model = genAI.getGenerativeModel({
  model: "gemini-pro",
});

export const generatePRSummary = async (
  prData: string
) => {
  const prompt = `
You are an expert senior software engineer.

Analyze this pull request diff and generate:

1. Simple summary
2. Main changes
3. Potential impact

Keep response concise and mobile-friendly.

PR Diff:
${prData}
`;

  const result = await model.generateContent(prompt);

  const response = result.response.text();

  return response;
};