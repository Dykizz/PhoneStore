import { Controller } from '@nestjs/common';
import { EmailService } from './mail.service';


@Controller('mail')
export class MailController {
  constructor(private readonly mailService: EmailService) {}
}
