import { Module } from '@nestjs/common';
import { AiInterviewController } from './ai-interview.controller';
import { AiInterviewService } from './ai-interview.service';
import { InterviewGateway } from './gateways/interview.gateway';
import { InterviewSessionService } from './services/interview-session.service';
import { AiEngineModule } from '../ai-engine/ai-engine.module';

@Module({
  imports: [AiEngineModule],
  controllers: [AiInterviewController],
  providers: [AiInterviewService, InterviewGateway, InterviewSessionService],
})
export class AiInterviewModule {}
