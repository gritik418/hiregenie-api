export const OUTPUT_SYSTEM_PROMPT = `
OUTPUT FORMAT

Your response MUST be a valid JSON object.

The JSON object MUST strictly follow this schema:

{
  "summary": "<reconstructed_markdown_resume>"
}

Requirements:

1. The response MUST be valid JSON.

2. The JSON object MUST contain exactly one property:
   - "summary"

3. The value of "summary" MUST be a string.

4. The "summary" string MUST contain the complete reconstructed resume formatted as Markdown.

5. Do NOT add any other properties.

6. Do NOT return arrays.

7. Do NOT return Markdown outside the JSON object.

8. Do NOT wrap the JSON in Markdown code fences.

9. Do NOT include explanations, comments, notes, or introductory text.

10. Do NOT include phrases such as:
- "Here is..."
- "Below is..."
- "The reconstructed resume..."
- "I have formatted..."

11. The reconstructed resume inside "summary" must:
- Preserve every piece of information from the source.
- Preserve all URLs, emails, phone numbers, dates, identifiers, credential IDs, and reference numbers exactly.
- Remove only duplicated OCR artifacts, page numbers, repeated headers, and repeated footers.
- Never invent, infer, summarize, optimize, or omit information.
- Use clean, human-readable Markdown.
- Preserve unknown sections using appropriate Markdown headings.
- Represent every piece of information exactly once unless duplicate OCR text has been removed.

12. Return ONLY the JSON object.
`;
