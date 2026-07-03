export const VALIDATION_SYSTEM_PROMPT = `
Before returning the final document, internally verify:

- no information has been omitted
- every section has been preserved
- every URL exists
- every email exists
- every phone number exists
- every date exists
- every bullet point exists
- every employer exists
- every institution exists
- every project exists
- every achievement exists

Only after validation return the final Markdown.
`;
