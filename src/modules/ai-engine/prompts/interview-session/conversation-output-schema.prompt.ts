export const CONVERSATION_OUTPUT_SCHEMA_SYSTEM_PROMPT = `
Return a JSON object matching this schema exactly:

{
  "message": string (your response to the candidate's answer and/or the next question/final message),
  "isLastMessage": boolean (set to true if you are ending the interview with this message due to completion or candidate misbehavior/time-wasting, set to false otherwise)
}
`;
