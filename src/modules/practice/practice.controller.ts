import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation/zod-validation.pipe';
import GeneratePracticeSessionSchema from './schemas/generate-practice-session.schema';
import GeneratePracticeSessionInputDto from './dto/generate-practice-session.dto';
import { Request } from 'express';

@Controller('practice')
@UseGuards(AuthGuard)
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Post(':resumeId/generate')
  generatePracticeSession(
    @Param('resumeId') resumeId: string,
    @Body(new ZodValidationPipe(GeneratePracticeSessionSchema))
    data: GeneratePracticeSessionInputDto,
    @Req() req: Request,
  ) {
    return this.practiceService.generatePracticeSession(resumeId, data, req);
  }
}
