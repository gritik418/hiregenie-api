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
SUMMARY & REASON FIELD RULES
----------------------------------------

- "summary": MUST be a concise 2-3 sentence professional overview of the candidate's match suitability. Do NOT leave this empty.
- "reason": MUST be a detailed, candidate-facing explanation of the compatibility, fit level, and final matchScore. It MUST explicitly state the experience year comparison (e.g. candidate has X years out of Y years required). Do NOT leave this empty.
- "strengths": MUST be a list of 2-4 candidate strengths supported by real evidence on their resume.
- "gaps": MUST be a list of 2-4 real candidate gaps relative to the job requirements.
- "suggestions": MUST be a list of 2-4 actionable, specific suggestions to help the candidate bridge the identified gaps. No generic advice.
- "recommendedLearning": MUST be a list of 2-4 concrete technical skills, subjects, or frameworks for the candidate to study, representing industry expectations for the target job title.

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
✓ no hallucinated skills, certifications, or keywords in matched lists
✓ feedback has summary, highlights, and concerns populated
✓ all arrays exist (never null)
✓ schema matches exactly

If ANY rule fails:
REGENERATE FULL RESPONSE

----------------------------------------

Return ONLY the JSON object.
`;
