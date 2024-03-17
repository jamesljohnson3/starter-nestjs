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
  Header,
} from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import * as fs from 'node:fs';
import { AppService } from './app.service';
import { EventsService } from './events.service';

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
  constructor(
    private httpService: HttpService,
    private readonly appService: AppService,
    private readonly events: EventsService,
  ) {}

  @Get('sse/:client')
  sse(
    @Param('client') client: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    req.on('close', () => this.events.removeClient(client));
    return this.events.addClient(client, res);
  }

  @Post('uploads/:client')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('client') client: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Check if file exists
    if (!file) {
      return { message: 'No file uploaded' };
    }
    console.log('File content:', file);

    // Split file content by lines
    const lines = file.buffer.toString().split(/\r*\n/).filter(Boolean);

    // Iterate over each line and send SSE messages
    for (let i = 0; i < lines.length; i++) {
      this.events.sendMessage(
        client,
        'progress',
        `${(i * 100) / lines.length}`,
      );
      this.events.sendMessage(client, 'data', lines[i]);
      await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate delay (optional)
    }

    // Send completion message
    this.events.sendMessage(client, 'progress', '100');
    this.events.sendMessage(
      client,
      'notification',
      '✅ Success, File uploaded successfully',
    );

    return { message: 'File uploaded successfully' };
  }

  @Get('csv')
  generateCsv(@Res() res: Response) {
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
        res.status(500).send('Error writing CSV file');
      } else {
        console.log(`CSV file generated successfully at ${filePath}`);
        res.download(filePath); // Automatically download the generated CSV file
      }
    });
  }
}

@Controller('actions')
export class ActionController {
  private readonly allowedUUID = '22-22-22'; // Replace with your authorized UUID
  private webhookUrl =
    'https://snap-jj3media-icloud-com.eu-1.celonis.cloud/ems-automation/public/api/root/a0e537b1-b88f-434c-a659-0cadea64b085/hook/f03auw3rub1gl5djqehmslc4rpm8j33e'; // Replace this with your actual webhook URL
  private webhookUrl2 =
    'https://snap-jj3media-icloud-com.eu-1.celonis.cloud/ems-automation/public/api/root/a0e537b1-b88f-434c-a659-0cadea64b085/hook/acgonuudtu441k97whj3xp8ykm9pme2s'; // Replace this with your second webhook URL
  private webhookUrl3 =
    'https://snap-jj3media-icloud-com.eu-1.celonis.cloud/ems-automation/public/api/root/a0e537b1-b88f-434c-a659-0cadea64b085/hook/30sskndje19f0ws6ablrfbfujra8qr89'; // Replace this with your third webhook URL

  constructor(private httpService: HttpService) {}

  private isValidUUID(uuid: string): boolean {
    // Validate the provided UUID here (e.g., using a library like "uuid")
    // Return true if the UUID is valid, otherwise return false
    // Replace the example validation logic below with your actual validation logic
    return uuid === this.allowedUUID;
  }

  @Get() // Handles GET requests to /actions
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
      // Fetch data from the webhook endpoints using Promise.all to handle multiple requests simultaneously
      const [webhookResponse1, webhookResponse2, webhookResponse3] =
        await Promise.all([
          this.httpService
            .post(this.webhookUrl, {
              key: 'content',
              field1,
              field2 /* Add more fields as needed */,
            })
            .toPromise(),
          this.httpService
            .post(this.webhookUrl2, {
              key: 'content',
              field1,
              field2 /* Add more fields as needed */,
            })
            .toPromise(),
          this.httpService
            .post(this.webhookUrl3, {
              key: 'content',
              field1,
              field2 /* Add more fields as needed */,
            })
            .toPromise(),
        ]);

      if (webhookResponse1 && webhookResponse2 && webhookResponse3) {
        console.log('Webhook response 1:', webhookResponse1.data);
        console.log('Webhook response 2:', webhookResponse2.data);
        console.log('Webhook response 3:', webhookResponse3.data);

        // Populate the webhookResponseData array with the data received from the webhook endpoint
        response.webhookResponseData = [
          webhookResponse1.data,
          webhookResponse2.data,
          webhookResponse3.data,
        ];
      } else {
        console.error('Webhook request failed');
        response.webhookResponseData = []; // Set webhookResponseData to an empty array in case of an error
      }
    } catch (error) {
      console.error('Error fetching data from webhook:', error.message);
      response.webhookResponseData = []; // Set webhookResponseData to an empty array in case of an error
    }

    return response;
  }

  @Post() // Handles POST requests to /actions
  async postAction(
    @Headers('authorization') authorizationHeader: string,
    @Body() body: PostData, // Specify the type of the 'body' parameter
  ): Promise<ApiResponse> {
    const authorizedUUID = authorizationHeader?.split(' ')[1];

    if (!authorizedUUID || !this.isValidUUID(authorizedUUID)) {
      return { message: 'Unauthorized', isValid: false, key: 'null' };
    }
    const { field1, field2 /* Add more fields as needed */ } = body;

    const response: ApiResponse = {
      message: 'Hello, World!',
      isValid: true,
      key: '123456789',
    };

    try {
      // Fetch data from the webhook endpoints using Promise.all to handle multiple requests simultaneously
      const [webhookResponse1, webhookResponse2, webhookResponse3] =
        await Promise.all([
          this.httpService
            .post(this.webhookUrl, {
              key: 'content',
              field1,
              field2 /* Add more fields as needed */,
            })
            .toPromise(),
          this.httpService
            .post(this.webhookUrl2, {
              key: 'content',
              field1,
              field2 /* Add more fields as needed */,
            })
            .toPromise(),
          this.httpService
            .post(this.webhookUrl3, {
              key: 'content',
              field1,
              field2 /* Add more fields as needed */,
            })
            .toPromise(),
        ]);

      if (webhookResponse1 && webhookResponse2 && webhookResponse3) {
        console.log('Webhook response 1:', webhookResponse1.data);
        console.log('Webhook response 2:', webhookResponse2.data);
        console.log('Webhook response 3:', webhookResponse3.data);

        // Populate the webhookResponseData array with the data received from the webhook endpoint
        response.webhookResponseData = [
          webhookResponse1.data,
          webhookResponse2.data,
          webhookResponse3.data,
        ];
      } else {
        console.error('Webhook request failed');
        response.webhookResponseData = []; // Set webhookResponseData to an empty array in case of an error
      }
    } catch (error) {
      console.error('Error fetching data from webhook:', error.message);
      response.webhookResponseData = []; // Set webhookResponseData to an empty array in case of an error
    }

    return response;
  }
}
