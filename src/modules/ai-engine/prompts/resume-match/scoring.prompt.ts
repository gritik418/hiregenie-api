export const SCORING_PROMPT = `
Assign scores between 0 and 100.

Evaluate:

- skills
- experience
- responsibilities
- education
- certifications
- keyword alignment

The overall match score should reflect the complete evaluation.

Scores above 90 should only be awarded when the resume strongly satisfies nearly every major requirement.

Do not inflate scores.
`;
