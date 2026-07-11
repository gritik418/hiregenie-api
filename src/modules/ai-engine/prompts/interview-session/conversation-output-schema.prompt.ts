export const CONVERSATION_OUTPUT_SCHEMA_SYSTEM_PROMPT = `
Return a JSON object matching this schema exactly:

{
  "message": string (your response to the candidate's answer and/or the next question. If isLastMessage is true, this MUST be a final goodbye or termination message, and must NOT ask any further questions or issue warnings),
  "isLastMessage": boolean (set to true ONLY if you are ending the interview with this message due to completion or candidate misbehavior/time-wasting. For warnings, set to false)
}
`;
