import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { PdfParserService } from '../resume/parsers/pdf-parser.service';
import { AiEngineService } from '../ai-engine/ai-engine.service';

@Injectable()
export class ResumeAnalysisService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly pdfParserService: PdfParserService,
    private readonly aiEngineService: AiEngineService,
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

    const data = await this.aiEngineService.generateResumeAnalysis(rawText);

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
}
