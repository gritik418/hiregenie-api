export const OUTPUT_SCHEMA_PROMPT = `
You must respond with a raw JSON object that strictly adheres to the following structure.
Do not include markdown blocks, code blocks, or any other text before or after the JSON object.

{
  "overallScore": <number between 0-100>,
  "summary": "<string, detailed summary of performance>",
  "scores": {
    "technical": <number between 0-100>,
    "communication": <number between 0-100>,
    "problemSolving": <number between 0-100>,
    "confidence": <number between 0-100>
  },
  "strengths": [
    "<string, strength 1>",
    "<string, strength 2>"
  ],
  "weaknesses": [
    "<string, weakness 1>",
    "<string, weakness 2>"
  ],
  "improvements": [
    "<string, improvement 1>",
    "<string, improvement 2>"
  ],
  "skills": {
    "demonstrated": [
      "<string, skill 1>",
      "<string, skill 2>"
    ],
    "missing": [
      "<string, missing skill 1>",
      "<string, missing skill 2>"
    ]
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
    "decision": "<must be one of: STRONG_HIRE, HIRE, BORDERLINE, NO_HIRE>",
    "confidence": <number between 0-100>,
    "reason": "<string>"
  },
  "nextSteps": [
    "<string, next step 1>",
    "<string, next step 2>"
  ]
}
`;
