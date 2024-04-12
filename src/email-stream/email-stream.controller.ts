import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { EmailStreamService } from './email-stream.service';

@Controller('email-stream')
export class EmailStreamController {
  constructor(private readonly emailStreamService: EmailStreamService) {}

  @Get()
  async getEmailStream(@Res() res: Response) {
    try {
      const dataStream = await this.emailStreamService.getEmailStream();
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="email_data.mbox"',
      );
      dataStream.pipe(res);
    } catch (error) {
      console.error('Error streaming email data:', error);
      res.status(500).send('Internal Server Error');
    }
  }
}
