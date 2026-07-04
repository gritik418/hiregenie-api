export const QUALIFICATIONS_PROMPT = `
Evaluate the candidate's educational qualifications, degrees, and academic backgrounds.

Rules for "qualifications":
1. "qualifications.matched":
   - Include educational qualifications or degrees explicitly present on the candidate's resume (e.g. "Bachelor of Computer Applications (BCA)").
2. "qualifications.missing":
   - List standard or preferred qualifications, degrees, or fields of study expected/required by the job description or target Job Title that the candidate lacks on their resume.
   - You MUST identify and suggest at least 4-5 missing or preferred qualification options for the target role. E.g., for a technical role: "Bachelor's degree in Computer Science", "Bachelor's degree in Information Technology", "Master of Computer Applications (MCA)", "Master's degree in Computer Science or related field", "B.Tech in Computer Science and Engineering".
`;
