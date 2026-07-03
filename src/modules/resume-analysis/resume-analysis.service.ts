import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AiEngineService } from '../ai-engine/ai-engine.service';
import { AnalyzeResumeChain } from '../ai-engine/chains/analyze-resume.chain';
import { MatchResumeChain } from '../ai-engine/chains/match-resume.chain';
import { PdfParserService } from '../resume/parsers/pdf-parser.service';
import MatchResumeInputDto from './dto/matchResume.dto';
import ResumeAnalysisOutputDto from '../ai-engine/dto/resume-analysis-response.dto';
import AiResumeSummaryResponseSchema from './schemas/aiResumeSummaryResponse.schema';
import MatchResumeResponseSchema from './schemas/matchResumeResponse.schema';
import ResumeAnalysisResponseSchema from '../ai-engine/schemas/resume-analysis-response.schema';

@Injectable()
export class ResumeAnalysisService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pdfParserService: PdfParserService,
    private readonly aiEngineService: AiEngineService,
    private readonly matchResumeChain: MatchResumeChain,
    private readonly analyzeResumeChain: AnalyzeResumeChain,
  ) {}

  async analyzeResume(resumeId: string, regenerate: boolean) {
    const resume = await this.prismaService.resume.findUnique({
      where: {
        id: resumeId,
      },
    });
    if (!resume || !resume.userId || !resume.fileUrl || !resume.id)
      throw new BadRequestException('Resume not found.');

    const existingAnalysis = await this.prismaService.resumeAnalysis.findFirst({
      where: {
        resumeId: resume.id,
        status: 'COMPLETED',
      },
    });

    if (existingAnalysis && !regenerate) {
      return {
        success: true,
        message: 'Resume already analyzed',
        analysis: existingAnalysis,
      };
    }

    let rawText = resume.rawText || '';

    // if (!rawText) {
    //   rawText = await this.pdfParserService.parseFromURL(resume.fileUrl);
    //   await this.prismaService.resume.update({
    //     where: {
    //       id: resumeId,
    //     },
    //     data: {
    //       rawText,
    //     },
    //   });
    // }

    const resumeAnalysis = await this.aiEngineService.generateResumeAnalysis(
      resume?.aiSummary || '',
    );

    if (!resumeAnalysis) {
      await this.prismaService.resumeAnalysis.create({
        data: {
          resumeId: resume?.id || '',
          userId: resume?.userId || '',
          status: 'FAILED',
          reason: 'Failed to analyze resume',
        },
      });
      throw new BadRequestException('Failed to analyze resume');
    }

    const analysis = await this.prismaService.resumeAnalysis.create({
      data: {
        resumeId: resume?.id || '',
        userId: resume?.userId || '',
        status: 'COMPLETED',
        ...resumeAnalysis,
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

  async getAiResumeSummary(resumeId: string) {
    const resume = await this.prismaService.resume.findUnique({
      where: {
        id: resumeId,
      },
      select: {
        rawText: true,
      },
    });

    if (!resume) throw new NotFoundException('Resume not found.');

    if (!resume.rawText) throw new BadRequestException('Raw text not found.');

    const prompt = `You are a resume data extraction tool.

Current date: ${new Date().getMonth() + 1}/${new Date().getFullYear()}

## EXTRACTION RULES

### validRoles Extraction:
- ONLY extract from sections: "PROFESSIONAL EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT", "JOB HISTORY"
- Required fields per role: Job Title, Company Name, Start Date, End Date
- Date format must be "MM/YYYY" or "Month YYYY"
- "Present" or "Current" in end date = "Present"
- SKIP: Projects, hackathons, coursework, personal projects, volunteer work without pay
- INCLUDE: Internships, apprenticeships, part-time jobs, contract work

### Duration Calculation:
- Total months = (endYear - startYear) * 12 + (endMonth - startMonth)
- If endDate is "Present", use current month: ${new Date().getMonth() + 1}/${new Date().getFullYear()}
- Round to nearest whole number

### projects Extraction:
- ONLY from sections: "PROJECTS", "KEY PROJECTS", "TECHNICAL PROJECTS"
- Extract: name, description (1-2 lines), tech stack (array), URL/link if present
- Each project must have a name and at least description OR technologies

### summary Requirements:
- Minimum 5 sentences
- Include: Name (if found), education, key skills, relevant projects, total experience
- Write in third person or neutral tone

### Date Parsing Logic:
Parse into "MM/YYYY":
- "Jan 2020" → "01/2020"
- "2020" assumes "01/2020"
- "5/2020" pads to "05/2020"
- Handle "Feb 2019 - Present", "2019 - Present", etc.

## OUTPUT STRUCTURE

{
  "experienceAnalysis": {
    "validRoles": [
      {
        "title": "string",
        "company": "string",
        "startDate": "MM/YYYY",
        "endDate": "MM/YYYY or Present",
        "durationMonths": number,
        "experienceSummary": "1-2 sentences from bullet points"
      }
    ],
    "totalExperienceMonths": number,
    "experienceLevel": "Entry-level" | "Mid-level" | "Senior-level" | "Not Applicable"
  },
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "link": "string or null"
    }
  ],
  "summary": "comprehensive paragraph (min 5 sentences)"
}

## CRITICAL RULES
1. Output ONLY valid JSON - no text before/after
2. NO markdown/code fences
3. Do NOT fabricate data - extract only what exists
4. Use double quotes, escape properly
5. Include ALL required fields
6. Calculate duration accurately

RAW RESUME:
"""
${resume.rawText}
"""
`;

    const output = await this.aiEngineService.generateResponseInJSON(
      prompt,
      AiResumeSummaryResponseSchema,
    );

    return { output };
  }
}
