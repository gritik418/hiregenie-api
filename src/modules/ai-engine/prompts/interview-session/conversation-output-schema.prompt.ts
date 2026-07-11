export const CONVERSATION_OUTPUT_SCHEMA_SYSTEM_PROMPT = `
Return a JSON object matching this schema exactly:

{
  "message": string (your response. If isLastMessage is true, this MUST be a final goodbye),
  "isLastMessage": boolean (false for normal responses/warnings, true ONLY for the final goodbye message)
}
`;
