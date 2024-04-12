// chunk-upload.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { ChunkUploadService } from './chunk-upload.service';

@Controller('upload-chunk')
export class ChunkUploadController {
  constructor(private readonly chunkUploadService: ChunkUploadService) {}

  @Post()
  async uploadChunk(
    @Body('chunk') chunk: Buffer,
    @Body('offset') offset: number,
    @Body('fileName') fileName: string,
  ): Promise<void> {
    await this.chunkUploadService.handleChunk(chunk, offset, fileName);
  }
}
