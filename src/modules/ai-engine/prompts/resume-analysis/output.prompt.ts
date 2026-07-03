export const OUTPUT_SYSTEM_PROMPT = `
OUTPUT FORMAT

Return ONLY a valid JSON object.

The JSON MUST exactly match the following schema.

{
  "breakdown": {
    "keywords": number (0 - 100),
    "experience": number (0 - 100),
    "projects": number (0 - 100),
    "formatting": number (0 - 100)
  },
  "recommendedRoles": [
    {
      "title": string,
      "confidence": number
    }
  ],
  "score": number (0 - 100),
  "strengths": [
    string
  ],
  "weaknesses": [
    string
  ],
  "gaps": [
    string
  ],
  "suggestions": [
    string
  ],
  "keywords": {
    "matched": [
      string
    ],
    "missing": [
      string
    ]
  },
  "reason": string,
  "feedback": {
    "summary": string,
    "highlights": [
      string
    ],
    "areasToImprove": [
      string
    ]
  }
}

Rules:

1. Return ONLY valid JSON.

2. Do NOT return Markdown.

3. Do NOT wrap the JSON inside code fences.

4. Do NOT include explanations.

5. Do NOT include comments.

6. Do NOT include additional properties.

7. Every property is REQUIRED.

8. Every array must exist even if empty.

9. All scores must be integers between 0 and 100.

10. "recommendedRoles[].confidence" must be an integer between 0 and 100.

11. "reason" should briefly justify the overall score in 2–4 sentences.

12. "feedback.summary" should provide a concise overall evaluation.

13. "feedback.highlights" should summarize the strongest aspects of the resume.

14. "feedback.areasToImprove" should summarize the most important improvements.

15. "keywords.matched" should contain the most important technical and professional keywords identified in the resume.

16. "keywords.missing" should contain generally valuable keywords that are absent and could strengthen the resume. Do not invent job-specific keywords.

17. "gaps" should identify genuine gaps in the resume, not missing technologies unless they are broadly beneficial.

18. Base every conclusion solely on the provided resume.

19. Never hallucinate information.

20. Never contradict the provided resume.

21. Return only the JSON object.
`;
