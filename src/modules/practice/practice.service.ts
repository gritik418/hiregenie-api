import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma/prisma.service';
import GeneratePracticeSessionInputDto from './dto/generate-practice-session.dto';
import { AiEngineService } from '../ai-engine/ai-engine.service';

@Injectable()
export class PracticeService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly aiEngineService: AiEngineService,
  ) {}

  async generatePracticeSession(
    resumeId: string,
    data: GeneratePracticeSessionInputDto,
    req: Request,
  ) {
    const userId = req.user?.id;

    if (!userId) throw new UnauthorizedException('Please Login.');

    const { difficulty, targetRole, questionCount } = data;

    const resume = await this.prismaService.resume.findUnique({
      where: {
        userId,
        id: resumeId,
      },
    });

    if (!resume || !resume.rawText)
      throw new NotFoundException('No such Resume found.');

    const existingSession = await this.prismaService.practiceSession.findFirst({
      where: {
        resumeId,
        targetRole,
        difficulty,
      },
      omit: {
        overview: true,
      },
    });

    if (existingSession) {
      return {
        success: true,
        message: 'Practice session already exists.',
        session: existingSession,
      };
    }

    const session = await this.aiEngineService.generatePracticeSession(
      targetRole,
      difficulty,
      resume?.aiSummary || resume.rawText,
      questionCount,
    );

    if (!session)
      throw new BadRequestException('Failed to generate practice session.');

    const practiceSession = await this.prismaService.practiceSession.create({
      data: {
        difficulty,
        status: 'ACTIVE',
        targetRole,
        userId,
        resumeId,
        questions: {
          createMany: {
            data: session.questions.map((q) => ({
              question: q.question,
              category: q.category,
              difficulty: q.difficulty,
              expectedAnswer: q.expectedAnswer,
              keyPoints: q.keyPoints,
              hints: q.hints,
              evaluationCriteria: q.evaluationCriteria,
              estimatedAnswerTimeSeconds: q.estimatedAnswerTimeSeconds,
              tags: q.tags,
            })),
          },
        },
        overview: session.overview,
      },
      select: {
        id: true,
        questions: true,
        difficulty: true,
        overview: true,
        resumeId: true,
        status: true,
        targetRole: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!practiceSession)
      throw new BadRequestException('Failed to create practice session.');

    return {
      success: true,
      message: 'Practice session generated successfully.',
      session: practiceSession,
    };
  }
}
