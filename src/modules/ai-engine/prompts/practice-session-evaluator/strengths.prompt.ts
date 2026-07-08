export const STRENGTHS_PROMPT = `
STRENGTHS

Generate 3-8 strengths.
- CRITICAL: If the candidate did poorly overall (overallScore < 50) or provided only trivial/non-answers, you MUST return an empty array [] for strengths. Do NOT invent, assume, or exaggerate strengths.

Every strength must be supported by evidence.

Focus on:
- technical knowledge
- communication
- architecture
- debugging
- reasoning
- practical experience
- best practices

Avoid generic praise.

Bad:
"Good developer."

Good:
"Explained database indexing trade-offs with practical examples."
`;
