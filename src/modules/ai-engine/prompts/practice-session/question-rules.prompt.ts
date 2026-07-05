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
- Crucially, calibrate this value based on the total "Estimated Duration" and "Question Count" provided:
  The sum of (estimatedAnswerTimeSeconds + 30 seconds break) for all questions must equal the total "Estimated Duration" in seconds.
  For example, if duration is 30 minutes (1800s) and Question Count is 6, then:
  Total break time = 6 * 30s = 180s.
  Remaining time for answers = 1800s - 180s = 1620s.
  Therefore, the average estimatedAnswerTimeSeconds per question should be 1620s / 6 = 270 seconds.
- You must distribute the answering time appropriately across the questions (e.g., harder questions might get more time, easier ones less), but the total sum of (estimatedAnswerTimeSeconds + 30) for all questions must align with the total "Estimated Duration".


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
