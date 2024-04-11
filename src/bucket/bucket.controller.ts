import { Controller, Post, Body } from '@nestjs/common';
import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3';

@Controller('buckets')
export class BucketController {
  @Post()
  async createBucket(@Body() body: { bucketName: string }) {
    try {
      // Configure Scaleway S3 client (AWS SDK version 3)
      const s3 = new S3Client({
        credentials: {
          accessKeyId: '004c793eb828ace0000000004', // Replace with your Scaleway access key
          secretAccessKey: 'K004H1NvDQ+d9fD9sy9iBsYzd8f4/r8', // Replace with your Scaleway secret key
        },
        region: 'us-west-004', // Replace with your desired region
        endpoint: 'https://s3.us-west-004.backblazeb2.com', // Correct Scaleway S3 endpoint
      });

      // Create a new bucket
      const createBucketParams = {
        Bucket: body.bucketName,
      };

      const command = new CreateBucketCommand(createBucketParams);
      const createBucketResponse = await s3.send(command);

      console.log('Bucket created:', createBucketResponse);

      // Handle other logic, response, etc.

      return { message: 'Bucket created successfully' };
    } catch (error) {
      console.error('Error creating bucket:', error);
      throw new Error('Error creating bucket');
    }
  }
}
