"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePRSummary = void 0;
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
});
const generatePRSummary = async (prData) => {
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
exports.generatePRSummary = generatePRSummary;
