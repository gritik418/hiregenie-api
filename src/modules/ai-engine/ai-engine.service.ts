import { Injectable } from '@nestjs/common';
import { ChatOllama } from '@langchain/ollama';

@Injectable()
export class AiEngineService {
  private model = new ChatOllama({
    model: process.env.OLLAMA_MODEL as string,
    baseUrl: process.env.OLLAMA_BASE_URL as string,
  });

  async analyzeResume(rawText: string) {
    const prompt = `
You are an expert technical recruiter.

Analyze the resume and return ONLY valid JSON.

STRICT OUTPUT RULES:
- Do NOT explain anything
- Do NOT include markdown
- Do NOT use \`\`\`
- Do NOT return schema
- Output MUST be valid JSON only
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
  "reason": string
}

EXPERIENCE DETECTION (VERY IMPORTANT):
- Determine total professional experience from the resume
- Internships count but indicate entry-level
- If total experience < 1 year → classify as "Intern/Entry Level"
- This classification MUST control roles and summary

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
- Do NOT include unrelated roles (e.g. DevOps without infra experience)

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
- Provide actionable suggestions (tools, projects, learning)
- Avoid vague advice

KEYWORDS:
- matched = skills present
- missing = important but absent skills
- Can be empty if resume is strong

SUMMARY:
- 2–3 lines
- MUST reflect actual experience level (Intern / Junior / Mid)
- NEVER use "Senior", "Expert", or "Architect" for < 3 years experience

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
