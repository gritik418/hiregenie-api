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
You are an expert technical recruiter.

Analyze the candidate resume against the target job role.

Return ONLY valid JSON.

STRICT RULES:
- No markdown
- No explanations
- NO COMMENTS
- No extra text
- Output must be valid JSON
- All fields are required
- Do NOT change schema structure
- Do NOT return invalid JSON
- Use proper data types exactly as defined
- Numerical fields can't be null or undefined, return 0
- No value for string fields, return ""

JSON SCHEMA (MUST FOLLOW):  
{
  "matchScore": type number, // CAN'T BE NULL
  "fitLevel": type string (LOW | MODERATE | HIGH),
  "skills": {
    "matched": type string[], 
    "missing": type string[],
    "partial": type string[] 
  },
  "experience": {
    "requiredYears": type number | null,
    "candidateYears": type number,
    "meetsRequirement": type boolean,
    "notes": type string
  },
  "roleFit": {
    "targetRole": type string,
    "matchedRoles": type string[],
    "alignmentScore": type number // CAN'T BE NULL
  },
  "gaps": type string[],
  "suggestions": type string[],
  "learningPath": type string[],
  "summary": type string,
  "reason": type string,
  "feedback": {
    "summary": type string,
    "highlights": type string[]
  }
}

MATCH SCORE RULES:
- Must provide a score
- 0-49 = LOW
- 50-74 = MODERATE
- 75-100 = HIGH

FIT LEVEL RULES:
- matchScore < 50 → LOW
- matchScore 50-74 → MODERATE
- matchScore >= 75 → HIGH

EXPERIENCE RULES:
- ONLY use explicit experience from the resume
- ONLY consider professional experience for candidateYears (Internships and Jobs only)
- DO NOT assume years from skills or projects
- Internships count as experience
- If experience duration is unclear:
  - candidateYears = 0
- If required experience is not mentioned:
  - requiredYears = null

ROLE RULES:
- Roles must match candidate skills and projects
- Never suggest Senior roles under 3 years experience
- Never suggest Lead or Architect roles under 5 years experience
- Maximum 3 matched roles

SCORING RULES:
- matchScore and breakdown values must be integers between 0 and 100
- skills = technical skill relevance
- experience = experience relevance
- projects = project quality and relevance
- education = education relevance

GAPS RULES:
- Include important missing skills or experience gaps
- Keep concise and realistic

SUGGESTIONS RULES:
- Must be actionable
- Mention technologies, projects, certifications, or learning directions
- Avoid generic advice

SUMMARY RULES:
- 2 to 3 lines summary
- NO HTML

FEEDBACK RULES:
- feedback.summary is required, string format, NO HTML
- feedback.highlights must contain 2-4 concise points, NO HTML
- Feedback should sound like real recruiter evaluation

REASON RULES:
- Must be good enough to be shown to the candidate
- IN HTML format
- Upto 400 words (excluding html tags, use ' for styling)
- MUST BE PROPERLY ENCLOSED IN "", DONT USE " Inside 

TARGET ROLE:
${data.jobTitle ?? 'Unknown'}

JOB DESCRIPTION:
${data.jobDescription ?? 'Not provided'}

REQUIRED EXPERIENCE:
${data.experienceRequired ?? 'Not provided'}

CURRENT MONTH & YEAR: (FOR CANDIDATE'S EXPERIENCE CALCULATION):
${new Date().getMonth()}, ${new Date().getFullYear()}

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
