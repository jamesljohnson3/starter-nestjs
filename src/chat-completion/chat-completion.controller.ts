// chat-completion.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { ChatCompletionService } from './chat-completion.service';

@Controller('chat-completion')
export class ChatCompletionController {
  constructor(private readonly chatCompletionService: ChatCompletionService) {}

  @Post()
  async completeChat(@Body() messages: string[]): Promise<any> {
    // Call the service method to process chat completion
    return this.chatCompletionService.completeChat(messages);
  }
}
