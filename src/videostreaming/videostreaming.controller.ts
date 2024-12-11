import { Controller, Get, Param, Res } from '@nestjs/common';
import { VideoStreamingService } from './videostreaming.service';
import { Response } from 'express';

@Controller('stream')
export class VideoStreamingController {
  constructor(private readonly videoStreamingService: VideoStreamingService) {}

  // Endpoint to stream video by ID
  @Get('video/:id')  // Use route parameter ':id' instead of query parameter
  async streamVideo(@Param('id') id: string, @Res() res: Response) {
    if (!id) {
      return res.status(400).send('Video ID is required');
    }

    try {
      // Pass the ID and response object to the service for processing
      await this.videoStreamingService.streamVideo(id, res);
    } catch (error) {
      res.status(500).send('Error streaming video');
    }
  }
}
