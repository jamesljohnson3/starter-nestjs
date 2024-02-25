import { Controller, Post, Body } from '@nestjs/common';
import { ChatCompletionService } from './chat-completion.service';

@Controller('chat-completion')
export class ChatCompletionController {
  constructor(private readonly chatCompletionService: ChatCompletionService) {}

  @Post()
  async completeChat(@Body() messages: any[]) {
    try {
      const results = await this.chatCompletionService.completeChat(messages);
      return results;
    } catch (error) {
      return { error: error.message };
    }
  }
}
