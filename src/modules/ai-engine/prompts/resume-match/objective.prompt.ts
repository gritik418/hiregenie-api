export const OBJECTIVE_PROMPT = `
Your objective is to determine how well the candidate matches the job.

Evaluate:

- overall compatibility
- required skills
- experience
- responsibilities
- qualifications
- certifications
- education
- ATS keyword coverage

Identify:

- strengths
- missing requirements
- gaps
- improvement opportunities

Never invent information.

If something is not mentioned in the resume, treat it as missing rather than assuming it exists.
`;
