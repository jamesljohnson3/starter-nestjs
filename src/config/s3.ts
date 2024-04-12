import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as stream from 'stream';

@Injectable()
export class ChunkUploadService {
  async handleChunk(req: any): Promise<string> {
    // Initialize AWS S3
    const s3 = new AWS.S3({
      accessKeyId: 'YOUR_ACCESS_KEY_ID',
      secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
    });

    // Define S3 bucket name
    const Bucket = 'YOUR_S3_BUCKET_NAME';

    // Create a stream to store chunks
    const chunks = [];
    const bufferStream = new stream.PassThrough();

    req.on('data', (chunk) => {
      chunks.push(chunk);
      bufferStream.write(chunk);
    });

    // Wait for the stream to end
    await new Promise<void>((resolve) => {
      req.on('end', () => {
        bufferStream.end();
        resolve();
      });
    });

    // Upload the file to S3
    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket,
      Key: 'YOUR_FILE_KEY', // Define your own file key here
      Body: bufferStream,
    };

    const uploadResult = await s3.upload(uploadParams).promise();

    // Return the URL of the uploaded file
    return uploadResult.Location;
  }
}
