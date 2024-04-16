// stream-email.controller.ts
import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
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
      Key: 'Sent-001.mbox', // Update with your S3 file key
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
        'https://ok767777.s3.us-west-004.backblazeb2.com/Sent-001.mbox';
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

@Controller('stream-email3')
export class StreamEmailController3 {
  @Get()
  async streamEmail(@Res() res: Response): Promise<void> {
    try {
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
        Key: 'Sent-001.mbox', // Update with your S3 file key
      };

      const s3Stream = s3.getObject(s3Params).createReadStream();

      res.setHeader(
        'Content-Disposition',
        'attachment; filename="All_mail_Including_Spam_and_Trash.mbox"',
      );

      let count = 0;
      s3Stream.on('data', (chunk) => {
        if (count++ < 500) {
          res.write(chunk);
          // Emit progress to the client
          this.emitProgress(count);
        } else {
          res.end();
        }
      });

      s3Stream.on('end', () => {
        res.end();
      });
    } catch (error) {
      console.error('Error streaming file:', error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: 'Failed to stream file' });
    }
  }

  // Method to emit progress to client
  emitProgress(count: number): void {
    // Implement progress emitting logic here
  }
}

// Not workking?
@Controller('stream-email4')
export class StreamEmailController4 {
  @Get()
  async getEmailStream(
    @Query('chunkIndex') chunkIndex: number,
    @Res() res: Response,
  ) {
    try {
      const fileUrl =
        'https://ok767777.s3.us-west-004.backblazeb2.com/Sent-001.mbox';
      const response = await axios.get(fileUrl, { responseType: 'stream' });

      res.setHeader('Content-Type', 'text/plain');

      let totalBytesRead = 0;
      response.data.on('data', (chunk: Buffer) => {
        totalBytesRead += chunk.length;
        if (totalBytesRead > 5000) {
          res.end();
        } else {
          res.write(chunk);
        }
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

@Controller('stream-email5')
export class StreamEmailController5 {
  @Get()
  async getEmailStream(
    @Query('chunkIndex') chunkIndex: number,
    @Res() res: Response,
  ) {
    try {
      const fileUrl =
        'https://ok767777.s3.us-west-004.backblazeb2.com/Sent-001.mbox';
      const response = await axios.get(fileUrl, { responseType: 'stream' });

      res.setHeader('Content-Type', 'text/plain');

      // Stream file in chunks of 10KB
      response.data.on('data', (chunk: Buffer) => {
        let offset = 0;
        const chunkSize = 10240; // 10KB in bytes
        while (offset < chunk.length) {
          res.write(
            chunk.slice(offset, Math.min(offset + chunkSize, chunk.length)),
          );
          offset += chunkSize;
        }
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

@Controller('stream-email6')
export class StreamEmailController6 {
  @Get()
  async streamEmail(
    @Query('chunkIndex') chunkIndex: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const chunkSize = 4000; // Number of emails to fetch per request
      const start = (chunkIndex - 1) * chunkSize; // Calculate start index based on chunkIndex
      const end = start + chunkSize - 1; // Calculate end index

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
        Key: 'Sent-001.mbox', // Update with your S3 file key
        Range: `bytes=${start}-${end}`, // Specify range for fetching data
      };

      const s3Stream = s3.getObject(s3Params).createReadStream();

      res.setHeader(
        'Content-Disposition',
        'attachment; filename="All_mail_Including_Spam_and_Trash.mbox"',
      );

      s3Stream.pipe(res);
    } catch (error) {
      console.error('Error streaming file:', error);
      res.status(500).send({ error: 'Failed to stream file' });
    }
  }
}
@Controller('stream-email7')
export class StreamEmailController7 {
  @Get()
  async streamEmail(
    @Query('chunkIndex') chunkIndex: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const chunkSize = 20000; // Number of emails to fetch per request
      const start = (chunkIndex - 1) * chunkSize; // Calculate start index based on chunkIndex
      const end = start + chunkSize - 1; // Calculate end index

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
        Key: 'Sent-001.mbox', // Update with your S3 file key
        Range: `bytes=${start}-${end}`, // Specify range for fetching data
      };

      const s3Object = await s3.getObject(s3Params).promise();

      if (!s3Object.Body) {
        throw new Error('Empty response from S3');
      }

      const mboxData: Buffer = s3Object.Body as Buffer;

      // Convert mbox data to string
      const mboxText = mboxData.toString('utf-8');

      // Split mbox data into individual emails
      const emails = mboxText.split(/^From\s/m);

      // Process each email
      for (const email of emails) {
        // Skip empty email
        if (!email.trim()) continue;

        // Separate email headers and content
        const [header, content] = email.split(/\r?\n\r?\n/);
        const headers = header.split(/\r?\n/);

        // Extract email metadata
        const emailMetadata: any = {};
        for (const headerLine of headers) {
          const [key, value] = headerLine.split(/:\s/);
          emailMetadata[key.toLowerCase()] = value;
        }

        // Extract attachments (if any)
        const attachments: any[] = [];
        if (content) {
          // Assuming attachments are encoded as base64
          const attachmentRegex =
            /\r?\nContent-Type:.*?;.*?name="(.*?)".*?\r?\nContent-Transfer-Encoding:.*?base64\r?\n\r?\n([\s\S]*?)(?=\r?\nFrom\s|$)/g;
          let match;
          while ((match = attachmentRegex.exec(content)) !== null) {
            const filename = match[1];
            const data = Buffer.from(match[2], 'base64');
            attachments.push({ filename, data });
          }
        }

        // Process the email and attachments as needed
      }

      // Send response
      res.status(200).send('Emails processed successfully.');
    } catch (error) {
      console.error('Error streaming file:', error);
      res.status(500).send({ error: 'Failed to stream file' });
    }
  }
}
