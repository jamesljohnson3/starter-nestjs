import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { UploadModule } from './upload/upload.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BucketModule } from './bucket/bucket.module';
import { MulterModule } from '@nestjs/platform-express';
import { OtpModule } from './otp/otp.module';
import { UserModule } from './user/user.module';
import { CheckUserController } from './store/user.controller';
import { WebsiteController } from './upload/upload.controller';
import { ChatCompletionController } from './chat-completion/chat-completion.controller';
import { ChatCompletionService } from './chat-completion/chat-completion.service';
import { ChatCompletionModule } from './chat-completion/chat-completion.module';
import { AppGateway } from './app.gateway';
import { EventsService } from './events.service';
import { MediaController } from './media.controller';
import { MboxController } from './mbox/mbox.controller'; 
import { UploaderController } from './uploader/uploader.controller'; 
import { ChunkUploadService } from './chunk-upload/chunk-upload.service';
import { ChunkUploadController } from './chunk-upload/chunk-upload.controller';
import { VideoModule } from './video/video.module';
import { MboxToPdfController } from './mbox-to-pdf/mbox-to-pdf.controller';
import { DataService } from './data/data.service';
import { DataModule } from './data/data.module';
import { EmailController } from './emails/email.controller';
import { MboxParserService } from './services/mbox-parser.service';
import { EmailStreamModule } from './email-stream/email-stream.module';
import { StreamEmailController } from './stream-email/stream-email.controller';
import { StreamEmailModule } from './stream-email/stream-email.module';
import { VideoStreamingModule } from './videostreaming/videostreaming.module';  // Import the Video Streaming Module
import { VideoStreamingController } from './videostreaming/videostreaming.controller';
import { VideoStreamingService } from './videostreaming/videostreaming.service';

@Module({
  imports: [
    ConfigModule.forRoot(), // Load configuration from environment variables or .env file
    HttpModule, // Enables HTTP requests
    OtpModule, // OTP-related functionality
    UploadModule, // File upload functionality
    BucketModule, // For working with cloud storage buckets
    MulterModule.register({
      dest: './uploads', // Destination for file uploads
    }),
    UserModule, // User-related functionality
    ChatCompletionModule, // Module for chat completions
    VideoModule, // Module related to video functionality
    DataModule, // Data-related functionality
    EmailStreamModule, // Module for email streaming
    StreamEmailModule, // Module for streaming emails
    VideoStreamingModule, // Import VideoStreamingModule
  ],
  controllers: [
    AppController, 
    CheckUserController, // Controller for checking user
    WebsiteController, // Controller for website-related actions
    ChatCompletionController, // Controller for chat completions
    MediaController, // Controller for media actions
    MboxController, // Controller for handling MBOX files
    UploaderController, // Controller for file upload handling
    ChunkUploadController, // Controller for chunk uploads
    MboxToPdfController, // Controller for converting MBOX to PDF
    EmailController, // Controller for email-related actions
    StreamEmailController, // Controller for streaming emails
    VideoStreamingController, // Controller for video streaming
  ],
  providers: [
    EventsService, // Handles events
    AppService, // General app services
    ChatCompletionService, // Chat completion service
    AppGateway, // WebSocket gateway for real-time communication
    ChunkUploadService, // Handles chunk uploads
    DataService, // Handles data-related logic
    MboxParserService, // Service for parsing MBOX files
    VideoStreamingService
  ],
})
export class AppModule {}
