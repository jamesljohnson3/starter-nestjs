import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Req,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { EventsService } from './events.service';
import { HttpService } from '@nestjs/axios';

@Controller('media')
export class MediaController {
  constructor(
    private httpService: HttpService,
    private eventsService: EventsService, // Inject the EventsService
  ) {}

  @Post('upload/:client') // Updated route to include the client ID
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Param('client') client: string, // Extract the client ID from the URL
  ) {
    try {
      if (!file) {
        return { success: false, message: 'No file uploaded' };
      }

      // Save the file internally (you can save it to a database, filesystem, etc.)
      const fileId = uuidv4(); // Generate a unique ID for the file
      // Implement your logic to save the file (e.g., store it in a database or filesystem)

      // Upload the saved file to another API via webhook
      const webhookUrl =
        'https://snap-jj3media-icloud-com.eu-1.celonis.cloud/ems-automation/public/api/root/a0e537b1-b88f-434c-a659-0cadea64b085/hook/acgonuudtu441k97whj3xp8ykm9pme2s'; // Replace with your webhook URL
      const response = await this.httpService
        .post(webhookUrl, { fileId, filename: file.originalname, client }) // Include the client ID in the payload
        .toPromise();

      // Handle response from the webhook
      console.log('Webhook response:', response.data);

      // Send notification message
      this.eventsService.sendMessage(
        client, // Use the provided client ID
        'notification',
        '✅ Success, File uploaded successfully',
      );

      return { success: true, message: 'Media uploaded successfully', fileId };
    } catch (error) {
      console.error('Error uploading media:', error.message);
      return { success: false, message: 'Error uploading media' };
    }
  }

  @Get(':id') // Route to fetch media by ID
  getMediaById(@Param('id') id: string) {
    // Implement logic to fetch media by ID
    return `Media with ID ${id}`;
  }

  // Reusing the SSE endpoint from the AppController
  @Get('sse/:client')
  sse(
    @Param('client') client: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    req.on('close', () => this.eventsService.removeClient(client));
    return this.eventsService.addClient(client, res);
  }
}
