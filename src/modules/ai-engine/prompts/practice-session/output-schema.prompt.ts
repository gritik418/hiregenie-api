export const OUTPUT_SCHEMA_SYSTEM_PROMPT = `
Return a JSON object matching this schema exactly.

{
  "overview": {
    "summary": string,
    "focusAreas": [string],
    "estimatedDurationMinutes": number,
    "instructions": [string]
  },

  "questions": [
    {
      "question": string,
      "category": "TECHNICAL" | "BEHAVIORAL" | "EXPERIENCE" | "SITUATIONAL" | "ROLE_SPECIFIC" | "PROBLEM_SOLVING" | "CASE_STUDY" | "DOMAIN_KNOWLEDGE" | "LEADERSHIP" | "COMMUNICATION" | "CULTURE_FIT" | "GENERAL",
      "difficulty": "BEGINNER" | "EASY" | "MEDIUM" | "HARD" | "EXPERT",
      "expectedAnswer": string,
      "keyPoints": [string],
      "hints": [string],
      "evaluationCriteria": [string],
      "estimatedAnswerTimeSeconds": number,
      "tags": [string]
    }
  ]
}

QUESTION COUNT RULES

- Generate EXACTLY the number of questions specified in "Question Count".
- Never generate fewer questions.
- Never generate more questions.
- Every question must be unique.
- Do not repeat topics.
- If the requested count is 10, the questions array MUST contain exactly 10 items.
`;
