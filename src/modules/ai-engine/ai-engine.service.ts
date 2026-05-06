import { Injectable } from '@nestjs/common';
import { ChatOllama } from '@langchain/ollama';
import ResumeAnalysisResponseSchema from '../resume-analysis/schemas/resumeAnalysisResponse.schema';
import ResumeAnalysisOutputDto from '../resume-analysis/dto/resumeAnalysisOutput.dto';
import MatchResumeInputDto from '../resume-analysis/dto/matchResume.dto';
import { ZodSchema } from 'zod';
import MatchResumeAnalysisOutputDto from '../resume-analysis/dto/matchResumeAnalysisOutput.dto';
import MatchResumeResponseSchema from '../resume-analysis/schemas/matchResumeResponse.schema';

@Injectable()
export class AiEngineService {
  private model = new ChatOllama({
    model: process.env.OLLAMA_MODEL as string,
    baseUrl: process.env.OLLAMA_BASE_URL as string,
  });

  async generateResumeAnalysis(
    rawText: string,
  ): Promise<ResumeAnalysisOutputDto> {
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
  "score": number (0 - 100),
  "breakdown": {
    "keywords": number (0 - 100),
    "experience": number (0 - 100),
    "projects": number (0 - 100),
    "formatting": number (0 - 100)
  },
  "recommendedRoles": [
    {
      "title": string,
      "confidence": number (0 - 100)
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

    const result = this.extractJSON<ResumeAnalysisOutputDto>(
      raw,
      ResumeAnalysisResponseSchema,
    );

    return result;
  }

  async matchResume(rawText: string, data: MatchResumeInputDto) {
    const prompt = `
You are an expert technical recruiter and AI assistant. Your task is to evaluate a candidate's resume strictly against a target role.

### STRICT OUTPUT RULES
- Your entire response MUST be a single valid JSON object.
- Do NOT include any text before or after JSON.
- Do NOT include markdown blocks like \`\`\`json.
- Do NOT return schema definitions.
- Do NOT add explanations or comments.
- All fields are REQUIRED. If a value is unknown, use null for numbers/booleans or empty arrays/strings.
- Ensure all "breakdown" values and "matchScore" are raw NUMBERS, not strings.

### INPUT
- TARGET_ROLE: ${data.jobTitle ?? 'Unknown Role'}
- JOB_DESCRIPTION: ${data.jobDescription ?? 'Not provided'}
- REQUIRED_EXPERIENCE: ${data.experienceRequired ?? 'Not explicitly required'}
- SOURCE_TEXT (RESUME): ${rawText.slice(0, 5000)}

### ANALYSIS RULES (STRICT STRICT STRICT)
1. **NO ASSUMPTIONS**: Extract information ONLY from the provided SOURCE_TEXT. Do not guess or hallucinate skills, experience, or education.
2. **EXPERIENCE FOCUS**:
   - Accurately calculate the candidate's total years of experience strictly from dates in the resume.
   - Compare candidate experience directly to REQUIRED_EXPERIENCE.
   - If candidate's experience falls short of REQUIRED_EXPERIENCE, "meetsRequirement" MUST be false.
3. **PROPER SCORING**:
   - \`matchScore\` (0-100): Overall fit based on skills, experience, projects, and education.
   - \`breakdown\` scores (0-100 or null): Individual scores. Only score what is present.
   - Penalize the score if experience or core skills are lacking.
   - \`alignmentScore\` (0-100): How closely the candidate's past roles align with the TARGET_ROLE.
4. **FIT LEVEL**:
   - Determine fitLevel as "LOW", "MODERATE", or "HIGH" based on the matchScore (e.g., < 50 LOW, 50-75 MODERATE, > 75 HIGH).
5. **GAPS & WEAKNESSES**: Identify missing skills or experience explicitly. If REQUIRED_EXPERIENCE is unmet, it's a major gap.

### OUTPUT SCHEMA
{
  "matchScore": number (0-100),
  "fitLevel": "LOW", "MODERATE", or "HIGH",
  "breakdown": {
    "skills": number (0-100) or null,
    "experience": number (0-100) or null,
    "projects": number (0-100) or null,
    "education": number (0-100) or null
  },
  "skills": {
    "matched": array of strings,
    "missing": array of strings,
    "partial": array of strings
  },
  "experience": {
    "requiredYears": number or null,
    "candidateYears": number or null,
    "meetsRequirement": boolean or null,
    "notes": string
  },
  "roleFit": {
    "targetRole": string,
    "matchedRoles": array of strings,
    "alignmentScore": number (0-100)
  },
  "gaps": array of strings,
  "suggestions": array of strings,
  "learningPath": array of strings,
  "summary": string,
  "reason": string,
  "feedback": {
    "summary": string,
    "highlights": array of strings
  }
}

### FINAL COMPILATION RULE
Return ONLY the JSON object. 
- DO NOT add comments starting with // or /*.
- DO NOT explain your scoring.
- DO NOT use markdown code blocks.
- If you use any text outside the JSON, the parser will crash.
`;

    console.log('prompt ->', prompt, '\n\n');

    const response = await this.model.invoke([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    const raw = response.content.toString();

    const result = this.extractJSON<MatchResumeAnalysisOutputDto>(
      raw,
      MatchResumeResponseSchema,
    );

    return result;
  }

  private extractJSON<T>(text: string, schema: ZodSchema): T {
    try {
      if (!text) throw new Error('Empty AI response');

      let clean = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const match = clean.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON found');

      const jsonString = match[0];

      const parsed = JSON.parse(jsonString); // 🔥 THIS WAS MISSING

      const validated = schema.parse(parsed); // now correct type

      return validated as T;
    } catch (e) {
      console.error('Raw AI output:', text);
      console.error('Error:', e);
      throw new Error('Invalid AI response');
    }
  }
}
