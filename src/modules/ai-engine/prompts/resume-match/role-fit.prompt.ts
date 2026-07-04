export const ROLE_FIT_PROMPT = `
Evaluate the alignment between the candidate's professional background/history and the target Job Title.

Rules for "roleFit":
1. "roleFit.targetRole":
   - MUST match the target Job Title provided in the input exactly. Do not abbreviate or modify it.
2. "roleFit.matchedRoles":
   - Analyze the candidate's work history, skills, and projects to identify matching roles.
   - List the candidate's actual roles/titles from their history, each with a confidence score (0–100) representing how closely their background in that specific role aligns with the target role.
   - If their history is in a completely different domain or seniority level, confidence score for that role must be low (e.g. 30-50).
   - Each entry in "matchedRoles" must match the structure: { "title": string, "confidence": number }.
3. "roleFit.alignmentScore":
   - Provide an integer score from 0-100 evaluating how strongly the candidate's background aligns specifically with the target Job Title.
   - Cap alignmentScore at a maximum of 30 if there is a major seniority mismatch (e.g. Intern or Junior candidate applying for a Senior, Lead, Manager, or Architect role).
   - Set alignmentScore between 0 and 20 if there is a domain/functional mismatch (e.g. Frontend developer applying for DevOps).
`;
