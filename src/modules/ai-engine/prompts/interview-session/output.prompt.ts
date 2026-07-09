export const OUTPUT_SYSTEM_PROMPT = `
Return ONLY valid JSON.

Do not return Markdown code fences (e.g. do not wrap the output in \`\`\`json).

Do not return explanations, notes, comments, or introductory text.

Do not include additional properties.

Every property is required.

The JSON must be directly parseable.

Return ONLY the JSON object.
`;
