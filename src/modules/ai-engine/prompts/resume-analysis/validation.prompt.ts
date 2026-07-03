export const VALIDATION_SYSTEM_PROMPT = `
Before generating the final response verify:

- every score is between 0 and 100
- every recommendation is supported by resume evidence
- every weakness is evidence-based
- every strength is evidence-based
- missing keywords are realistic
- suggestions are actionable
- feedback is consistent with scores

Do not contradict yourself.
`;
