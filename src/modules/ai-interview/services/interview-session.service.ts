import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import JoinInterviewDto from '../dto/join-interview.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { InterviewStatus } from 'generated/prisma/enums';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { AiEngineService } from 'src/modules/ai-engine/ai-engine.service';

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

    await client.join(`interview:${sessionId}`);

    const { message } =
      await this.aiEngineService.generateInterviewSessionMessage(
        session.user.name || '',
        session.targetRole,
        session.difficulty,
        session.resume.aiSummary ?? session.resume.rawText ?? '',
      );

    if (!message)
      throw new WsException({
        code: 'AI_ERROR',
        message: 'Failed to generate interview session message.',
      });

    return client.emit('JOIN_INTERVIEW', {
      status: 200,
      data: { message },
    });
  }
}
