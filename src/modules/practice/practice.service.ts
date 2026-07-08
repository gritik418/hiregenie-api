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
import {
  PracticeQuestionStatus,
  PracticeSessionStatus,
} from 'generated/prisma/enums';
import SaveAnswerInputDto from './dto/save-answer.dto';

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

    const { difficulty, targetRole, questionCount, customInstructions } = data;

    const resume = await this.prismaService.resume.findUnique({
      where: {
        userId,
        id: resumeId,
      },
    });

    if (!resume || !resume.rawText)
      throw new NotFoundException('No such Resume found.');

    const session = await this.aiEngineService.generatePracticeSession(
      targetRole,
      difficulty,
      resume?.aiSummary || resume.rawText,
      questionCount,
      customInstructions,
    );

    if (!session)
      throw new BadRequestException('Failed to generate practice session.');

    const practiceSession = await this.prismaService.practiceSession.create({
      data: {
        difficulty,
        status: PracticeSessionStatus.GENERATED,
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
        payload: {
          targetRole,
          difficulty,
          questionCount,
          customInstructions,
        },
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
          orderBy: {
            id: 'asc',
          },
        },
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
        payload: true,
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
      orderBy: {
        createdAt: 'desc',
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
            answer: true,
            status: true,
            updatedAt: true,
          },
          orderBy: {
            id: 'asc',
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

  async startPracticeSession(sessionId: string, req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Please Login.');
    if (!sessionId) throw new BadRequestException('Session ID is required.');

    const session = await this.prismaService.practiceSession.findUnique({
      where: {
        userId,
        id: sessionId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!session)
      throw new NotFoundException('No such Practice Session found.');

    if (session.status !== PracticeSessionStatus.GENERATED) {
      throw new BadRequestException('Session is already started or completed.');
    }

    await this.prismaService.practiceSession.update({
      where: {
        id: sessionId,
        userId,
      },
      data: {
        startedAt: new Date(),
        status: PracticeSessionStatus.IN_PROGRESS,
      },
    });

    return {
      success: true,
      message: 'Practice session started successfully.',
    };
  }

  async saveAnswer(
    sessionId: string,
    questionId: string,
    data: SaveAnswerInputDto,
    req: Request,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Please Login.');
    if (!sessionId) throw new BadRequestException('Session ID is required.');
    if (!questionId) throw new BadRequestException('Question ID is required.');
    if (!data.answer) throw new BadRequestException('Answer is required.');

    const session = await this.prismaService.practiceSession.findUnique({
      where: {
        userId,
        id: sessionId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!session)
      throw new NotFoundException('No such Practice Session found.');

    if (session.status !== PracticeSessionStatus.IN_PROGRESS) {
      throw new BadRequestException('Session is not in progress.');
    }

    const question = await this.prismaService.practiceQuestion.findUnique({
      where: {
        sessionId,
        id: questionId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!question)
      throw new NotFoundException('No such Practice Question found.');

    if (question.status !== PracticeQuestionStatus.PENDING)
      throw new BadRequestException('Question is already answered or skipped.');

    await this.prismaService.practiceQuestion.update({
      where: {
        id: questionId,
        sessionId,
      },
      data: {
        status: PracticeQuestionStatus.ANSWERED,
        answer: data.answer,
      },
    });

    return {
      success: true,
      message: 'Answer saved successfully.',
    };
  }

  async abandonSession(sessionId: string, req: Request) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Please Login.');
    if (!sessionId) throw new BadRequestException('Session ID is required.');

    const session = await this.prismaService.practiceSession.findUnique({
      where: {
        userId,
        id: sessionId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!session)
      throw new NotFoundException('No such Practice Session found.');

    if (session.status !== PracticeSessionStatus.IN_PROGRESS) {
      throw new BadRequestException('Session is not in progress.');
    }

    await this.prismaService.practiceQuestion.updateMany({
      where: {
        sessionId,
      },
      data: {
        status: PracticeQuestionStatus.SKIPPED,
      },
    });

    await this.prismaService.practiceSession.update({
      where: {
        id: sessionId,
        userId,
      },
      data: {
        status: PracticeSessionStatus.ABANDONED,
        abandonedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Practice session abandoned successfully.',
    };
  }

  async submitSession(sessionId: string, req: Request) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Please Login.');
    if (!sessionId) throw new BadRequestException('Session ID is required.');

    const completedAt: Date = new Date();

    const session = await this.prismaService.practiceSession.findUnique({
      where: {
        userId,
        id: sessionId,
      },
      include: {
        questions: true,
      },
    });

    if (!session)
      throw new NotFoundException('No such Practice Session found.');

    if (session.status === PracticeSessionStatus.COMPLETED) {
      throw new BadRequestException('Session is already completed.');
    }

    if (session.status === PracticeSessionStatus.ABANDONED) {
      throw new BadRequestException('Session is already abandoned.');
    }

    if (session.status !== PracticeSessionStatus.IN_PROGRESS) {
      throw new BadRequestException('Session is not in progress.');
    }

    const pendingQuestions = session.questions.filter(
      (question) => question.status === PracticeQuestionStatus.PENDING,
    );

    if (pendingQuestions.length > 0) {
      throw new BadRequestException(
        'Please answer all questions before submitting.',
      );
    }

    const { questionEvaluations, ...response } =
      await this.aiEngineService.evaluatePracticeSession(session);

    await this.prismaService.practiceSession.update({
      where: {
        id: sessionId,
        userId,
      },
      data: {
        status: PracticeSessionStatus.COMPLETED,
        completedAt,
      },
    });

    const overview = {
      totalQuestions: session.questions.length,
      answeredQuestions: session.questions.filter(
        (question) => question.status === PracticeQuestionStatus.ANSWERED,
      ).length,
      skippedQuestions: session.questions.filter(
        (question) => question.status === PracticeQuestionStatus.SKIPPED,
      ).length,
      completionPercentage:
        (session.questions.filter(
          (question) => question.status === PracticeQuestionStatus.ANSWERED,
        ).length /
          session.questions.length) *
        100,
      totalTimeSeconds: session.startedAt
        ? Math.floor(
            (completedAt.getTime() - session.startedAt.getTime()) / 1000,
          )
        : 0,
    };

    const result = await this.prismaService.practiceSessionResult.create({
      data: {
        ...response,
        sessionId: session.id,
        overview,
        questionEvaluations: {
          create: questionEvaluations.map((questionEvaluation) => {
            return {
              ...questionEvaluation,
            };
          }),
        },
      },
    });

    return {
      success: true,
      message: 'Practice session completed successfully.',
      result,
    };
  }

  async skipQuestion(sessionId: string, questionId: string, req: Request) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Please Login.');
    if (!sessionId) throw new BadRequestException('Session ID is required.');
    if (!questionId) throw new BadRequestException('Question ID is required.');

    const session = await this.prismaService.practiceSession.findUnique({
      where: {
        userId,
        id: sessionId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!session)
      throw new NotFoundException('No such Practice Session found.');

    if (session.status !== PracticeSessionStatus.IN_PROGRESS) {
      throw new BadRequestException('Session is not in progress.');
    }

    const question = await this.prismaService.practiceQuestion.findUnique({
      where: {
        sessionId,
        id: questionId,
      },
      select: {
        id: true,
        status: true,
        sessionId: true,
      },
    });

    if (!question)
      throw new NotFoundException('No such Practice Question found.');

    if (question.status !== PracticeQuestionStatus.PENDING)
      throw new BadRequestException('Question is already answered or skipped.');

    await this.prismaService.practiceQuestion.update({
      where: {
        id: questionId,
        sessionId,
      },
      data: {
        status: PracticeQuestionStatus.SKIPPED,
      },
    });

    return {
      success: true,
      message: 'Question skipped successfully.',
    };
  }

  async getPracticeSessionResult(sessionId: string, req: Request) {
    const userId = req?.user?.id;
    if (!userId) throw new UnauthorizedException('Please Login.');
    if (!sessionId) throw new BadRequestException('Session ID is required.');

    const session = await this.prismaService.practiceSession.findUnique({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session)
      throw new NotFoundException('No such Practice Session found.');

    if (session.status !== PracticeSessionStatus.COMPLETED)
      throw new BadRequestException('Practice Session not completed.');

    const result = await this.prismaService.practiceSessionResult.findUnique({
      where: {
        sessionId,
      },
      include: {
        questionEvaluations: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!result)
      throw new NotFoundException('No such Practice Session Result found.');

    return {
      success: true,
      message: 'Practice Session Result fetched successfully.',
      result,
    };
  }
}
