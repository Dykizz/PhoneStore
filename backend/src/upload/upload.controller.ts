import { Controller, Get } from '@nestjs/common';
import { UploadService } from './upload.service';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('signature')
  @ResponseMessage('Lấy chữ ký upload ảnh thành công')
  async getSignature() {
    return await this.uploadService.getSignature();
  }
}
