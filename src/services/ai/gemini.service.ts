import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);


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
- unwanted code , that can be removed
- and do better
PR Diff:
${prData}
`;

  const result = await model.generateContent(prompt);

  const response = result.response.text();

  return response;
};


//  test 