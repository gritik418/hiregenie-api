export const OUTPUT_PROMPT = `
OUTPUT REQUIREMENTS

Return ONLY a valid JSON object.

The response MUST exactly match the schema below.

SCHEMA

{
  "matchScore": number,
  "fitLevel": "VERY_LOW" | "LOW" | "MODERATE" | "HIGH" | "EXCELLENT",

  "breakdown": {
    "skills": number,
    "experience": number,
    "responsibilities": number,
    "education": number,
    "certifications": number,
    "keywords": number
  },

  "skills": {
    "matched": [string],
    "partial": [string],
    "missing": [string]
  },

  "keywords": {
    "matched": [string],
    "missing": [string]
  },

  "responsibilities": {
    "matched": [string],
    "missing": [string]
  },

  "qualifications": {
    "matched": [string],
    "missing": [string]
  },

  "certifications": {
    "matched": [string],
    "missing": [string]
  },

  "experience": {
    "requiredYears": number | null,
    "candidateYears": number | null,
    "meetsRequirement": boolean | null,
    "notes": string
  },

  "roleFit": {
    "targetRole": string | null,
    "matchedRoles": [
      {
        "title": string,
        "confidence": number
      }
    ],
    "alignmentScore": number
  },

  "strengths": [string],
  "gaps": [string],
  "suggestions": [string],
  "recommendedLearning": [string],

  "priorityActions": [
    {
      "title": string,
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "reason": string
    }
  ],

  "summary": string,
  "reason": string,

  "feedback": {
    "summary": string,
    "highlights": [string],
    "concerns": [string]
  }
}

----------------------------------------
GENERAL RULES
----------------------------------------

1. Return ONLY valid JSON.
2. Do NOT return Markdown, code fences, or explanations.
3. Do NOT add extra fields.
4. Every property in schema is REQUIRED.
5. Arrays must NEVER be null (use [] if empty).
6. Objects must NEVER be null.
7. Use null ONLY where explicitly allowed.
8. All scores must be integers (0–100).
9. Confidence must be integers (0–100).
10. Never hallucinate or infer missing data.
11. Use ONLY resume + job description.

----------------------------------------
RULES FOR MISSING / INSUFFICIENT / NOT APPLICABLE INFORMATION (PATH-SPECIFIC)
----------------------------------------

If a piece of information is missing, not provided, or cannot be determined from the resume or job description, you MUST use the following fallback values. Do NOT omit the key, do NOT return undefined, do NOT return "null" as a string, and do NOT return placeholder strings like "N/A", "None", "Unknown", or "Not Specified".

You MUST strictly conform to the types and fallback structures mapped below:

1. Root-level metrics:
   - "matchScore": integer (0–100), fallback: 0
   - "fitLevel": "VERY_LOW" | "LOW" | "MODERATE" | "HIGH" | "EXCELLENT", fallback: "VERY_LOW"

2. "breakdown" object:
   - "breakdown.skills": integer, fallback: 0
   - "breakdown.experience": integer, fallback: 0
   - "breakdown.responsibilities": integer, fallback: 0
   - "breakdown.education": integer, fallback: 0
   - "breakdown.certifications": integer, fallback: 0
   - "breakdown.keywords": integer, fallback: 0

3. "skills" object (must NOT be an array):
   - "skills.matched": array of strings, fallback: []
   - "skills.partial": array of strings, fallback: []
   - "skills.missing": array of strings, fallback: []

4. "keywords" object (must NOT be an array):
   - "keywords.matched": array of strings, fallback: []
   - "keywords.missing": array of strings, fallback: []

5. "responsibilities" object (must NOT be an array):
   - "responsibilities.matched": array of strings, fallback: []
   - "responsibilities.missing": array of strings, fallback: []

6. "qualifications" object (must NOT be an array):
   - "qualifications.matched": array of strings, fallback: []
   - "qualifications.missing": array of strings, fallback: []

7. "certifications" object (must NOT be an array):
   - "certifications.matched": array of strings, fallback: []
   - "certifications.missing": array of strings, fallback: []

8. "experience" object:
   - "experience.requiredYears": number | null, fallback: null
   - "experience.candidateYears": number | null, fallback: null
   - "experience.meetsRequirement": boolean | null, fallback: null
   - "experience.notes": string, fallback: ""

9. "roleFit" object:
   - "roleFit.targetRole": string | null, MUST match the provided "Job Title" from the input (never null if a Job Title is provided)
   - "roleFit.matchedRoles": array of objects, fallback: []. These must be roles/titles from the candidate's history that are relevant to or align with the target Job Title. Each item must be: { "title": string, "confidence": number }
   - "roleFit.alignmentScore": integer, representing the overall alignment of the candidate's background to the target Job Title (0–100)

10. Flat Arrays:
    - "strengths": array of strings, fallback: []
    - "gaps": array of strings, fallback: []
    - "suggestions": array of strings, fallback: []
    - "recommendedLearning": array of strings, fallback: []

11. "priorityActions":
    - array of objects, fallback: [] (e.g. []). If populated, each item must be: { "title": string, "priority": "HIGH" | "MEDIUM" | "LOW", "reason": string }

12. Flat Strings:
    - "summary": string, fallback: ""
    - "reason": string, fallback: ""

13. "feedback" object:
    - "feedback.summary": string, fallback: ""
    - "feedback.highlights": array of strings, fallback: []
    - "feedback.concerns": array of strings, fallback: []

----------------------------------------
PROHIBITED ROOT-LEVEL KEYS
----------------------------------------

You MUST NEVER output the following keys at the root level of the JSON response under any circumstances. If they are included, they will cause critical schema errors:

- "education" is PROHIBITED at root level (must ONLY exist nested as "breakdown.education" as a number).
- "roleFitMatchedRoles" is PROHIBITED at root level (must ONLY exist nested inside "roleFit" as "roleFit.matchedRoles").
- "requiredYears", "candidateYears", "meetsRequirement", "notes" are PROHIBITED at root level (must ONLY exist nested inside "experience" object).
- "matched", "missing", "partial" are PROHIBITED at root level (must ONLY exist nested inside their respective parent objects like "skills", "keywords", "responsibilities", "qualifications", "certifications").

----------------------------------------
SCHEMA STRICTNESS
----------------------------------------

- Property names MUST match EXACTLY.
- Case-sensitive matching is required.
- Do NOT rename fields.

INVALID:
{ action: "...", role: "...", score: 90 }

VALID:
{ title: "...", confidence: 90 }

----------------------------------------
MATCHED ROLES RULES
----------------------------------------

- MUST be array of objects.
- Each item MUST be:
  {
    title: string,
    confidence: number
  }

----------------------------------------
PRIORITY ACTIONS RULES
----------------------------------------

- MUST be array of objects:
  {
    title: string,
    priority: "HIGH" | "MEDIUM" | "LOW",
    reason: string
  }

- NEVER use:
  action, name, label

----------------------------------------
EXPERIENCE RULES
----------------------------------------

- Calculate candidateYears ONLY from employment dates.
- NEVER use summary statements like "5 years experience".
- Include ONLY professional experience.
- EXCLUDE:
  - projects
  - education
  - coursework
  - freelance (unless clearly professional employment)
- Do NOT double count overlapping roles.
- Use provided Current Date for ongoing roles.
- Round to 1 decimal place.

If requiredYears is null:
- meetsRequirement MUST be null

If experience cannot be calculated:
- candidateYears = null

- "notes" MUST explain calculation using actual date ranges.
- Experience score (breakdown.experience) and overall matchScore MUST be strictly penalized/capped if candidateYears < requiredYears:
  * If candidateYears < 0.5 * requiredYears, experience score MUST NOT exceed 30, and overall matchScore MUST be capped at a maximum of 40 (fitLevel = LOW).
  * If candidateYears < 0.2 * requiredYears (e.g. 0.5 years vs 6 years required), experience score MUST NOT exceed 10, and overall matchScore MUST be capped at a maximum of 25 (fitLevel = VERY_LOW).
  * If roleFit.alignmentScore < 50, overall matchScore MUST be capped at a maximum of 45 (fitLevel = LOW).
  * If both, overall matchScore MUST NOT exceed 25 (fitLevel = VERY_LOW).

----------------------------------------
RESPONSIBILITIES RULES
----------------------------------------

- Only job duties.
- NEVER include technologies.

INVALID:
AWS, React, Docker

VALID:
Build APIs, Deploy services, Manage team

----------------------------------------
SKILLS RULES
----------------------------------------

- "skills.matched": Skills from the resume that match the job description or the target Job Title. A skill can ONLY be in "skills.matched" if it is explicitly written on the candidate's resume.
- "skills.missing": Skills, frameworks, tools, or methodologies expected or preferred for the target Job Title that the candidate lacks on their resume. Even if the candidate has a highly complete skill set matching the job description, you MUST still identify and suggest at least 1-3 advanced skills, libraries, tools, or methodologies (e.g., Kubernetes, Microservices, System Design, GraphQL, AWS/GCP/Azure cloud services, CI/CD pipelines, unit testing frameworks) relevant to the target Job Title that are absent from their resume. The "skills.missing" array MUST NEVER be empty if there are any standard or advanced industry technologies for the target Job Title that the candidate lacks.
- "skills.partial": Skills from the resume that are closely related/similar to the requirements (e.g., Express.js if NestJS is required) or where the candidate has only brief exposure/basic academic knowledge but lacks professional experience.
- Core frameworks/technologies for specific roles (e.g., Django and FastAPI for a Python Developer or Python-related role) MUST NOT be classified as "partial". They can only be classified as "matched" (if explicitly present on the resume) or "missing" (if absent).

----------------------------------------
KEYWORDS RULES
----------------------------------------

- "keywords.matched": Important keywords/skills from the resume that match the job description or are relevant to the target "Job Title". A keyword can ONLY be in "keywords.matched" if it is explicitly written on the candidate's resume.
- "keywords.missing": Important keywords/skills expected for the target "Job Title" or required by the job description that are missing from the resume. You MUST proactively try to identify and suggest at least 1-3 missing keywords based on the target Job Title if they are absent from the resume. Even if the candidate's resume has many matching keywords, you should still suggest additional standard, preferred, or advanced industry keywords (such as "System Architecture", "Microservices", "Design Patterns", "Scalability", "Agile", or specific tools) that are missing. The "keywords.missing" array MUST NOT be empty if there are any standard, preferred, or advanced industry terms for the target Job Title that the candidate lacks.

----------------------------------------
QUALIFICATIONS RULES
----------------------------------------

- "qualifications.matched": Educational qualifications, degrees (e.g. Bachelor's, Master's, PhD in relevant fields), or academic milestones explicitly present on the resume that match the job description or target Job Title requirements.
- "qualifications.missing": Standard/preferred academic qualifications or degrees (e.g., B.Tech/BS in Computer Science, MCA, Master's in IT, or specific professional certifications/diplomas) expected or preferred for the target Job Title that the candidate lacks on their resume. Even if the candidate already has a relevant degree (like BCA), you should still suggest alternative/higher-level preferred qualifications (such as B.Tech/BS in Computer Science or Master of Computer Applications (MCA)) that are missing from their resume. You MUST proactively try to identify and suggest at least 1-3 missing qualifications/degrees based on the target Job Title if they are not explicitly present. The "qualifications.missing" array MUST NOT be empty if there are standard/preferred/higher-level academic or professional qualifications in the industry for the role.

----------------------------------------
HALLUCINATION RULES
----------------------------------------

- Compare core candidate profile (skills, experience, responsibilities) strictly against the provided Resume, Job Title, and Job Description.
- EXCEPTIONS: For "recommendedLearning", "certifications.missing", "qualifications.missing", "skills.missing", and "keywords.missing", you SHOULD use external industry-standard knowledge matching the target "Job Title". If the job description does not mention specific items, suggest standard ones expected or preferred for that role (e.g. PCAP/PCEP for Python Developer, B.Tech/MCA for Software Engineers).

----------------------------------------
SUGGESTIONS RULES
----------------------------------------

- Must directly map to a real gap.
- No generic advice.

INVALID:
"Improve resume"

VALID:
"Add AWS deployment experience"

If no gaps → []

----------------------------------------
RECOMMENDED LEARNING RULES
----------------------------------------

- Recommend 2-4 concrete skills, technologies, frameworks, or tools that the candidate should learn to align with the target "Job Title".
- Do not limit recommendations strictly to the job description; use industry-standard expectations for the target role (e.g. recommend Django/FastAPI, microservices, or testing frameworks for a Python Developer if they are missing or weak on the resume).

----------------------------------------
REASON RULES
----------------------------------------

- "reason": A brief explanation of the overall compatibility, fit level, and match score. It MUST explicitly detail the comparison between the candidate's calculated experience years and the required experience years (e.g., candidate has X years of experience, which does/does not meet the required Y years).

----------------------------------------
FINAL VALIDATION (MANDATORY)
----------------------------------------

Before returning response verify:

✓ JSON is valid
✓ No missing required fields
✓ No extra fields exist
✓ matchedRoles are objects
✓ priorityActions are objects
✓ experience is calculated from dates
✓ responsibilities contain NO technologies
✓ no hallucinated skills or certifications
✓ all arrays exist (never null)
✓ schema matches exactly

If ANY rule fails:
REGENERATE FULL RESPONSE

----------------------------------------

Return ONLY the JSON object.
`;
