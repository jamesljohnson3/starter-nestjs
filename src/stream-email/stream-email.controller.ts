// stream-email.controller.ts
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import * as AWS from 'aws-sdk';
import axios from 'axios';

@Controller('stream-email')
export class StreamEmailController {
  @Get()
  async streamEmail(@Res() res: Response): Promise<void> {
    const s3 = new AWS.S3({
      endpoint: 'https://s3.us-west-004.backblazeb2.com',
      // Set access key and secret key for authorization
      credentials: {
        accessKeyId: '004c793eb828ace0000000004',
        secretAccessKey: 'K004H1NvDQ+d9fD9sy9iBsYzd8f4/r8',
      },
    });

    const s3Params = {
      Bucket: 'ok767777', // Update with your S3 bucket name
      Key: 'Sent.mbox', // Update with your S3 file key
    };

    const s3Stream = s3.getObject(s3Params).createReadStream();

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="All_mail_Including_Spam_and_Trash.mbox"',
    );

    s3Stream.pipe(res);
  }
}
@Controller('stream-email2')
export class StreamEmailController2 {
  @Get()
  async getEmailStream(
    @Query('chunkIndex') chunkIndex: number,
    @Res() res: Response,
  ) {
    try {
      const fileUrl =
        'https://ok767777.s3.us-west-004.backblazeb2.com/All+mail+Including+Spam+and+Trash.mbox';
      const response = await axios.get(fileUrl, { responseType: 'stream' });

      res.setHeader('Content-Type', 'text/plain');

      // Stream file in chunks of 1MB
      response.data.on('data', (chunk: Buffer) => {
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
