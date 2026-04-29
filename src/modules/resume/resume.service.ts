import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/integrations/cloudinary/cloudinary.service';

@Injectable()
export class ResumeService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadResume(file: Express.Multer.File) {
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        'Invalid file type. Only PDF files are allowed.',
      );
    }

    const uploadedFile = await this.cloudinaryService.uploadFile(file);

    return {
      success: true,
      file: {
        public_id: uploadedFile.public_id,
        url: uploadedFile.secure_url,
      },
    };
  }
}
