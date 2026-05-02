import { Injectable } from '@nestjs/common';
import { ChatOllama } from '@langchain/ollama';

@Injectable()
export class AiEngineService {
  private model = new ChatOllama({
    model: process.env.OLLAMA_MODEL as string,
    baseUrl: process.env.OLLAMA_BASE_URL as string,
  });

  async generateResumeAnalysis(rawText: string) {
    const prompt = `
You are an expert technical recruiter.

Analyze the resume and return ONLY valid JSON.

STRICT OUTPUT RULES:
- Your entire response MUST be a single valid JSON object
- Do NOT include any text before or after JSON
- Do NOT include markdown
- Do NOT use \`\`\`
- Do NOT return schema
- Do NOT add explanations
- All fields are REQUIRED
- Use valid JSON (no trailing commas, no comments)

FORMAT:
{
  "score": number,
  "breakdown": {
    "keywords": number,
    "experience": number,
    "projects": number,
    "formatting": number
  },
  "recommendedRoles": [
    {
      "title": string,
      "confidence": number
    }
  ],
  "strengths": string[],
  "weaknesses": string[],
  "gaps": string[],
  "suggestions": string[],
  "keywords": {
    "matched": string[],
    "missing": string[]
  },
  "summary": string,
  "reason": string,
  "feedback": {
    "summary": string,
    "highlights": string[],
    "areasToImprove": string[]
  }
}

EXPERIENCE DETECTION (VERY IMPORTANT):
- Determine total professional experience from the resume
- Internships count but indicate entry-level
- If total experience < 1 year → classify as "Intern/Entry Level"

HARD EXPERIENCE RULES (MANDATORY):
- < 1 year → ONLY Intern or Junior roles allowed
- 1–3 years → Junior or Mid-level roles
- 3+ years → Mid or Senior roles
- NEVER assign Senior roles for less than 3 years experience
- NEVER assign Architect/Lead roles for less than 5 years experience
- These rules OVERRIDE all other signals

SCORING RULES:
- All scores must be integers between 0 and 100
- breakdown scores must also be 0–100

ROLE RULES:
- Suggest up to 3 relevant roles (1–3 allowed)
- Roles MUST strictly follow experience level
- Roles must match skills in resume
- Do NOT include unrelated roles

STRENGTHS:
- Provide meaningful strengths based on resume

WEAKNESSES:
- Provide weaknesses only if clearly identifiable
- If resume is strong, keep minimal but realistic

GAPS:
- Gaps = missing skills or experience
- If resume is weak → include fundamental gaps
- If resume is strong → include advanced improvements
- If no major gaps → return empty array

SUGGESTIONS:
- Provide actionable suggestions (tools, technologies, projects)
- Avoid vague advice

KEYWORDS:
- matched = skills present
- missing = important but absent skills
- Can be empty if resume is strong

SUMMARY:
- 2–3 lines
- MUST reflect actual experience level (Intern / Junior / Mid)
- NEVER use "Senior", "Expert", or "Architect" for < 3 years experience

FEEDBACK RULES (STRICT):
- feedback.summary MUST be 1–2 lines, human-readable evaluation
- feedback.highlights MUST contain 2–4 concise bullet points
- feedback.areasToImprove MUST contain 2–4 actionable points

- DO NOT repeat strengths, weaknesses, or suggestions word-for-word
- DO NOT leave any feedback field empty
- Keep feedback concise and clear
- feedback must sound like a real recruiter’s evaluation

CRITICAL:
- Output MUST be valid JSON
- If unsure, still return best possible valid JSON

RESUME:
${rawText.slice(0, 5000)}
`;

    const response = await this.model.invoke([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    const raw = response.content.toString();

    const result = this.extractJSON(raw);

    return result;
  }

  private extractJSON(text: string) {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON found');

      return JSON.parse(match[0]);
    } catch {
      throw new Error('Invalid AI response');
    }
  }
}
