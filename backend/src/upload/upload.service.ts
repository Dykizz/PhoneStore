import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  private translateError = (error: Error): string => {
    const transferError = {
      'Invalid image file': 'Định dạng tệp không hợp lệ',
      'File size too large': 'Kích thước tệp quá lớn',
      'Authentication error': 'Lỗi xác thực',
      'Upload limit exceeded': 'Vượt quá giới hạn tải lên',
    };
    const errorMessage = Object.keys(transferError).find(msg =>
      error.message.includes(msg),
    );
    return errorMessage ? transferError[errorMessage] : error.message;
  };

  private extractPublicId(url: string): string | null {
    const matches = url.match(
      /\/upload\/(?:v\d+\/)?(.+)\.(jpg|jpeg|png|webp)$/,
    );
    return matches ? matches[1] : null;
  }

  async deleteImage(publicId: string): Promise<any> {
    return await cloudinary.uploader.destroy(publicId);
  }

  async deleteMultipleImagesByPublicIds(
    publicIds: string[],
    concurrency = 3,
  ): Promise<(undefined | string)[]> {
    let index = 0;
    const results: (undefined | string)[] = [];
    const worker = async () => {
      while (true) {
        const currentIndex = index++;
        if (currentIndex >= publicIds.length) break;

        const id = publicIds[currentIndex];
        try {
          await this.deleteImage(id);
          results[currentIndex] = undefined;
        } catch (error) {
          const errMsg = this.translateError(error);
          results[currentIndex] = errMsg;
          console.error(`Lỗi khi xóa ảnh ${id}:`, errMsg);
        }
      }
    };

    await Promise.all(Array.from({ length: concurrency }, () => worker()));
    return results;
  }

  async deleteMultipleImagesByUrls(
    imageUrls: string[],
    concurrency = 3,
  ): Promise<(void | string)[]> {
    const publicIds = imageUrls
      .map(url => this.extractPublicId(url))
      .filter(Boolean);

    return await this.deleteMultipleImagesByPublicIds(publicIds, concurrency);
  }

  async getSignature() {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: 'uploads',
        upload_preset: 'ml_default',
        access_mode: 'public',
      },
      process.env.CLOUDINARY_API_SECRET,
    );

    return {
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    };
  }
}
