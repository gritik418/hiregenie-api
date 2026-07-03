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
`;
