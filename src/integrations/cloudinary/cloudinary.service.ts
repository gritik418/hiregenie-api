import { Inject, Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';

interface CustomUploadApiResponse extends UploadApiResponse {
  fileName?: string;
  mimetype?: string;
}

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinary: typeof v2) {}

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<CustomUploadApiResponse> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream(
          { resource_type: 'raw', folder: 'hiregenie/resumes' },
          (error, result: UploadApiResponse) => {
            if (error) return reject(error);

            const formattedResult: CustomUploadApiResponse = {
              ...result,
              fileName: file.originalname,
              mimetype: file.mimetype,
            };

            resolve(formattedResult);
          },
        )
        .end(file.buffer);
    });
  }
}
