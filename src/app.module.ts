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
import { MboxController } from './mbox/mbox.controller'; // Import MboxController
import { UploaderController } from './uploader/uploader.controller'; // Import MboxController
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
import { ApiController } from './api/api.controller';
import { ApiService } from './api/api.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    OtpModule,
    UploadModule,
    BucketModule,
    MulterModule.register({
      dest: './uploads',
    }),
    UserModule,
    ChatCompletionModule,
    VideoModule,
    DataModule,
    EmailStreamModule,
    StreamEmailModule,
  ],
  controllers: [
    AppController,
    CheckUserController,
    WebsiteController,
    ChatCompletionController,
    MediaController,
    MboxController,
    UploaderController,
    ChunkUploadController,
    MboxToPdfController,
    EmailController,
    StreamEmailController,
    ApiController
  ],
  providers: [
    EventsService,
    AppService,
    ChatCompletionService,
    AppGateway,
    ChunkUploadService,
    DataService,
    MboxParserService,
    ApiService
  ],
})
export class AppModule {}
