export const QUESTION_EVALUATION_PROMPT = `
QUESTION EVALUATION DETAILS

Every answered question MUST have an evaluation block matching the schema.

For every question, determine:
- score (0 to 100)
- performanceLevel ("POOR" | "FAIR" | "GOOD" | "VERY_GOOD" | "EXCELLENT")
- strengths (array of strings)
- weaknesses (array of strings)
- missedKeyPoints (array of strings)
- suggestions (array of strings)
- feedback (object with summary and idealAnswer)

EVALUATING ZERO-SCORE / "I DON'T KNOW" ANSWERS:
If a question receives a score of 0 due to "I don't know", being empty, or being completely irrelevant:
1. "strengths": MUST be an empty array []. Do not invent strengths.
2. "weaknesses": Must contain a clear statement like "Failed to attempt the question" or "Indicated a lack of knowledge on this topic".
3. "missedKeyPoints": MUST contain ALL key points defined in the question's "keyPoints" list, verbatim.
4. "performanceLevel": MUST be "POOR".
5. "feedback.summary": Must explicitly note that no answer was attempted or provided.
6. "suggestions": Explain what specific concepts the candidate needs to study to answer this question.
`;
