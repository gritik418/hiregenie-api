import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ResumeAnalysis, ResumeMatchAnalysis } from 'generated/prisma/browser';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AiEngineService } from '../ai-engine/ai-engine.service';
import { MatchResumeChain } from '../ai-engine/chains/match-resume.chain';
import { PdfParserService } from '../resume/parsers/pdf-parser.service';
import { ResumeService } from '../resume/resume.service';
import MatchResumeInputDto from './dto/matchResume.dto';
import { Request } from 'express';

@Injectable()
export class ResumeAnalysisService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pdfParserService: PdfParserService,
    private readonly aiEngineService: AiEngineService,
    private readonly matchResumeChain: MatchResumeChain,
    private readonly resumeService: ResumeService,
  ) {}

  async analyzeResume(resumeId: string, regenerate: boolean, req: Request) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Please Login.');

    const resume = await this.prismaService.resume.findUnique({
      where: {
        id: resumeId,
        userId,
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

    let analysis: ResumeAnalysis | null = null;

    if (existingAnalysis) {
      analysis = await this.prismaService.resumeAnalysis.update({
        where: {
          id: existingAnalysis.id,
        },
        data: {
          ...resumeAnalysis,
          updatedAt: new Date(),
        },
      });
    } else {
      analysis = await this.prismaService.resumeAnalysis.create({
        data: {
          resumeId: resume?.id || '',
          userId: resume?.userId || '',
          status: 'COMPLETED',
          ...resumeAnalysis,
        },
      });
    }

    return { success: true, message: 'Resume analyzed successfully', analysis };
  }

  async getResumeAnalyses(req: Request) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Please Login.');

    const analyses = await this.prismaService.resumeAnalysis.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        userId: true,
        resumeId: true,
        status: true,
        score: true,
        createdAt: true,
        updatedAt: true,
        resume: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            fileType: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Resume analyses fetched successfully',
      analyses,
    };
  }

  async getResumeAnalysisById(analysisId: string, req: Request) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Please Login.');

    const analysis = await this.prismaService.resumeAnalysis.findUnique({
      where: {
        id: analysisId,
        userId,
      },
      include: {
        resume: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            fileType: true,
            createdAt: true,
            updatedAt: true,
            aiSummary: true,
            fileUrl: true,
          },
        },
      },
    });

    if (!analysis) throw new BadRequestException('Analysis not found.');

    return {
      success: true,
      message: 'Resume analysis fetched successfully.',
      analysis,
    };
  }

  async matchResume(
    resumeId: string,
    data: MatchResumeInputDto,
    regenerate: boolean,
    req: Request,
  ) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Please Login.');

    const resume = await this.prismaService.resume.findUnique({
      where: {
        id: resumeId,
        userId,
      },
    });

    if (!resume || !resume.fileUrl || !resume?.rawText)
      throw new BadRequestException('Resume not found.');

    const existingMatchAnalysis =
      await this.prismaService.resumeMatchAnalysis.findFirst({
        where: {
          resumeId,
          targetRole: data.jobTitle,
          jobDescription: data?.jobDescription || null,
          status: 'COMPLETED',
        },
      });

    if (existingMatchAnalysis && !regenerate)
      return {
        success: true,
        message: 'Resume matched successfully.',
        analysis: existingMatchAnalysis,
      };

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

    let analysis: ResumeMatchAnalysis | null = null;

    if (existingMatchAnalysis) {
      analysis = await this.prismaService.resumeMatchAnalysis.update({
        where: {
          id: existingMatchAnalysis.id,
        },
        data: {
          status: 'COMPLETED',
          ...matchAnalysis,
          requiredExperience:
            data.experienceRequired &&
            !isNaN(parseInt(data.experienceRequired, 10))
              ? parseInt(data.experienceRequired, 10)
              : null,
          updatedAt: new Date(),
        },
      });
    } else {
      analysis = await this.prismaService.resumeMatchAnalysis.create({
        data: {
          resumeId: resume?.id || '',
          userId: resume?.userId || '',
          status: 'COMPLETED',
          targetRole: data.jobTitle,
          jobDescription: data.jobDescription || null,
          requiredExperience:
            data.experienceRequired &&
            !isNaN(parseInt(data.experienceRequired, 10))
              ? parseInt(data.experienceRequired, 10)
              : null,
          ...matchAnalysis,
        },
      });
    }

    return { success: true, message: 'Resume matched successfully.', analysis };
  }

  async getResumeMatchAnalyses(req: Request) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Please Login.');

    const analyses = await this.prismaService.resumeMatchAnalysis.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        userId: true,
        resumeId: true,
        status: true,
        targetRole: true,
        matchScore: true,
        fitLevel: true,
        createdAt: true,
        updatedAt: true,
        resume: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            fileType: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Resume match analyses fetched successfully',
      analyses,
    };
  }

  async getResumeMatchAnalysisById(matchId: string, req: Request) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Please Login.');

    if (!matchId) throw new BadRequestException('Match id is required.');

    const analysis = await this.prismaService.resumeMatchAnalysis.findUnique({
      where: {
        id: matchId,
        userId,
      },
      include: {
        resume: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            fileType: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!analysis) throw new BadRequestException('Analysis not found.');

    return {
      success: true,
      message: 'Resume match analysis fetched successfully.',
      analysis,
    };
  }
}
