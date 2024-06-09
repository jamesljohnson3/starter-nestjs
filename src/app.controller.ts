import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Query,
  Param,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import * as csvParser from 'csv-parser';
import { HttpService } from '@nestjs/axios';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import * as fs from 'node:fs';
import { AppService } from './app.service';
import { EventsService } from './events.service';
import * as fastcsv from 'fast-csv';
import { DataService } from './data/data.service';
import * as Sharp from 'sharp';

interface ApiResponse {
  message: string;
  key: string;
  isValid: boolean;
  webhookResponseData?: any[]; // Change this to the desired type
}

interface PostData {
  field1: string;
  field2: string;
  // Add more fields as needed
}

@Controller()
export class AppController {
  private readonly allowedUUID = '22-22-22'; // Replace with your authorized UUID
  private webhookUrls = [
    'https://snap-jj3media-icloud-com.eu-1.celonis.cloud/ems-automation/public/api/root/a0e537b1-b88f-434c-a659-0cadea64b085/hook/f03auw3rub1gl5djqehmslc4rpm8j33e', // Replace this with your actual webhook URL
    'https://snap-jj3media-icloud-com.eu-1.celonis.cloud/ems-automation/public/api/root/a0e537b1-b88f-434c-a659-0cadea64b085/hook/acgonuudtu441k97whj3xp8ykm9pme2s', // Replace this with your second webhook URL
    'https://snap-jj3media-icloud-com.eu-1.celonis.cloud/ems-automation/public/api/root/a0e537b1-b88f-434c-a659-0cadea64b085/hook/30sskndje19f0ws6ablrfbfujra8qr89', // Replace this with your third webhook URL
  ];

  constructor(
    private httpService: HttpService,
    private readonly appService: AppService,
    private readonly events: EventsService,
    private readonly eventsService: EventsService,
    private readonly dataService: DataService,
  ) {}

  private isValidUUID(uuid: string): boolean {
    // Validate the provided UUID here (e.g., using a library like "uuid")
    // Return true if the UUID is valid, otherwise return false
    // Replace the example validation logic below with your actual validation logic
    return uuid === this.allowedUUID;
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('sse/:client')
  sse(
    @Param('client') client: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    req.on('close', () => this.events.removeClient(client));
    return this.events.addClient(client, res);
  }

  @Post('ai-events/send/:client')
  sendAIEvent(
    @Param('client') client: string,
    @Body() eventData: any, // Adjust the type as per your AI event structure
  ) {
    try {
      this.eventsService.sendMessage(
        client,
        'ai-event',
        eventData, // Pass the AI event data to sendMessage
      );
      return eventData; // Return the event data back as confirmation
    } catch (error) {
      console.error('Error sending AI event:', error.message);
      throw new Error('Failed to send AI event');
    }
  }

  @Post('notifications/send/:client')
  sendNotification(
    @Param('client') client: string,
    @Body() notificationData: { title: string },
  ) {
    try {
      this.eventsService.sendMessage(
        client,
        'notification',
        notificationData.title,
      ); // Pass only the title
      return {
        title: notificationData.title,
      };
    } catch (error) {
      console.error('Error sending notification:', error.message);
      throw new Error('Failed to send notification');
    }
  }

  @Post('uploads/:client') // Corrected path declaration
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('client') client: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      // Check if file exists
      if (!file) {
        return { message: 'No file uploaded' };
      }

      // Check if file is not CSV
      if (!file.mimetype.includes('csv')) {
        throw new Error('Uploaded file is not a CSV');
      }

      // Process CSV file
      const data: any[] = [];
      fs.createReadStream(file.path)
        .pipe(csvParser())
        .on('data', (row) => {
          // Process each row
          data.push(row);
        })
        .on('end', async () => {
          // Data processing completed
          fs.unlinkSync(file.path); // Remove the uploaded file

          // Process each row and send SSE events
          for (let i = 0; i < data.length; i++) {
            console.log('Received CSV data:', data); // Log the CSV data received
            const rowData = Object.values(data[i]).join(', ');
            console.log('Received Table data:', rowData); // Log the CSV data received
            this.events.sendMessage(client, 'data', rowData);
            await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate delay (optional)
          }

          // Send completion message
          this.events.sendMessage(
            client,
            'notification',
            '✅ Success, File uploaded successfully',
          );
        });

      return { message: 'File upload started' };
    } catch (error) {
      console.error('Error uploading file:', error.message);
      throw error;
    }
  }
  @Post('upload-csv') // Endpoint for uploading CSV file
  @UseInterceptors(FileInterceptor('file')) // Use multer or similar middleware for handling file uploads
  async uploadCSV(@UploadedFile() file, @Res() res: Response) {
    try {
      // Process the uploaded CSV file
      const parsedData = await this.dataService.processUploadedCSV(file); // Implement this method in your DataService

      // Stream processed data to client
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=data.csv');

      const csvStream = fastcsv.format({ headers: true, writeHeaders: true });
      csvStream.pipe(res);

      parsedData.forEach((item) => csvStream.write(item));
      csvStream.end();
    } catch (error) {
      res.status(500).send('Error processing uploaded data');
    }
  }

  @Post('convert-heic-to-jpeg')
  @UseInterceptors(FileInterceptor('file'))
  async convertHeicToJpeg(@UploadedFile() file: Express.Multer.File) {
    try {
      // Check if file is HEIC/HEIF
      if (file.mimetype === 'image/heic' || file.mimetype === 'image/heif') {
        // Convert HEIC/HEIF to JPEG using Sharp
        const buffer = await Sharp(file.buffer).jpeg().toBuffer();
        return {
          message: 'File converted successfully',
          jpegBuffer: buffer,
        };
      } else {
        return {
          message: 'File is not in HEIC/HEIF format',
          fileName: file.originalname,
        };
      }
    } catch (error) {
      console.error('Error converting HEIC file:', error);
      throw new Error('Error converting HEIC file');
    }
  }
  @Get('csv')
  generateCsv() {
    const filePath = './data.csv';
    let csvContent = 'name,email,phone,\n';

    for (let i = 0; i < 100; i++) {
      const name = faker.person.fullName();
      const email = faker.internet.email();
      const phone = faker.phone.number();

      csvContent += `${name},${email},${phone}\n`;
    }

    fs.writeFile(filePath, csvContent, (err) => {
      if (err) {
        console.error('Error writing CSV file:', err);
      } else {
        console.log(`CSV file generated successfully at ${filePath}`);
      }
    });
  }

  @Get('actions')
  async getAction(
    @Headers('authorization') authorizationHeader: string,
    @Query('uuid') uuid: string,
    @Query('field1') field1: string,
    @Query('field2') field2: string,
  ): Promise<ApiResponse> {
    const authorizedUUID = authorizationHeader?.split(' ')[1];

    if (!authorizedUUID || !this.isValidUUID(authorizedUUID)) {
      return { message: 'Unauthorized', isValid: false, key: 'null' };
    }

    const response: ApiResponse = {
      message: 'Hello, World!',
      isValid: true,
      key: '123456789',
    };
    console.log('UUID:', uuid);
    console.log('Field 1:', field1);
    console.log('Field 2:', field2);

    try {
      const webhookResponses = await Promise.all(
        this.webhookUrls.map((url) =>
          this.httpService
            .post(url, {
              key: 'content',
              field1,
              field2, // Add more fields as needed
            })
            .toPromise(),
        ),
      );

      response.webhookResponseData = webhookResponses.map((res) => res.data);
    } catch (error) {
      console.error('Error fetching data from webhook:', error.message);
      response.webhookResponseData = [];
    }

    return response;
  }

  @Post('actions')
  async postAction(
    @Headers('authorization') authorizationHeader: string,
    @Body() body: PostData,
  ): Promise<ApiResponse> {
    const authorizedUUID = authorizationHeader?.split(' ')[1];

    if (!authorizedUUID || !this.isValidUUID(authorizedUUID)) {
      return { message: 'Unauthorized', isValid: false, key: 'null' };
    }
    const { field1, field2 } = body;

    const response: ApiResponse = {
      message: 'Hello, World!',
      isValid: true,
      key: '123456789',
    };

    try {
      const webhookResponses = await Promise.all(
        this.webhookUrls.map((url) =>
          this.httpService
            .post(url, {
              key: 'content',
              field1,
              field2, // Add more fields as needed
            })
            .toPromise(),
        ),
      );

      response.webhookResponseData = webhookResponses.map((res) => res.data);
    } catch (error) {
      console.error('Error fetching data from webhook:', error.message);
      response.webhookResponseData = [];
    }

    return response;
  }
}
