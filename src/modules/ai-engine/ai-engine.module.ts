import { Module } from '@nestjs/common';
import { AiEngineController } from './ai-engine.controller';
import { AiEngineService } from './ai-engine.service';
import { MatchResumeChain } from './chains/match-resume.chain';

@Module({
  controllers: [AiEngineController],
  providers: [AiEngineService, MatchResumeChain],
  exports: [AiEngineService, MatchResumeChain],
})
export class AiEngineModule {}
