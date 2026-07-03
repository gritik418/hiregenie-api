import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AiEngineService } from '../ai-engine/ai-engine.service';
import { MatchResumeChain } from '../ai-engine/chains/match-resume.chain';
import { PdfParserService } from '../resume/parsers/pdf-parser.service';
import { ResumeService } from '../resume/resume.service';
import MatchResumeInputDto from './dto/matchResume.dto';
import MatchResumeResponseSchema from '../ai-engine/schemas/match-resume-response.schema';

@Injectable()
export class ResumeAnalysisService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pdfParserService: PdfParserService,
    private readonly aiEngineService: AiEngineService,
    private readonly matchResumeChain: MatchResumeChain,
    private readonly resumeService: ResumeService,
  ) {}

  async analyzeResume(resumeId: string, regenerate: boolean) {
    const resume = await this.prismaService.resume.findUnique({
      where: {
        id: resumeId,
      },
    });
    if (
      !resume ||
      !resume.userId ||
      !resume.fileUrl ||
      !resume.id ||
      !resume.rawText
    )
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

    let resumeSummary = resume?.aiSummary || '';

    if (!resumeSummary) {
      resumeSummary = await this.resumeService.getResumeSummary(resume.rawText);
      await this.prismaService.resume.update({
        where: {
          id: resumeId,
        },
        data: {
          aiSummary: resumeSummary,
        },
      });
    }

    const resumeAnalysis =
      await this.aiEngineService.generateResumeAnalysis(resumeSummary);

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

    if (!resume || !resume.fileUrl || !resume?.rawText)
      throw new BadRequestException('Resume not found.');

    let resumeSummary = resume?.aiSummary || '';

    if (!resumeSummary) {
      resumeSummary = await this.resumeService.getResumeSummary(resume.rawText);
      await this.prismaService.resume.update({
        where: {
          id: resumeId,
        },
        data: {
          aiSummary: resumeSummary,
        },
      });
    }

    const matchAnalysis =
      await this.aiEngineService.generateResumeMatchAnalysis(
        resumeSummary,
        data.jobTitle,
        data?.jobDescription || 'Not Provided',
        data?.experienceRequired || 'Not Provided',
      );
    if (!matchAnalysis) {
      await this.prismaService.resumeMatchAnalysis.create({
        data: {
          resumeId: resume?.id || '',
          userId: resume?.userId || '',
          status: 'FAILED',
          summary: 'Failed to analyze resume',
          reason: 'Failed to analyze resume',
        },
      });
      throw new BadRequestException('Failed to match resume');
    }

    const analysis = await this.prismaService.resumeMatchAnalysis.create({
      data: {
        resumeId: resume?.id || '',
        userId: resume?.userId || '',
        status: 'COMPLETED',
        ...matchAnalysis,
      },
    });

    return { success: true, message: 'Resume matched successfully', analysis };
  }

  //   async getAiResumeSummary(resumeId: string) {
  //     const resume = await this.prismaService.resume.findUnique({
  //       where: {
  //         id: resumeId,
  //       },
  //       select: {
  //         rawText: true,
  //       },
  //     });

  //     if (!resume) throw new NotFoundException('Resume not found.');

  //     if (!resume.rawText) throw new BadRequestException('Raw text not found.');

  //     const prompt = `You are a resume data extraction tool.

  // Current date: ${new Date().getMonth() + 1}/${new Date().getFullYear()}

  // ## EXTRACTION RULES

  // ### validRoles Extraction:
  // - ONLY extract from sections: "PROFESSIONAL EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT", "JOB HISTORY"
  // - Required fields per role: Job Title, Company Name, Start Date, End Date
  // - Date format must be "MM/YYYY" or "Month YYYY"
  // - "Present" or "Current" in end date = "Present"
  // - SKIP: Projects, hackathons, coursework, personal projects, volunteer work without pay
  // - INCLUDE: Internships, apprenticeships, part-time jobs, contract work

  // ### Duration Calculation:
  // - Total months = (endYear - startYear) * 12 + (endMonth - startMonth)
  // - If endDate is "Present", use current month: ${new Date().getMonth() + 1}/${new Date().getFullYear()}
  // - Round to nearest whole number

  // ### projects Extraction:
  // - ONLY from sections: "PROJECTS", "KEY PROJECTS", "TECHNICAL PROJECTS"
  // - Extract: name, description (1-2 lines), tech stack (array), URL/link if present
  // - Each project must have a name and at least description OR technologies

  // ### summary Requirements:
  // - Minimum 5 sentences
  // - Include: Name (if found), education, key skills, relevant projects, total experience
  // - Write in third person or neutral tone

  // ### Date Parsing Logic:
  // Parse into "MM/YYYY":
  // - "Jan 2020" → "01/2020"
  // - "2020" assumes "01/2020"
  // - "5/2020" pads to "05/2020"
  // - Handle "Feb 2019 - Present", "2019 - Present", etc.

  // ## OUTPUT STRUCTURE

  // {
  //   "experienceAnalysis": {
  //     "validRoles": [
  //       {
  //         "title": "string",
  //         "company": "string",
  //         "startDate": "MM/YYYY",
  //         "endDate": "MM/YYYY or Present",
  //         "durationMonths": number,
  //         "experienceSummary": "1-2 sentences from bullet points"
  //       }
  //     ],
  //     "totalExperienceMonths": number,
  //     "experienceLevel": "Entry-level" | "Mid-level" | "Senior-level" | "Not Applicable"
  //   },
  //   "projects": [
  //     {
  //       "name": "string",
  //       "description": "string",
  //       "technologies": ["string"],
  //       "link": "string or null"
  //     }
  //   ],
  //   "summary": "comprehensive paragraph (min 5 sentences)"
  // }

  // ## CRITICAL RULES
  // 1. Output ONLY valid JSON - no text before/after
  // 2. NO markdown/code fences
  // 3. Do NOT fabricate data - extract only what exists
  // 4. Use double quotes, escape properly
  // 5. Include ALL required fields
  // 6. Calculate duration accurately

  // RAW RESUME:
  // """
  // ${resume.rawText}
  // """
  // `;

  //     const output = await this.aiEngineService.generateResponseInJSON(
  //       prompt,
  //       AiResumeSummaryResponseSchema,
  //     );

  //     return { output };
  //   }
}
