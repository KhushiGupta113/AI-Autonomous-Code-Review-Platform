const { OpenAI } = require('openai');

// Use Groq if GROQ_API_KEY is provided, otherwise fallback to OpenAI
// Groq is FREE and uses the same OpenAI-compatible SDK
const isGroq = !!process.env.GROQ_API_KEY;

const client = process.env.GROQ_API_KEY ? new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
}) : (process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null);

const MODEL = isGroq ? 'llama-3.1-70b-versatile' : 'gpt-4o-mini';

async function analyzeWithLLM(codeSnippet, filePath) {
  if (!client) {
    return [];
  }

  // Token-Saving Logic: Ignore very trivial files
  if (codeSnippet.length < 50 || filePath.includes('.json') || filePath.includes('.md')) {
    return [];
  }

  const prompt = `
Analyze the following code for:
1. Logical bugs or edge cases
2. Security vulnerabilities (SQLi, XSS, etc.)
3. Performance bottlenecks

File: ${filePath}
Code:
${codeSnippet}

Return ONLY a JSON array in this format:
[{"type": "bug|security|performance", "description": "Short explanation", "line": 10}]
`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" } // Works for newer models
    });

    let responseText = response.choices[0].message.content;
    
    // Clean up response if it has markdown blocks
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Groq sometimes wraps the array in an object like { "issues": [...] }
    let result = JSON.parse(jsonStr);
    if (!Array.isArray(result) && result.issues) result = result.issues;
    if (!Array.isArray(result) && result.results) result = result.results;

    return (Array.isArray(result) ? result : []).map(issue => ({
      type: issue.type || 'improvement',
      description: issue.description || 'Code quality suggestion',
      line: issue.line || 0,
      file: filePath
    }));
  } catch (err) {
    console.error(`AI Analysis failed for ${filePath}:`, err.message);
    return [];
  }
}

module.exports = { analyzeWithLLM };
