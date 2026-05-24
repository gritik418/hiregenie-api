import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CloudinaryService } from 'src/integrations/cloudinary/cloudinary.service';
import { AiEngineService } from '../ai-engine/ai-engine.service';
import RawTextNormalizerOutputDto from './dto/rawTextNormalizerOutput.dto';
import RawTextNormalizerResponseSchema from './schemas/rawTextNormalizerResponse.schema';

@Injectable()
export class ResumeService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly prismaService: PrismaService,
    private readonly aiEngineService: AiEngineService,
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

    const uploadedFile = await this.cloudinaryService.uploadFile(file);

    const uploadedResume = await this.prismaService.resume.create({
      data: {
        userId,
        fileUrl: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
        fileSize: uploadedFile.bytes,
        fileName: uploadedFile.fileName!,
        fileType: uploadedFile.mimetype!,
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
      },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found.');
    }

    return { success: true, message: 'Resume fetched successfully.', resume };
  }

  async resumeRawTextNormalizer(resumeId: string) {
    const resume = await this.prismaService.resume.findUnique({
      where: {
        id: resumeId,
      },
    });

    if (!resume || !resume.rawText) {
      throw new BadRequestException('Resume not found or no raw text.');
    }

    const normalizePrompt = `
You are a resume text normalizer.

Your task:
Clean and restructure poorly extracted resume text into a properly formatted resume.

IMPORTANT:
- Preserve ALL original information
- DO NOT invent content
- DO NOT summarize
- DO NOT remove content
- DO NOT rewrite achievements
- ONLY fix formatting and structure

Fix:
- broken line ordering
- misplaced dates
- merged text
- missing spacing
- section grouping
- bullet formatting

Return a CLEAN structured resume with sections:

SUMMARY
PROFESSIONAL EXPERIENCE
PROJECTS
SKILLS
EDUCATION

Rules:
- Keep role titles with their dates
- Keep company names with roles
- Keep bullets under correct sections
- Keep project descriptions grouped correctly
- Preserve URLs
- Preserve technologies

RAW RESUME:
${resume.rawText}
`;

    const output = await this.aiEngineService.generateResponseInJSON(
      normalizePrompt,
      RawTextNormalizerResponseSchema,
    );

    return {
      success: true,
      message: 'Resume normalized successfully.',
      normalizedText: output.normalizedText,
    };
  }
}
