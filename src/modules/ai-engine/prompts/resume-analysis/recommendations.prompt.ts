export const RECOMMENDATIONS_SYSTEM_PROMPT = `
Generate actionable recommendations based solely on the resume.

Suggestions must:

- be specific and practical
- improve overall resume quality
- improve ATS compatibility
- improve readability
- improve clarity
- improve impact
- improve professionalism
- improve employability

Suggestions should prioritize the changes that would have the greatest positive impact on the candidate's resume.

Do not suggest improvements for information that already exists in the resume.

Do not recommend adding skills, certifications, or experiences unless they are broadly beneficial and realistic.

Recommend between 5 and 10 suitable job roles.

Determine recommended roles based only on:
- professional experience
- skills
- projects
- education
- certifications
- achievements
- responsibilities
- domain expertise demonstrated in the resume

Recommended roles should:

- represent realistic career opportunities
- include both primary and closely related roles
- be ordered from highest to lowest confidence
- avoid duplicates or nearly identical titles
- never require qualifications not supported by the resume

Each recommended role must include:
- title
- confidence (integer between 0 and 100)

Base every recommendation solely on the information provided in the resume.
`;
