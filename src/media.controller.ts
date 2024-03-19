import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';

@Controller('media')
export class MediaController {
  constructor(private httpService: HttpService) {}

  @Post('uploads/:client') // Updated route to include the client ID
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Param('client') client: string, // Extract the client ID from the URL
  ) {
    try {
      if (!file) {
        return { success: false, message: 'No file uploaded' };
      }

      // Read the file into a buffer
      const fileBuffer = fs.readFileSync(file.path);

      // Delete the temporary file created by multer
      fs.unlinkSync(file.path);

      // Upload the file buffer to another API via webhook
      const webhookUrl =
        'https://snap-jj3media-icloud-com.eu-1.celonis.cloud/ems-automation/public/api/root/a0e537b1-b88f-434c-a659-0cadea64b085/hook/acgonuudtu441k97whj3xp8ykm9pme2s'; // Replace with your webhook URL
      const response = await this.httpService
        .post(webhookUrl, {
          fileId: uuidv4(), // Generate a unique ID for the file
          filename: file.originalname,
          client,
          file: fileBuffer, // Include the file buffer in the payload
        })
        .toPromise();

      // Handle response from the webhook
      console.log('Webhook response:', response.data);

      return { success: true, message: 'Media uploaded successfully' };
    } catch (error) {
      console.error('Error uploading media:', error.message);
      return { success: false, message: 'Error uploading media' };
    }
  }
}
