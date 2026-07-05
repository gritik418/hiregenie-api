export const VALIDATION_PROMPT = `
Before returning the final response, perform a complete validation.

Validate the response against the required JSON schema.

CHECKLIST

✓ Every required property exists.

✓ No required object is missing.

✓ No required array is missing.

✓ Arrays must be [] when empty.

✓ Objects must never be omitted.

✓ No prohibited root-level keys exist (such as "education", "roleFitMatchedRoles", "requiredYears", "candidateYears", "meetsRequirement", "notes").

✓ The properties "skills", "keywords", "responsibilities", "qualifications", and "certifications" MUST be objects containing {"matched": [...], "missing": [...]} (and "partial": [...] for skills). They must NEVER be arrays of strings at the root level.

✓ The property "roleFit" MUST be an object. The matching roles MUST be nested inside it as "roleFit.matchedRoles", and must NEVER be outputted as "roleFitMatchedRoles" at the root level.

✓ Every numeric score is between 0 and 100.

✓ Confidence scores are between 0 and 100.

✓ Overall matchScore is consistent with the breakdown.

✓ Strengths are supported by evidence.

✓ Gaps are supported by evidence.

✓ Suggestions address identified gaps.

✓ Learning recommendations are supported by missing skills or technologies.

✓ No contradictions exist.

✓ No hallucinated information exists (except for "recommendedLearning", "certifications.missing", "skills.missing", "qualifications.missing", and "keywords.missing" where you should use industry expectations for the target Job Title).

✓ No inferred certifications exist (except under "certifications.missing" where you should list standard certifications matching the target Job Title if they are not on the resume).

✓ No inferred qualifications exist (except under "qualifications.missing" where you should list standard/preferred qualifications/degrees matching the target Job Title that are not explicitly on the resume, even if they have other relevant degrees).

✓ No inferred responsibilities exist (except under "responsibilities.missing" where you should suggest common responsibilities for the target Job Title that the candidate lacks on their resume).

✓ No inferred skills exist (except under "recommendedLearning", "skills.missing", and "keywords.missing" where you should suggest skills/keywords matching the target Job Title).

✓ STRICT CHECK: The "skills.matched" array MUST ONLY contain skills/tools that are explicitly written inside the "Resume:" text block. You MUST NOT copy skills directly from the job description if they are absent on the resume. Every matched skill must be case-insensitively found in the resume.

✓ STRICT CHECK: The "keywords.matched" array MUST ONLY contain keywords that are explicitly written inside the "Resume:" text block. You MUST NOT copy keywords directly from the job description if they are absent on the resume. Every matched keyword must be case-insensitively found in the resume.

✓ STRICT CHECK: Every single keyword in "keywords.matched" MUST exist in "skills.matched". If a keyword, tool, or technology exists in "skills.missing" or "skills.partial", it is strictly forbidden from "keywords.matched" and MUST be in "keywords.missing".

✓ STRICT CHECK: If a skill/tool/technology (e.g. AWS, Kubernetes, Terraform, Prometheus, Grafana, Jenkins, Nginx, Linux, Ansible, Kafka, Redis, Helm, etc.) is mentioned in the job description or expected for the target Job Title, but NOT explicitly written on the candidate's resume, you MUST put it in "skills.missing" and "keywords.missing". It is STRICTLY FORBIDDEN to list it as matched in "skills.matched" or "keywords.matched".

✓ STRICT CHECK: "keywords.missing" and "keywords.matched" MUST only contain short term or tool names (1-3 words). They must NEVER contain long sentences, responsibilities, or duties.

✓ STRICT CHECK: Validate overall matchScore against the capping rules:
  * If candidateYears < 0.5 * requiredYears, overall matchScore MUST NOT exceed 40.
  * If candidateYears < 0.2 * requiredYears, overall matchScore MUST NOT exceed 25.
  * If roleFit.alignmentScore < 50, overall matchScore MUST NOT exceed 45.
  * If both alignment and experience mismatches exist, overall matchScore MUST NOT exceed 25.
  * IMPORTANT: If multiple caps apply, the lowest/strictest cap takes absolute precedence.

✓ STRICT CHECK: The "reason" field MUST NOT be empty. It MUST contain a detailed candidate-facing explanation of the compatibility, fit level, and match score, and explicitly describe the experience comparison (candidateYears vs requiredYears).

✓ STRICT CHECK: The "feedback" object MUST contain non-empty values for ALL nested fields: "summary" (string), "highlights" (array of strings), and "concerns" (array of strings). Do NOT leave any of these fields empty or omit them.

If any required field is missing, regenerate the entire response before returning it.

Never return placeholder values.

Examples of INVALID values:
- "required skills"
- "required certifications"
- "N/A"
- "None"
- "Unknown"
- "Not specified"
- "null" (as a string)

Instead, conform to the following fallback rules precisely:
- Use [] (empty array) for missing/empty arrays of strings or objects.
- Use null ONLY where explicitly allowed (i.e., experience.requiredYears, experience.candidateYears, meetsRequirement, roleFit.targetRole).
- Use 0 for numeric fields where no data is available.
- Use "" (empty string) for non-nullable string fields where no data is available.

The response must be valid JSON that exactly matches the required schema.
`;
