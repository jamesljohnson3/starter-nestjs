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
    DataService,
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
  ],
  providers: [
    EventsService,
    AppService,
    ChatCompletionService,
    AppGateway,
    ChunkUploadService,
    DataService,
  ],
})
export class AppModule {}
