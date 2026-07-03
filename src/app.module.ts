import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HashingModule } from './common/hashing/hashing.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { CloudinaryModule } from './integrations/cloudinary/cloudinary.module';
import { AuthModule } from './modules/auth/auth.module';
import { ResumeModule } from './modules/resume/resume.module';
import { UserModule } from './modules/user/user.module';
import { ResumeAnalysisModule } from './modules/resume-analysis/resume-analysis.module';
import { AiEngineModule } from './modules/ai-engine/ai-engine.module';
import { AiInterviewModule } from './modules/ai-interview/ai-interview.module';
import { PracticeModule } from './modules/practice/practice.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    HashingModule,
    PrismaModule,
    ResumeModule,
    CloudinaryModule,
    UserModule,
    ResumeAnalysisModule,
    AiEngineModule,
    AiInterviewModule,
    PracticeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
