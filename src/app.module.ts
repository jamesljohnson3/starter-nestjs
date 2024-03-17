import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { UploadModule } from './upload/upload.module'; // Import the UploadModule
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BucketModule } from './bucket/bucket.module'; // Import the BucketModule
import { MulterModule } from '@nestjs/platform-express';
import { OtpModule } from './otp/otp.module';
import { UserModule } from './user/user.module'; // Import the UserModule
import { CheckUserController } from './store/user.controller'; // Import the DataController
import { WebsiteController } from './upload/upload.controller'; // Update the path accordingly
import { ChatCompletionController } from './chat-completion/chat-completion.controller';
import { ChatCompletionService } from './chat-completion/chat-completion.service';
import { ChatCompletionModule } from './chat-completion/chat-completion.module';
import { AppGateway } from './app.gateway';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    OtpModule,
    UploadModule, // Add the UploadModule here
    BucketModule, // Add the BucketModule here
    MulterModule.register({
      dest: './uploads', // Destination folder for uploaded files
    }),
    UserModule, // Add the UserModule here
    ChatCompletionModule,
  ],
  controllers: [
    AppController,
    CheckUserController,
    WebsiteController,
    ChatCompletionController, // Include the DataController here
  ],
  providers: [AppService, ChatCompletionService, AppGateway],
})
export class AppModule {}
