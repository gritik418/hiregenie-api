import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CloudinaryService } from 'src/integrations/cloudinary/cloudinary.service';

@Injectable()
export class ResumeService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly prismaService: PrismaService,
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
}
