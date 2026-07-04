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
      include: {
        questions: true,
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
      include: {
        questions: true,
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

  async getPracticeSessions(req: Request) {
    const userId = req.user?.id;

    if (!userId) throw new UnauthorizedException('Please Login.');

    const sessions = await this.prismaService.practiceSession.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        status: true,
        difficulty: true,
        targetRole: true,
        createdAt: true,
        updatedAt: true,
        resumeId: true,
        overview: true,
        resume: {
          select: {
            fileName: true,
            fileSize: true,
            fileType: true,
            fileUrl: true,
          },
        },
        _count: {
          select: { questions: true },
        },
      },
    });

    return {
      success: true,
      message: 'Practice sessions fetched successfully.',
      sessions,
    };
  }

  async getPracticeSession(sessionId: string, req: Request) {
    const userId = req.user?.id;

    if (!userId) throw new UnauthorizedException('Please Login.');
    if (!sessionId) throw new BadRequestException('Session ID is required.');

    const session = await this.prismaService.practiceSession.findUnique({
      where: {
        userId,
        id: sessionId,
      },
      include: {
        questions: {
          select: {
            id: true,
            question: true,
            category: true,
            difficulty: true,
            keyPoints: true,
            hints: true,
            evaluationCriteria: true,
            estimatedAnswerTimeSeconds: true,
            tags: true,
            createdAt: true,
          },
        },
        resume: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            fileUrl: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!session)
      throw new NotFoundException('No such Practice Session found.');

    return {
      success: true,
      message: 'Practice session fetched successfully.',
      session,
    };
  }
}
