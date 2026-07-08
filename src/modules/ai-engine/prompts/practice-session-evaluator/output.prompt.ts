export const OUTPUT_PROMPT = `
OUTPUT FORMAT RULES

Your response MUST be a single, valid JSON object matching the exact schema below. Do not wrap in markdown fences (like \`\`\`json ... \`\`\`), do not include any explanatory prefix/suffix text, and do not include any conversational text.

SCHEMA:
{
  "questionEvaluations": [
    {
      "questionId": string,
      "score": number (integer between 0 and 100),
      "performanceLevel": "POOR" | "FAIR" | "GOOD" | "VERY_GOOD" | "EXCELLENT",
      "strengths": [string],
      "weaknesses": [string],
      "missedKeyPoints": [string],
      "suggestions": [string],
      "feedback": {
        "summary": string,
        "idealAnswer": string
      }
    }
  ],
  "overallScore": number (integer between 0 and 100),
  "performanceLevel": "POOR" | "FAIR" | "GOOD" | "VERY_GOOD" | "EXCELLENT",
  "hiringRecommendation": "NOT_RECOMMENDED" | "CONSIDER" | "RECOMMENDED" | "STRONGLY_RECOMMENDED",
  "breakdown": {
    "technicalKnowledge": number (integer between 0 and 100),
    "problemSolving": number (integer between 0 and 100),
    "communication": number (integer between 0 and 100),
    "confidence": number (integer between 0 and 100),
    "completeness": number (integer between 0 and 100)
  },
  "strengths": [string],
  "weaknesses": [string],
  "suggestions": [string],
  "nextSteps": [string],
  "summary": string,
  "reason": string,
  "feedback": {
    "summary": string,
    "highlights": [string],
    "areasToImprove": [string],
    "overallAssessment": string
  }
}

CRITICAL RULES:
- The values for "performanceLevel" and "hiringRecommendation" MUST be exactly one of the uppercase strings listed above. NEVER use lowercase or mixed case (e.g. use "POOR", not "poor" or "Poor").
- The questionId in questionEvaluations must match the ID of the evaluated question exactly.
- If a question was answered with "I don't know" or left blank, follow the zero-score rule: its score must be 0, performanceLevel must be "POOR", strengths must be [], and missedKeyPoints must list all of the question's key points.
- Do not return empty objects or null arrays. Use empty arrays [] if no strengths or recommendations exist.
- Ensure all braces, quotes, and commas are correct to generate a valid JSON block.
`;
