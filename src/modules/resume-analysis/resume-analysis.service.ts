import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { PdfParserService } from '../resume/parsers/pdf-parser.service';
import { AiEngineService } from '../ai-engine/ai-engine.service';
import MatchResumeInputDto from './dto/matchResume.dto';
import ResumeAnalysisResponseSchema from './schemas/resumeAnalysisResponse.schema';
import ResumeAnalysisOutputDto from './dto/resumeAnalysisOutput.dto';
import MatchResumeResponseSchema from './schemas/matchResumeResponse.schema';
import { MatchResumeChain } from '../ai-engine/chains/match-resume.chain';

@Injectable()
export class ResumeAnalysisService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pdfParserService: PdfParserService,
    private readonly aiEngineService: AiEngineService,
    private readonly matchResumeChain: MatchResumeChain,
  ) {}

  async analyzeResume(resumeId: string) {
    const resume = await this.prismaService.resume.findUnique({
      where: {
        id: resumeId,
      },
    });
    if (!resume || !resume.fileUrl)
      throw new BadRequestException('Resume not found.');

    const existingAnalysis = await this.prismaService.resumeAnalysis.findFirst({
      where: {
        resumeId: resume.id,
        status: 'COMPLETED',
      },
    });

    if (existingAnalysis) {
      return {
        success: true,
        message: 'Resume already analyzed',
        analysis: existingAnalysis,
      };
    }

    let rawText = resume.rawText || '';

    if (!rawText) {
      rawText = await this.pdfParserService.parseFromURL(resume.fileUrl);
      await this.prismaService.resume.update({
        where: {
          id: resumeId,
        },
        data: {
          rawText,
        },
      });
    }

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

    const data =
      await this.aiEngineService.generateResponseInJSON<ResumeAnalysisOutputDto>(
        prompt,
        ResumeAnalysisResponseSchema,
      );

    if (!data) {
      await this.prismaService.resumeAnalysis.create({
        data: {
          resumeId: resume.id,
          userId: resume.userId,
          status: 'FAILED',
          summary: 'Failed to analyze resume',
          reason: 'Failed to analyze resume',
        },
      });
      throw new BadRequestException('Failed to analyze resume');
    }

    const analysis = await this.prismaService.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        userId: resume.userId,
        status: 'COMPLETED',
        ...data,
      },
    });

    return { success: true, message: 'Resume analyzed successfully', analysis };
  }

  async matchResume(resumeId: string, data: MatchResumeInputDto) {
    const resume = await this.prismaService.resume.findUnique({
      where: {
        id: resumeId,
      },
    });

    if (!resume || !resume.fileUrl)
      throw new BadRequestException('Resume not found.');

    let rawText = resume.rawText || '';

    if (!rawText) {
      rawText = await this.pdfParserService.parseFromURL(resume.fileUrl);
      await this.prismaService.resume.update({
        where: {
          id: resumeId,
        },
        data: {
          rawText,
        },
      });
    }

    //     const prompt = `
    // You are an expert technical recruiter with 10+ years experience matching candidates to tech roles.

    // ## MANDATORY OUTPUT RULES (CRITICAL - VIOLATION = FAILURE)
    // - Return ONLY valid JSON - NO EXCEPTIONS
    // - NO markdown, NO explanations, NO comments, NO extra text, NO escape characters
    // - All fields REQUIRED - use exact data types
    // - Numbers: use plain integers/decimals (0-100 range where specified), NEVER null for matchScore/alignmentScore
    // - Strings: "" if no value
    // - Arrays: [] if empty
    // - Schema structure CANNOT be changed
    // - NO BACKTICKS OR CODE BLOCKS

    // ## JSON SCHEMA (EXACT STRUCTURE REQUIRED)
    // {
    //   "matchScore": number (0-100 integer),
    //   "fitLevel": string ("LOW" | "MODERATE" | "HIGH"),
    //   "skills": {
    //     "matched": string[],
    //     "missing": string[],
    //     "partial": string[]
    //   },
    //   "experience": {
    //     "requiredYears": number | null,
    //     "candidateExperience": number (decimal years, max 2 decimals),
    //     "meetsRequirement": boolean,
    //     "notes": string
    //   },
    //   "roleFit": {
    //     "targetRole": string,
    //     "matchedRoles": string[],
    //     "alignmentScore": number (0-100 integer)
    //   },
    //   "gaps": string[],
    //   "suggestions": string[],
    //   "learningPath": string[],
    //   "summary": string,
    //   "reason": string,
    //   "feedback": {
    //     "summary": string,
    //     "highlights": string[]
    //   }
    // }

    // ## FIELD-BY-FIELD INSTRUCTIONS

    // ### 1. matchScore (number 0-100, REQUIRED, INTEGER)
    // - Overall fit score based on: skills(40%) + experience(30%) + projects(20%) + education(10%)
    // - 0-49 = LOW fit
    // - 50-74 = MODERATE fit
    // - 75-100 = HIGH fit
    // - Base score on EXPLICIT evidence only
    // - Must NOT BE NULL, MUST BE AN INTEGER

    // ### 2. fitLevel (string, REQUIRED)
    // - "LOW" if matchScore < 50
    // - "MODERATE" if matchScore 50-74
    // - "HIGH" if matchScore >= 75

    // ### 3. skills OBJECT (ALL ARRAYS REQUIRED)
    // **matched** (string[]): Skills that user has that are relevant to the job
    // **missing** (string[]): Skills that can be relevant to the job but ABSENT from resume (ALWAYS 2-3 minimum), if no missing skills can be found then return empty array []
    // **partial** (string[]): Skills weakly mentioned, no projects, or theoretical only (2-3 if missing), if no partial skills can be found then return empty array []

    // ### 4. experience OBJECT (ALL FIELDS REQUIRED)
    // **requiredYears** (number|null):
    // - Extract EXACT number if mentioned in job desc ("3+ years", "5 years exp")
    // - null if NOT explicitly stated

    // **candidateExperience** (number, decimal years):
    // CALCULATE ONLY FROM EXPLICIT PROFESSIONAL EXPERIENCE WITH COMPLETE DATES:

    // ## ✅ VALID (Month+Year → Month+Year/Present)
    // "Frontend Developer Intern | July 2025 - Present"
    // → July 2025 to ${new Date().getMonth() + 1}/${new Date().getFullYear()} = 4 months = 0.33

    // ## ❌ IGNORE COMPLETELY (ZERO VALUE)
    // Projects | Freelance (undated) | "Developed features..." (no dates) |
    // Open source | Bootcamps | Hackathons | Year-only ("2023") |
    // Missing start/end | Academic/personal | Summary claims

    // ## EXACT CALCULATION (NO ASSUMPTIONS)
    // 1. VALID ONLY: "Month Year - Month Year" OR "Month Year - Present"
    // 2. Present = ${new Date().getMonth() + 1}/${new Date().getFullYear()}
    // 3. Months = (EndYear×12 + EndMonth) - (StartYear×12 + StartMonth)
    // 4. Years = Months ÷ 12 (2 decimals: 0.33, 1.25, 2.17)
    // 5. NO overlap | NO rounding | NO estimates
    // 6. ZERO entries = 0.00

    // **Date Rules:**
    // - Month+Year to Month+Year → calculate months
    // - "Present" = ${new Date().getMonth() + 1}/${new Date().getFullYear()}
    // - Total months / 12 = decimal years (max 2 decimals)
    // - 0 if no valid dated experience

    // **meetsRequirement** (boolean):
    // - true if requiredYears = null OR candidateExperience >= requiredYears

    // **notes** (string): "X years in relevant roles" or "No dated professional experience"

    // ### 5. roleFit OBJECT
    // **targetRole** (string): "${data.jobTitle ?? 'Unknown Role'}"

    // **matchedRoles** (string[]): 3-5 generic roles candidate qualifies for
    // - Examples: "Frontend Developer", "Full Stack Engineer", "React Developer"
    // - Base on resume experience + skills

    // **alignmentScore** (number 0-100): How well candidate's background matches targetRole

    // ### 6. gaps (string[]): 3-5 specific missing elements
    // - "No cloud platform experience"
    // - "Missing containerization skills"
    // - "Limited production deployment experience"

    // ### 7. suggestions (string[]): 3-5 ACTIONABLE recommendations
    // - "Build REST API with Node.js + Express"
    // - "Complete AWS Certified Developer course"
    // - "Deploy project to Vercel/Netlify"

    // ### 8. learningPath (string[]): 3-5 step-by-step learning steps
    // - "1. FreeCodeCamp React course"
    // - "2. Build todo app with Redux"
    // - "3. Deploy to Netlify"

    // ### 9. summary (string): 2-3 sentences, 100 words max
    // Professional overview of fit

    // ### 10. reason (string): HTML formatted (400 words max)
    // - Candidate-facing explanation
    // - Use ' for styling (no ")
    // - Professional, constructive tone

    // ### 11. feedback OBJECT
    // **summary** (string): 1-2 sentence recruiter evaluation
    // **highlights** (string[]): 3-4 bullet points of strengths/weaknesses

    // ## CONTEXT
    // **Target Role**: ${data.jobTitle ?? 'Unknown'}
    // **Job Description**: ${data.jobDescription ?? 'Not provided'}
    // **Required Experience**: ${data.experienceRequired ?? 'Not provided'}
    // **Current Date**: ${new Date().getMonth() + 1}/${new Date().getFullYear()}
    // **Resume**: ${rawText.slice(0, 5000)}

    // ## FINAL CHECKLIST (Strictly followed)
    // - ✅ Must be a proper JSON
    // - ✅ All fields present
    // - ✅ Correct data types
    // - ✅ Numbers 0-100 integers where required
    // - ✅ Experience calculated precisely
    // - ✅ 2-3 missing skills minimum
    // - ✅ Actionable suggestions
    // - ✅ No escaped characters in JSON
    // - ✅ ALL field names MUST be double quoted
    // `;

    // const analysis =
    //   await this.aiEngineService.generateResponseInJSON<MatchResumeAnalysisOutputDto>(
    //     prompt,
    //     MatchResumeResponseSchema,
    //   );
    const analysis = await this.matchResumeChain.matchResume(
      data,
      rawText,
      MatchResumeResponseSchema,
    );

    if (!analysis) {
      // await this.prismaService.create({
      //   data: {
      //     resumeId: resume.id,
      //     userId: resume.userId,
      //     status: 'FAILED',
      //     summary: 'Failed to analyze resume',
      //     reason: 'Failed to analyze resume',
      //   },
      // });
      throw new BadRequestException('Failed to match resume');
    }

    return { success: true, message: 'Resume matched successfully', analysis };
  }
}
