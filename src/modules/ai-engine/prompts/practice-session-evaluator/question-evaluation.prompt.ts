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

EVALUATING ZERO-SCORE / "I DON'T KNOW" / TRIVIAL / IRRELEVANT ANSWERS:
If a question receives a score of 0 due to "I don't know", being empty, being completely irrelevant, or being a trivial/low-effort response (e.g. "hey", "very easy", "nice", "ok"):
1. "strengths": MUST be an empty array []. Do not invent strengths or find positive aspects in a non-attempt.
2. "weaknesses": Must contain a clear statement like "Did not provide a technical attempt" or "Provided a trivial, non-substantive response".
3. "missedKeyPoints": MUST contain ALL key points defined in the question's "keyPoints" list, verbatim.
4. "performanceLevel": MUST be "POOR".
5. "feedback.summary": Must explicitly note that no meaningful answer was attempted or provided.
6. "suggestions": Explain what specific concepts the candidate needs to study to answer this question.
`;
