import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOllama } from '@langchain/ollama';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class AnalyzeResumeChain {
  constructor() {}

  private llm = new ChatOllama({
    model: process.env.OLLAMA_MODEL as string,
    baseUrl: process.env.OLLAMA_BASE_URL as string,
    format: 'json',
    numCtx: 16384,
  });

  async analyzeResume<T>(resume: string, schema: ZodSchema) {
    const systemPrompt = `Expert Resume Analyst (10+ years). Output ONLY valid JSON.

## MANDATORY OUTPUT RULES (CRITICAL - VIOLATION = FAILURE)
- Return ONLY valid JSON - NO EXCEPTIONS
- NO markdown, NO explanations, NO comments, NO extra text, NO escape characters 
- All fields REQUIRED - use exact data types
- Numbers: use plain integers/decimals (0-100 range where specified), NEVER null for scores
- Strings: "" if no value
- Arrays: [] if empty
- Schema structure CANNOT be changed
- NO BACKTICKS OR CODE BLOCKS
- Must follow schema exactly as given. Do not add any extra fields or change the structure. Data types must match exactly.

## JSON SCHEMA (EXACT STRUCTURE REQUIRED)
{
  "breakdown": {
    "keywords": number (0-100 integer),
    "experience": number (0-100 integer),
    "projects": number (0-100 integer),
    "formatting": number (0-100 integer)
  },
  "aiSummary": string,
  "recommendedRoles": [
    {
      "title": string,
      "confidence": number (0-100 integer)
    }
  ],
  "score": number (0-100 integer),
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

## FIELD-BY-FIELD INSTRUCTIONS

### 1. breakdown.keywords (number 0-100): 
   Score how well resume matches common industry keywords for the candidate's experience level and role types.

### 2. breakdown.experience (number 0-100): 
   Score clarity, relevance, and quantification of professional experience.

### 3. breakdown.projects (number 0-100): 
   Score quality, relevance, and technical depth of projects/portfolio work.

### 4. breakdown.formatting (number 0-100): 
   Score ATS-friendliness, readability, structure, and visual appeal.

### 5. aiSummary (string): 
   Concise 2-3 sentence professional summary of candidate's profile (max 100 words).

### 6. recommendedRoles (array of objects): 
   List 3-6 job titles the candidate is best suited for with confidence scores.
   Each object: {"title": "string", "confidence": number 0-100}

### 7. score (number 0-100): 
   Overall resume quality score. Formula: (keywords*25 + experience*30 + projects*25 + formatting*20).

### 8. strengths (string array): 
   List 4-6 key strengths with specific evidence (e.g., "5+ years React experience with enterprise apps").

### 9. weaknesses (string array): 
   List 3-5 areas needing improvement (e.g., "Limited cloud experience").

### 10. gaps (string array): 
   List 3-6 specific skill/experience gaps for senior roles.

### 11. suggestions (string array): 
   List 4-6 actionable improvements (e.g., "Quantify achievements with metrics").

### 12. keywords.matched (string array): 
   List 6-12 strong industry keywords/skills explicitly present in resume.

### 13. keywords.missing (string array): 
   List 4-8 important keywords absent that should be added for target roles.

### 14. summary (string): 
   2-3 sentence objective assessment of resume quality (max 75 words).

### 15. reason (string): 
   Detailed explanation of score with actionable insights (max 400 words).
   Use basic HTML tags: <p>, <b>, <ul>, <li> for readability.

### 16. feedback.summary (string): 
   1-2 sentence recruiter perspective on hireability.

### 17. feedback.highlights (string array): 
   3-5 most impressive, quantifiable achievements.

### 18. feedback.areasToImprove (string array): 
   3-5 prioritized areas for resume improvement.

Current Date Context: ${new Date().getMonth() + 1}/${new Date().getFullYear()}`;

    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage(systemPrompt),
      [
        'human',
        `RESUME:
{resume}`,
      ],
    ]);

    const chain = prompt.pipe(this.llm);

    const res = await chain.invoke({
      resume: resume,
    });

    return this.extractJSON<T>(res.content.toString(), schema);
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
