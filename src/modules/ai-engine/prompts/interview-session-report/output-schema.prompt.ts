export const OUTPUT_SCHEMA_PROMPT = `
You must respond with a raw JSON object that strictly adheres to the following structure.
Do not include markdown blocks, code blocks, or any other text before or after the JSON object.

{
  "overallScore": <number between 0-100>,
  "summary": "<string, 20-1000 characters>",
  "scores": {
    "technical": <number between 0-100>,
    "communication": <number between 0-100>,
    "problemSolving": <number between 0-100>,
    "confidence": <number between 0-100>
  },
  "strengths": ["<string>", ... (3-6 items)],
  "weaknesses": ["<string>", ... (2-5 items)],
  "improvements": ["<string>", ... (3-8 items)],
  "skills": {
    "demonstrated": ["<string>", ...],
    "missing": ["<string>", ...]
  },
  "questionAnalysis": [
    {
      "question": "<string>",
      "candidateAnswer": "<string>",
      "score": <number between 0-100>,
      "feedback": "<string>",
      "idealAnswer": "<string>"
    }
  ],
  "recommendation": {
    "decision": "STRONG_HIRE" | "HIRE" | "BORDERLINE" | "NO_HIRE",
    "confidence": <number between 0-100>,
    "reason": "<string>"
  },
  "nextSteps": ["<string>", ... (3-8 items)]
}
`;
