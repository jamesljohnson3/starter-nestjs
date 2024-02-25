// chat-completion.module.ts

import { Module } from '@nestjs/common';
import { ChatCompletionController } from './chat-completion.controller';
import { ChatCompletionService } from './chat-completion.service';

@Module({
  controllers: [ChatCompletionController],
  providers: [ChatCompletionService],
})
export class ChatCompletionModule {}
