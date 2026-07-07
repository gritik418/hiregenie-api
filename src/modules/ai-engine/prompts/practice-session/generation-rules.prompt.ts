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

Handling Answering Times:
- Estimate and calibrate "estimatedAnswerTimeSeconds" for each question individually based on the question's complexity, depth, and difficulty.
- For example, an easy question might require 60-90 seconds, a medium question 120-180 seconds, and a hard/expert question 180-300+ seconds.
- The system automatically allocates an extra 30-second break for each question when calculating the total practice session duration.
- Ensure that the questions generated have sufficient depth and complexity to justify their allocated answering times.

Handling Custom Instructions:
- If "Custom Instructions" are provided, you MUST strictly follow them to tailor the interview's focus, technical domain, question topics, or specific evaluation criteria.
`;
