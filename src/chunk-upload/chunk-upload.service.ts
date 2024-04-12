import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as stream from 'stream';

@Injectable()
export class ChunkUploadService {
  async handleChunk(
    chunk: Buffer,
    offset: number,
    fileName: string,
    contentLength: number,
  ): Promise<string> {
    // Initialize AWS S3
    const s3 = new AWS.S3({
      endpoint: 'https://s3.us-west-004.backblazeb2.com',
      // Set access key and secret key for authorization
      credentials: {
        accessKeyId: '004c793eb828ace0000000004',
        secretAccessKey: 'K004H1NvDQ+d9fD9sy9iBsYzd8f4/r8',
      },
    });

    // Define S3 bucket name
    const Bucket = 'ok767777';

    // Create a PassThrough stream to store chunks
    const bufferStream = new stream.PassThrough();

    // Write the received chunk to the stream
    bufferStream.write(chunk);

    // Check if the content is the final chunk
    if (offset + chunk.length >= contentLength) {
      bufferStream.end();
    }

    // Upload the file to S3
    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket,
      Key: fileName, // Use the fileName as the key in S3
      Body: bufferStream,
    };

    const uploadResult = await s3.upload(uploadParams).promise();

    // Return the URL of the uploaded file
    return uploadResult.Location;
  }
}
