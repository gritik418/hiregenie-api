import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOllama } from '@langchain/ollama';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ZodSchema } from 'zod';
import MatchResumeInputDto from 'src/modules/resume-analysis/dto/matchResume.dto';

@Injectable()
export class MatchResumeChain {
  constructor() {}

  private llm = new ChatOllama({
    model: process.env.OLLAMA_MODEL as string,
    baseUrl: process.env.OLLAMA_BASE_URL as string,
  });

  async matchResume(
    data: MatchResumeInputDto,
    resume: string,
    schema: ZodSchema,
  ) {
    const systemPrompt = `Expert Technical Recruiter (10+ years). Output ONLY valid JSON.

## MANDATORY OUTPUT RULES (CRITICAL - VIOLATION = FAILURE)
- Return ONLY valid JSON - NO EXCEPTIONS
- NO markdown, NO explanations, NO comments, NO extra text, NO escape characters 
- All fields REQUIRED - use exact data types
- Numbers: use plain integers/decimals (0-100 range where specified), NEVER null for matchScore/alignmentScore
- Strings: "" if no value
- Arrays: [] if empty
- Schema structure CANNOT be changed
- NO BACKTICKS OR CODE BLOCKS
- Must follow schema exactly as given. Do not add any extra fields or change the structure. Data types must match exactly.

## JSON SCHEMA (EXACT STRUCTURE REQUIRED)
{
  "matchScore": number (0-100 integer),
  "fitLevel": string ("LOW" | "MODERATE" | "HIGH"),
  "skills": {
    "matched": string[], 
    "missing": string[],
    "partial": string[]
  },
  "experience": {
    "requiredYears": number | null,
    "candidateExperience": number (decimal years, max 2 decimals),
    "meetsRequirement": boolean,
    "notes": string
  },
  "roleFit": {
    "targetRole": string,
    "matchedRoles": string[],
    "alignmentScore": number (0-100 integer)
  },
  "gaps": string[],
  "suggestions": string[],
  "learningPath": string[],
  "summary": string,
  "reason": string,
  "feedback": {
    "summary": string,
    "highlights": string[]
  }
}

## FIELD-BY-FIELD INSTRUCTIONS

### 1. matchScore (number): 
   Calculate an overall match score from 0 to 100 based on the candidate's alignment with the job. if job description is empty, try to find the role from job title and calculate the match score based on that.
   Formula weighting: Skills (40%) + Experience (30%) + Projects (20%) + Education (10%).
   Must not be null or undefined. Must be in range of 0 to 100.

### 2. fitLevel (string): 
   Determine the candidate's overall fit based on the matchScore.
   Use EXACTLY one of these values: "LOW" (score < 50), "MODERATE" (score 50-74), or "HIGH" (score >= 75).

### 3. skills.matched (string array): 
   List 3-8 skills from the job description that are explicitly proven in the candidate's resume.
   E.g., if the JD requires Python and the resume says "Built API with Python", include "Python".
   Try to list atleast 3-5 skills. If no skills are matched, return empty array.

### 4. skills.missing (string array): 
   List 2-5 highly relevant skills required by the job description that are completely absent from the resume.
   Try to list atleast 2-3 skills. If no skills are missing, return empty array.

### 5. skills.partial (string array): 
   List 2-3 skills that are only weakly mentioned, theoretical, or inferred without concrete evidence.
   Try to list atleast 1-2 skills. If no skills are partial, return empty array.

### 6. experience.requiredYears (number or null): 
   Extract the exact minimum years of experience required from the job description (e.g., "3+ years" -> 3). Return null if not specified.

### 7. experience.candidateExperience (number): 
   Calculate the candidate's total relevant professional experience in decimal years (e.g., 1 year and 6 months = 1.5). 
   Do not count personal projects or bootcamps unless explicitly defined as professional experience. Max 2 decimal places.
   Only consider relevant experience. Include experience in internship/freelancing/full-time jobs.

### 8. experience.meetsRequirement (boolean): 
   Return true if candidateExperience >= requiredYears, OR if requiredYears is null. Return false otherwise.

### 9. experience.notes (string): 
   Provide a concise 1-sentence note justifying the candidate's experience calculation (e.g., "1.5 years in relevant backend roles").

### 10. roleFit.targetRole (string): 
   The exact job title provided in the input job description.

### 11. roleFit.matchedRoles (string array): 
   List 3-6 realistic alternative job titles that the candidate is well-suited for based on their actual resume skills.

### 12. roleFit.alignmentScore (number): 
   Provide an integer score from 0-100 evaluating how strongly the candidate's background aligns specifically with the targetRole.

### 13. gaps (string array): 
   List 3-6 specific gaps in the candidate's profile relative to the job description (e.g., "No production experience with Kubernetes").

### 14. suggestions (string array): 
   Provide 3-5 actionable suggestions for the candidate to improve their chances for this role (e.g., "Deploy a full-stack application to AWS").

### 15. learningPath (string array): 
   Provide a 3-5 step numbered learning plan for the candidate to bridge their gaps (e.g., "1. Complete a Docker tutorial", "2. Build a microservice").

### 16. summary (string): 
   Write a brief, objective 2-3 sentence summary (max 100 words) of the candidate's overall fit for the role.

### 17. reason (string): 
   Write a candidate-facing explanation (max 400 words) detailing why they received their score. 
   MUST be formatted with basic HTML tags like <p> and <b> for readability.

### 18. feedback.summary (string): 
   Provide a 1-2 sentence internal evaluation from a recruiter's perspective, highlighting primary strengths or major concerns.

### 19. feedback.highlights (string array): 
   List 3-5 bullet points emphasizing the most impressive or relevant evidence-based achievements from the resume.

Current Date Context: ${new Date().getMonth() + 1}/${new Date().getFullYear()}`;

    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage(systemPrompt),
      [
        'human',
        `Role: {jobTitle}
    JD: {jobDescription}
    Req Exp: {experienceRequired}
    
    RESUME:
    {resume}`,
      ],
    ]);

    //  const chain = prompt.pipe(this.llm).pipe(schema.safeParse as any);
    const chain = prompt.pipe(this.llm);

    const res = await chain.invoke({
      jobTitle: data.jobTitle,
      jobDescription: data.jobDescription,
      experienceRequired: data.experienceRequired,
      resume: resume,
    });

    return {
      chain: this.extractJSON(res.content.toString(), schema),
    };
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

      const parsed = JSON.parse(jsonString);

      const validated = schema.parse(parsed);

      return validated as T;
    } catch (e) {
      throw new BadRequestException({
        message: 'Invalid AI response',
        e: e?.message,
        text,
      });
    }
  }
}
