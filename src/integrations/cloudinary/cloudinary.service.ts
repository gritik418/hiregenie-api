import { Inject, Injectable } from '@nestjs/common';
import { UploadApiOptions, v2 } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinary: typeof v2) {}

  async uploadFile(file: Express.Multer.File, options?: UploadApiOptions) {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream(
          { resource_type: 'auto', folder: 'hiregenie/resumes' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }
}
