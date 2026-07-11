import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import {
  InterviewMessageRole,
  InterviewReportStatus,
  InterviewStatus,
} from 'generated/prisma/enums';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AiEngineService } from 'src/modules/ai-engine/ai-engine.service';
import { InterviewEvents } from '../constants/interview.events';
import HandleAnswerDto from '../dto/handle-answer.dto';
import JoinInterviewDto from '../dto/join-interview.dto';

@Injectable()
export class InterviewSessionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly aiEngineService: AiEngineService,
  ) {}

  async joinInterview(client: Socket, data: JoinInterviewDto) {
    const sessionId = data.sessionId;
    if (!sessionId)
      throw new WsException({
        code: 'INVALID_INPUT',
        message: 'Session Id is required',
      });

    const session = await this.prismaService.interviewSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        resume: {
          select: {
            aiSummary: true,
            rawText: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!session)
      throw new WsException({
        code: 'SESSION_NOT_FOUND',
        message: 'Interview session not found',
      });

    if (session.status !== InterviewStatus.IN_PROGRESS)
      throw new WsException({
        code: 'SESSION_NOT_IN_PROGRESS',
        message: 'Interview session is not in progress',
      });

    if (session.userId !== client.user.id)
      throw new WsException({
        code: 'UNAUTHORIZED',
        message: 'You are not authorized to join this session',
      });

    const hasMessages = session.messages && session.messages.length > 0;

    client.emit(InterviewEvents.JOINED, {
      status: 200,
      data: {
        sessionId,
        message: hasMessages
          ? 'Welcome back to the interview session!'
          : 'Welcome to the interview session!',
        history: session.messages,
      },
    });

    await client.join(`interview:${sessionId}`);

    if (!hasMessages) {
      client.emit(InterviewEvents.THINKING, {
        status: 200,
        data: { sessionId, thinking: true },
      });

      const { message } =
        await this.aiEngineService.generateInterviewSessionMessage(
          session.user.name || '',
          session.targetRole,
          session.difficulty,
          session.resume.aiSummary ?? session.resume.rawText ?? '',
        );

      client.emit(InterviewEvents.THINKING, {
        status: 200,
        data: { sessionId, thinking: false },
      });

      if (!message)
        throw new WsException({
          code: 'AI_ERROR',
          message: 'Failed to generate interview session message.',
        });

      client.emit(InterviewEvents.MESSAGE, {
        status: 200,
        data: { message },
      });

      await this.prismaService.interviewMessage.create({
        data: {
          sessionId,
          message: message,
          role: InterviewMessageRole.ASSISTANT,
        },
      });
    }
  }

  async handleAnswer(client: Socket, data: HandleAnswerDto) {
    const { sessionId, answer } = data;

    if (!sessionId)
      throw new WsException({
        code: 'INVALID_INPUT',
        message: 'Session Id is required',
      });

    if (!answer)
      throw new WsException({
        code: 'INVALID_INPUT',
        message: 'Answer is required',
      });

    const session = await this.prismaService.interviewSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        resume: {
          select: {
            aiSummary: true,
            rawText: true,
          },
        },
      },
    });

    if (!session)
      throw new WsException({
        code: 'SESSION_NOT_FOUND',
        message: 'Interview session not found',
      });

    if (session.status !== InterviewStatus.IN_PROGRESS)
      throw new WsException({
        code: 'SESSION_NOT_IN_PROGRESS',
        message: 'Interview session is not in progress',
      });

    if (session.userId !== client.user.id)
      throw new WsException({
        code: 'UNAUTHORIZED',
        message: 'You are not authorized to join this session',
      });

    await this.prismaService.interviewMessage.create({
      data: {
        sessionId,
        message: answer,
        role: InterviewMessageRole.USER,
      },
    });

    const messages = await this.prismaService.interviewMessage.findMany({
      where: {
        sessionId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    client.emit(InterviewEvents.THINKING, {
      status: 200,
      data: { sessionId, thinking: true },
    });

    const { message: aiMessageContent, isLastMessage } =
      await this.aiEngineService.generateInterviewMessage(
        session.user.name || '',
        session.targetRole,
        session.difficulty,
        session.resume.aiSummary ?? session.resume.rawText ?? '',
        messages,
      );

    client.emit(InterviewEvents.THINKING, {
      status: 200,
      data: { sessionId, thinking: false },
    });

    if (!aiMessageContent)
      throw new WsException({
        code: 'AI_ERROR',
        message: 'Failed to generate interview session message response.',
      });

    client.emit(InterviewEvents.MESSAGE, {
      status: 200,
      data: { message: aiMessageContent, isLastMessage: !!isLastMessage },
    });

    await this.prismaService.interviewMessage.create({
      data: {
        sessionId,
        message: aiMessageContent,
        role: InterviewMessageRole.ASSISTANT,
      },
    });

    if (isLastMessage) {
      client.emit(InterviewEvents.SESSION_ENDED, {
        status: 200,
        data: { sessionId },
      });

      await this.prismaService.interviewSession.update({
        where: {
          id: sessionId,
        },
        data: {
          status: InterviewStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    }
  }

  async generateInterviewReport(sessionId: string) {
    const session = await this.prismaService.interviewSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        resume: {
          select: {
            aiSummary: true,
            rawText: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!session)
      throw new WsException({
        code: 'SESSION_NOT_FOUND',
        message: 'Interview session not found',
      });

    if (session.status !== InterviewStatus.COMPLETED)
      throw new WsException({
        code: 'SESSION_NOT_COMPLETED',
        message: 'Interview session is not completed',
      });

    const report = await this.aiEngineService.generateInterviewSessionReport(
      session.user.name || '',
      session.targetRole,
      session.difficulty,
      session.resume.aiSummary ?? session.resume.rawText ?? '',
      session.messages,
      false,
    );

    if (!report) {
      await this.prismaService.interviewReport.create({
        data: {
          sessionId,
          status: InterviewReportStatus.FAILED,
        },
      });

      throw new WsException({
        code: 'AI_ERROR',
        message: 'Failed to generate interview session report.',
      });
    }

    await this.prismaService.interviewReport.create({
      data: {
        sessionId,
        status: InterviewReportStatus.COMPLETED,
        ...report,
      },
    });

    return report;
  }
}
