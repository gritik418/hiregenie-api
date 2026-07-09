import {
  BadRequestException,
  Injectable,
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
}
