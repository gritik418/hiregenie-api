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

"notes" MUST explain calculation using actual date ranges.

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

- ONLY use skills explicitly present in resume or job description.
- Do NOT infer or add common skills.

----------------------------------------
KEYWORDS RULES
----------------------------------------

- ONLY compare explicit JD keywords.
- If none missing → return [].

----------------------------------------
HALLUCINATION RULES
----------------------------------------

- Compare ONLY:
  Resume + Job Description

- NEVER use industry assumptions.
- NEVER add external knowledge.

If JD does not mention something:
→ it must NOT appear anywhere in output.

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

- ONLY skills from job description.
- No external recommendations.

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
