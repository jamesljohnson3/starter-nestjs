// chat-completion.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { ChatCompletionService } from './chat-completion.service';

@Controller('chat')
export class ChatCompletionController {
  constructor(private readonly chatCompletionService: ChatCompletionService) {}

  @Post('completion')
  async completeChat(@Body() messages: string[]): Promise<any> {
    return this.chatCompletionService.completeChat(messages);
  }
}
