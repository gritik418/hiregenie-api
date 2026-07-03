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
