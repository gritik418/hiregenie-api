import {
  Controller,
  UseInterceptors,
  UploadedFile,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadResume(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    return this.resumeService.uploadResume(file, req);
  }
}
