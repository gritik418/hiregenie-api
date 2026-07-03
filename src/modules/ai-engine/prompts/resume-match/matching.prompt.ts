export const MATCHING_PROMPT = `
Compare the resume against the job description.

Only compare information that is explicitly stated.

Do not infer missing information.

Do not assume technologies.

Do not invent certifications (except under "certifications.missing" where you should recommend industry-standard certifications matching the target Job Title if they are missing from the resume).

Do not invent qualifications (except under "qualifications.missing" where you should list standard/preferred qualifications/degrees matching the target Job Title that are not explicitly on the resume, even if the candidate already has a relevant degree).

Do not invent responsibilities (except under "responsibilities.missing" where you should suggest common responsibilities for the target Job Title that the candidate lacks on their resume).

Rules

Matched

Include items clearly present in the resume that match the job description or target Job Title requirements.

Missing

Include items that are:
- explicitly required by the job description (or are standard expectations for the target Job Title if the job description is brief or missing)
- absent from the resume
- You MUST proactively try to identify and suggest at least 1-3 missing items for each missing category (skills, keywords, certifications, qualifications, responsibilities) based on the target Job Title if they are not explicitly present on the resume. Even if a category has partial or matched items (e.g., if the candidate already has a BCA degree, or some skills/keywords), you should still suggest additional standard/preferred items for that category that are absent from the resume. Do not return empty arrays [] for missing categories if there are standard industry requirements/options for the role.

Partial

Include closely related skills, or skills where the candidate has only basic academic knowledge/limited exposure but lacks professional experience.
- Note: Core frameworks/technologies for specific roles (e.g. Django and FastAPI for a Python Developer or Python-related role) MUST NOT be classified as "partial". They can only be classified as "matched" (if explicitly present on the resume) or "missing" (if absent).

Example

Job:
NestJS

Resume:
Express.js

→ Partial

Example

Job:
AWS

Resume:
Docker

→ Missing

Never use generic placeholders.

INVALID

[
"required skills"
]

[
"required certifications"
]

[
"missing technologies"
]

VALID

[
"AWS",
"Docker Compose",
"Kubernetes"
]

If no missing items exist, return an empty array.

Suggest missing keywords based on industry expectations for the target Job Title if they are absent from the resume.

----------------------------------------
ROLE FIT & JOB TITLE RULES
----------------------------------------

1. "roleFit.targetRole" represents the "Job Title" provided in the input. If a Job Title is provided, "roleFit.targetRole" MUST match it exactly (e.g. "Python Developer"). It should only be null if no Job Title is provided.

2. "roleFit.matchedRoles" is an array of roles/titles from the candidate's resume or work history that are relevant to or align with the target Job Title.
   - Analyze the candidate's work history, skills, and projects to identify matching roles.
   - Provide a list of these roles with a confidence score (0–100) representing how closely their background fits each role.
   - Do not return an empty array if the candidate has relevant work history.

3. "roleFit.alignmentScore" represents how well the candidate's background matches the target Job Title.
   - 0: No alignment or completely unrelated background.
   - 100: Perfect alignment (e.g., candidate has worked in this exact role with all required skills).
`;
