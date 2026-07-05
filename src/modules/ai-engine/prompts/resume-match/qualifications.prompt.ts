export const QUALIFICATIONS_PROMPT = `
Evaluate the candidate's educational qualifications, degrees, and academic backgrounds.

Rules for "qualifications":
1. "qualifications.matched":
   - Include educational qualifications or degrees explicitly present on the candidate's resume (e.g. "Degree B").
2. "qualifications.missing":
   - List standard or preferred qualifications, degrees, or fields of study expected/required by the job description or target Job Title that the candidate lacks on their resume.
   - You MUST identify and suggest at least 4-5 missing or preferred qualification options for the target role. E.g.:
     * "DegreeA: Bachelor's degree in primary field"
     * "DegreeB: Master's degree in related specialization"
     * "DegreeC: Specific technical diploma or advanced coursework"
     * "DegreeD: Associate degree in secondary field"
`;
