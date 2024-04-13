// stream-email.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import axios from 'axios';

@Controller('stream-email')
export class StreamEmailController {
  @Get()
  async getEmailStream(@Res() res) {
    try {
      const fileUrl =
        'https://ok767777.s3.us-west-004.backblazeb2.com/Sent.mbox';
      const response = await axios.get(fileUrl, { responseType: 'stream' });

      res.setHeader('Content-Type', 'text/plain');

      // Stream file in chunks of 1MB
      response.data.on('data', (chunk) => {
        res.write(chunk);
      });

      response.data.on('end', () => {
        res.end();
      });
    } catch (error) {
      console.error('Error streaming file:', error);
      res.status(500).send({ error: 'Failed to stream file' });
    }
  }
}
