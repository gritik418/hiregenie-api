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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
