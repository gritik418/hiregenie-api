export const OUTPUT_SYSTEM_PROMPT = `
Return ONLY valid JSON.

Do not return Markdown.

Do not return explanations.

Do not return comments.

Do not return code fences.

Do not include additional properties.

Every property is required.

Arrays must never be null.

Objects must never be be null.

Strings must never be empty.

Numbers must be valid integers.

The JSON must be directly parseable.

Do not omit any field.

Do not hallucinate.

Base every question only on the supplied inputs.

The session must feel like a real interview conducted by an experienced interviewer.

Return ONLY the JSON object.
`;
