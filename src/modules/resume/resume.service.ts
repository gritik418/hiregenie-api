import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CloudinaryService } from 'src/integrations/cloudinary/cloudinary.service';
import { AiEngineService } from '../ai-engine/ai-engine.service';
import { PdfParserService } from './parsers/pdf-parser.service';

@Injectable()
export class ResumeService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly prismaService: PrismaService,
    private readonly aiEngineService: AiEngineService,
    private readonly pdfParser: PdfParserService,
  ) {}

  async uploadResume(file: Express.Multer.File, req: Request) {
    const userId = req.user?.id;

    if (!userId) throw new BadRequestException('Unauthenticated.');

    if (!file) throw new BadRequestException('No file uploaded.');

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        'Invalid file type. Only PDF files are allowed.',
      );
    }

    const rawText = await this.pdfParser.parseBuffer(file.buffer);

    if (!rawText || rawText.trim().length === 0)
      throw new BadRequestException(
        'Failed to extract text from resume. Please try again or upload a different file.',
      );

    const { summary } = await this.aiEngineService.generateAiSummary(rawText);

    if (!summary)
      throw new BadRequestException(
        'Failed to generate AI summary. Please try again.',
      );

    const uploadedFile = await this.cloudinaryService.uploadFile(file);

    if (!uploadedFile?.public_id || !uploadedFile?.secure_url)
      throw new BadRequestException('Something went wrong. Please try again.');

    const uploadedResume = await this.prismaService.resume.create({
      data: {
        userId,
        fileUrl: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
        fileSize: uploadedFile.bytes,
        fileName: uploadedFile.fileName!,
        fileType: uploadedFile.mimetype!,
        rawText,
        aiSummary: summary,
      },
    });

    return {
      success: true,
      message: 'Resume uploaded successfully.',
      resume: {
        url: uploadedResume.fileUrl,
        fileName: uploadedResume.fileName,
        fileSize: uploadedResume.fileSize,
        fileType: uploadedResume.fileType,
      },
    };
  }

  async getResumes(req: Request) {
    const userId = req.user?.id;

    if (!userId) throw new BadRequestException('Unauthenticated.');

    const resumes = await this.prismaService.resume.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        fileType: true,
        fileUrl: true,
        createdAt: true,
        updatedAt: true,
        aiSummary: true,
        rawText: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, message: 'Resumes fetched successfully.', resumes };
  }

  async getResume(resumeId: string, req: Request) {
    const userId = req.user?.id;

    if (!userId) throw new BadRequestException('Unauthenticated.');

    const resume = await this.prismaService.resume.findUnique({
      where: {
        id: resumeId,
      },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        fileType: true,
        fileUrl: true,
        createdAt: true,
        updatedAt: true,
        rawText: true,
        aiSummary: true,
      },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found.');
    }

    return { success: true, message: 'Resume fetched successfully.', resume };
  }
}
