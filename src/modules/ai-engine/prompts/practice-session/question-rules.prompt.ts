export const QUESTION_RULES_SYSTEM_PROMPT = `
For every generated question:

expectedAnswer

- Provide an ideal interview answer.
- Keep it concise but complete.
- Do not copy the resume.

keyPoints

- Include the most important concepts expected in a good answer.
- Use short bullet-style statements.

hints

- Provide small hints only.
- Do not reveal the full answer.
- Help the candidate think.

evaluationCriteria

Evaluate answers based on:

- correctness
- clarity
- depth
- practical knowledge
- communication
- completeness

estimatedAnswerTimeSeconds

- Estimate how long a good candidate should need to answer the question in seconds.
- Crucially, calibrate this value based on the complexity, depth, and difficulty of the question.
- Harder or more complex questions (e.g., coding challenges, complex system design, or detailed behavioral scenarios) should have a longer estimated answering time (e.g., 180 to 300+ seconds), while simpler or more direct questions should have a shorter estimated answering time (e.g., 60 to 120 seconds).
- Ensure the questions generated are substantive and detailed enough to match the allotted time.


tags

Include 3–8 relevant tags.

Tags should represent:

- technologies
- concepts
- methodologies
- soft skills
- domain knowledge

Only use tags relevant to the question.
`;
