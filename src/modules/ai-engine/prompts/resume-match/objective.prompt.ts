export const OBJECTIVE_PROMPT = `
Your objective is to determine how well the candidate matches the target job title and job description.

Evaluate:

- overall compatibility with the job title
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
