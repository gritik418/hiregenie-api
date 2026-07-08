import { Module } from '@nestjs/common';
import { AiInterviewController } from './ai-interview.controller';
import { AiInterviewService } from './ai-interview.service';
import { InterviewGateway } from './gateways/interview.gateway';

@Module({
  controllers: [AiInterviewController],
  providers: [AiInterviewService, InterviewGateway],
})
export class AiInterviewModule {}
