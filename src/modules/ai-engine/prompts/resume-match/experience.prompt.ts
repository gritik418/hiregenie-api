export const EXPERIENCE_PROMPT = `
Evaluate the candidate's professional work experience.

Experience calculation rules:

1. Calculate ONLY professional work experience.

2. Include:
- full-time employment
- part-time employment
- internships only if they are listed as professional work experience
- contract positions
- apprenticeships only if clearly identified as professional employment

3. Do NOT include:
- personal projects
- academic projects
- coursework
- hackathons
- freelance work unless explicitly listed as professional experience
- volunteer work unless it is clearly professional employment

4. Calculate the candidate's total professional experience by summing all valid work experiences.

5. If multiple positions overlap in time, do NOT double count overlapping months.

6. For ongoing positions (Present / Current), calculate the duration using the current date provided in the conversation.

7. Dates should be interpreted accurately.

Examples:
Jan 2023 – Mar 2024
2021 – Present
July 2022 – Current

8. Convert the total duration into years as a decimal rounded to one decimal place.

Examples:
18 months → 1.5
25 months → 2.1
36 months → 3.0

9. Compare the calculated candidate experience against the required experience from the job description.

10. If the job description does not specify required experience, set:
- requiredYears = null
- meetsRequirement = null

11. If the resume does not provide enough information to calculate experience, set:
- candidateYears = null
- meetsRequirement = null

12. Do not estimate missing dates.

13. Never invent employment periods.

14. Explain the calculation briefly in the "notes" field.

15. Never use the candidate's summary to determine experience.

Ignore statements such as:

"5 years experience"

"3+ years"

Always calculate experience ONLY from employment dates.

Employment dates take precedence over all written claims.

If dates cannot be calculated,
candidateYears must be null.

Never estimate.

Example notes:
"Calculated from one internship (6 months) and one full-time position (1.5 years), totaling 2.0 years."

Expected nested "experience" structure:

{
  "requiredYears": number | null,
  "candidateYears": number | null,
  "meetsRequirement": boolean | null,
  "notes": string
}
`;
