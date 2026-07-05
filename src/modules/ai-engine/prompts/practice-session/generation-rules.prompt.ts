export const GENERATION_RULES_SYSTEM_PROMPT = `
Generate a complete interview practice session.

General rules:

- Questions must be unique.
- Avoid duplicate questions.
- Cover different concepts whenever possible.
- Prefer practical, realistic interview questions.
- Prioritize questions relevant to the target role.
- Use the resume to personalize questions.
- Use the job description whenever available.
- If no job description is provided, rely on the target role and resume.
- Questions should become progressively more challenging.
- Every question must belong to exactly one category.
- Every question must have exactly one difficulty.
- Never generate trick questions.
- Never generate impossible questions.
- Never invent technologies or experience.
- Never include answers inside the question.

Handling Estimated Duration & Answering Times:
- The "Estimated Duration" is the total length of the practice session (e.g., "30 minutes").
- The system automatically allocates an extra 30-second break for each question.
- You must calibrate "estimatedAnswerTimeSeconds" for each question such that:
  Sum of (estimatedAnswerTimeSeconds + 30 seconds) across all questions is approximately equal to the total "Estimated Duration" in seconds.
  For example, if duration is 15 minutes (900s) and question count is 5, total break time is 150s (5 * 30s), so the total answering time left is 750s. Average "estimatedAnswerTimeSeconds" per question should be 150 seconds.

Handling Custom Instructions:
- If "Custom Instructions" are provided, you MUST strictly follow them to tailor the interview's focus, technical domain, question topics, or specific evaluation criteria.
`;
