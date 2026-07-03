import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma/prisma.service';
import GeneratePracticeSessionInputDto from './dto/generate-practice-session.dto';

@Injectable()
export class PracticeService {
  constructor(private readonly prismaService: PrismaService) {}

  async generatePracticeSession(
    resumeId: string,
    data: GeneratePracticeSessionInputDto,
    req: Request,
  ) {
    const userId = req.user?.id;

    if (!userId) throw new UnauthorizedException('Please Login.');

    const { difficulty, targetRole } = data;

    const resume = await this.prismaService.resume.findUnique({
      where: {
        userId,
        id: resumeId,
      },
    });

    if (!resume || !resume.rawText)
      throw new NotFoundException('No such Resume found.');

    const practiceSession = await this.prismaService.practiceSession.create({
      data: {
        difficulty,
        targetRole,
        userId,
        resumeId,
        questions: {},
      },
    });
  }
}
