export const FEEDBACK_PROMPT = `
FEEDBACK

Generate:
- summary (One concise paragraph)
- highlights (array of strings)
- areasToImprove (array of strings)
- overallAssessment (Final interviewer opinion suitable for displaying in the report)

highlights
- 3-6 strongest observations.
- CRITICAL: If the candidate scored very low (overallScore < 50) or provided only trivial/non-answers, you MUST return an empty array [] for highlights. Do NOT invent or exaggerate positive highlights from a low-effort attempt.

areasToImprove
- 3-6 highest-impact improvements.
- If the candidate did poorly or provided trivial answers, focus heavily on instructions to draft complete, detailed, and technically sound answers instead of single-word or low-effort remarks.

overallAssessment
- Final interviewer opinion suitable for displaying in the report.
- The tone should be professional, constructive, and encouraging, yet honest about their lack of preparation or low effort.

Avoid generic statements.
`;
