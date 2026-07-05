export const SCORING_PROMPT = `
Assign scores between 0 and 100.

You MUST follow these strict rules to evaluate match scores:

----------------------------------------
SCORING BREAKDOWN RULES (0-100 each)
----------------------------------------

1. Skills Score:
   - Calculate as: (Number of Matched Skills / Total Required/Expected Skills in Job Description) * 100.
   - You MUST NOT count a skill as matched if it is absent from the resume.
   - If the candidate lacks core/critical skills required for the role, the skills score MUST be below 40.

2. Experience Score:
   - Compare the candidate's professional experience (candidateYears) against the required experience (requiredYears) or standard expectations for the target Job Title.
   - If candidateYears >= requiredYears, the experience score can be 90-100.
   - If candidateYears < requiredYears, you MUST scale it down strictly:
     * If candidate's experience is less than 50% of the required experience, the experience score MUST NOT exceed 30.
     * If candidate's experience is less than 20% of the required experience (e.g. 0.5 years for a 6-year role), the experience score MUST NOT exceed 10.
   - If requiredYears is not specified but the Job Title has seniority indicators:
     * "Senior", "Lead", "Manager", "Architect", or "Principal" roles require at least 5-8 years of experience. If the candidate has < 3 years, the experience score MUST NOT exceed 30. If the candidate has < 1 year, the experience score MUST NOT exceed 10.

3. Responsibilities Score:
   - Compare the candidate's responsibilities on their resume against the required/expected duties of the role.
   - If the candidate has never performed the primary responsibilities of the role (e.g., their background is in a completely different functional domain and they lack the core required duties of the target role), the responsibilities score MUST be below 20.

4. Education Score:
   - 90-100: If the candidate has the exact degree required/preferred (e.g., Degree A).
   - 60-80: If the candidate has a related degree (e.g., Degree B, Degree C) but not the exact degree.
   - 0-30: If the candidate has an unrelated degree or no degree.

5. Certifications Score:
   - 100: If no certifications are required or preferred in the Job Description, and none are standard/expected for the role.
   - 80-100: If the candidate has the required/preferred certifications.
   - 0: If the job description or target Job Title specifies or strongly prefers certifications (e.g. Certification A, Certification B) and the candidate has NONE of them.

6. Keyword Alignment Score:
   - Calculate as: (Number of Matched Keywords / (Number of Matched Keywords + Number of Missing Keywords)) * 100.

----------------------------------------
OVERALL MATCH SCORE & FIT LEVEL RULES
----------------------------------------

The overall matchScore represents a candidate's actual suitability and is calculated using a weighted combination:
Weighted Score = Skills (30%) + Experience (30%) + Responsibilities (20%) + Keywords (10%) + Education (5%) + Certifications (5%).

However, you MUST apply the following CRITICAL CAPS to the overall matchScore (violating this is a failure):
- If candidateYears is less than 50% of the requiredYears (or if there is a severe experience mismatch for senior roles), the overall matchScore MUST be capped at a maximum of 40 (LOW fit).
- If candidateYears is less than 20% of the requiredYears (e.g., 0.5 years for 6 years required), the overall matchScore MUST be capped at a maximum of 25 (VERY_LOW fit).
- If the role alignment score is less than 50 (due to different domain or seniority mismatches), the overall matchScore MUST be capped at a maximum of 45 (LOW fit).
- If there is a complete mismatch in both role/domain and experience (e.g., a junior/intern candidate applying for a senior role in a completely different functional domain), the overall matchScore MUST NOT exceed 25 (VERY_LOW fit) and the fitLevel MUST be "VERY_LOW".
- **CRITICAL CAP PRECEDENCE**: If multiple score caps apply to the candidate, the strictly LOWEST/STRICTEST cap MUST be applied. For example, if both the 45 alignment cap and the 25 experience cap apply, you MUST cap the overall matchScore at 25.

----------------------------------------
FIT LEVEL MAPPING
----------------------------------------
Match overall fitLevel based on the final matchScore:
- VERY_LOW: matchScore < 30
- LOW: matchScore 30-49
- MODERATE: matchScore 50-74
- HIGH: matchScore 75-89
- EXCELLENT: matchScore >= 90

Do not inflate scores under any circumstances.
`;
