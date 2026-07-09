export const CONVERSATION_OUTPUT_SCHEMA_SYSTEM_PROMPT = `
Return a JSON object matching this schema exactly:

{
  "message": string (your response to the candidate's answer and/or the next question)
}
`;
