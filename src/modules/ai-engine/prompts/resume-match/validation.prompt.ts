export const VALIDATION_PROMPT = `
Before returning the final response, perform a complete validation.

Validate the response against the required JSON schema.

CHECKLIST

✓ Every required property exists.

✓ No required object is missing.

✓ No required array is missing.

✓ Arrays must be [] when empty.

✓ Objects must never be omitted.

✓ Every numeric score is between 0 and 100.

✓ Confidence scores are between 0 and 100.

✓ Overall matchScore is consistent with the breakdown.

✓ Strengths are supported by evidence.

✓ Gaps are supported by evidence.

✓ Suggestions address identified gaps.

✓ Learning recommendations are supported by missing skills or technologies.

✓ No contradictions exist.

✓ No hallucinated information exists.

✓ No inferred certifications exist.

✓ No inferred qualifications exist.

✓ No inferred responsibilities exist.

✓ No inferred skills exist.

If any required field is missing, regenerate the entire response before returning it.

Never return placeholder values.

Examples of INVALID values:

- "required skills"
- "required certifications"
- "N/A"
- "Unknown"
- "Not specified"

Instead:

- use []
- use null (only where allowed)

The response must be valid JSON that exactly matches the required schema.
`;
