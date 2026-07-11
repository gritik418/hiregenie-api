import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma/prisma.service';
import CreateInterviewSessionDto from './dto/create-interview-session.dto';
import { InterviewStatus } from 'generated/prisma/enums';

@Injectable()
export class AiInterviewService {
  constructor(private readonly prismaService: PrismaService) {}

  async createInterviewSession(data: CreateInterviewSessionDto, req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const { difficulty, interviewType, resumeId, targetRole } = data;

    const resume = await this.prismaService.resume.findUnique({
      where: {
        userId,
        id: resumeId,
      },
    });

    if (!resume || !resume.rawText)
      throw new BadRequestException('Resume not found.');

    const interviewSession = await this.prismaService.interviewSession.create({
      data: {
        difficulty,
        interviewType,
        targetRole,
        createdAt: new Date(),
        resumeId,
        userId,
        status: InterviewStatus.GENERATED,
      },
    });

    return {
      success: true,
      message: 'Interview session created successfully.',
      session: interviewSession,
    };
  }

  async startInterviewSession(sessionId: string, req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const interviewSession =
      await this.prismaService.interviewSession.findUnique({
        where: {
          userId,
          id: sessionId,
        },
      });

    if (!interviewSession)
      throw new NotFoundException('Interview session not found.');

    if (
      interviewSession.status !== InterviewStatus.GENERATED &&
      interviewSession.status !== InterviewStatus.IN_PROGRESS
    ) {
      throw new BadRequestException('Cannot start interview session.');
    }

    if (interviewSession.status === InterviewStatus.IN_PROGRESS) {
      return {
        success: true,
        message: 'Interview session is already started.',
        sessionId,
      };
    }

    await this.prismaService.interviewSession.update({
      where: {
        userId,
        id: sessionId,
      },
      data: {
        startedAt: new Date(),
        status: InterviewStatus.IN_PROGRESS,
      },
    });

    return {
      success: true,
      message: 'Interview session started.',
      sessionId,
    };
  }

  async getInterviewSessions(req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const interviewSessions =
      await this.prismaService.interviewSession.findMany({
        where: {
          userId,
        },
      });

    return {
      success: true,
      message: 'Interview sessions fetched successfully.',
      sessions: interviewSessions,
    };
  }

  async getInterviewSessionDetails(sessionId: string, req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const interviewSession =
      await this.prismaService.interviewSession.findUnique({
        where: {
          userId,
          id: sessionId,
        },
        include: {
          messages: true,
          resume: true,
        },
      });

    if (!interviewSession)
      throw new NotFoundException('Interview session not found.');

    return {
      success: true,
      message: 'Interview session fetched successfully.',
      session: interviewSession,
    };
  }

  async abandonInterviewSession(sessionId: string, req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const interviewSession =
      await this.prismaService.interviewSession.findUnique({
        where: {
          userId,
          id: sessionId,
        },
      });

    if (!interviewSession)
      throw new NotFoundException('Interview session not found.');

    if (interviewSession.status !== InterviewStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot abandon interview session.');
    }

    await this.prismaService.interviewSession.update({
      where: {
        userId,
        id: sessionId,
      },
      data: {
        status: InterviewStatus.ABANDONED,
        abandonedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Interview session abandoned.',
      sessionId,
    };
  }

  async getInterviewReport(sessionId: string, req: Request) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Unauthorized.');

    const interviewReport = await this.prismaService.interviewReport.findUnique(
      {
        where: {
          sessionId,
        },
        include: {
          session: true,
        },
      },
    );

    if (!interviewReport)
      throw new NotFoundException('Interview report not found.');

    return {
      success: true,
      message: 'Interview report fetched successfully.',
      report: interviewReport,
    };
  }
}
