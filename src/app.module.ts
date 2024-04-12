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
  ],
  controllers: [
    AppController,
    CheckUserController,
    WebsiteController,
    ChatCompletionController,
    MediaController,
  ],
  providers: [EventsService, AppService, ChatCompletionService, AppGateway],
})
export class AppModule {}
