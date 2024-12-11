import { Controller, Get, Res, Query } from '@nestjs/common';
import { VideoStreamingService } from './videostreaming.service';
import { Response } from 'express';

@Controller('video')
export class VideoStreamingController {
  constructor(private readonly videoStreamingService: VideoStreamingService) {}

  // Endpoint to stream video by ID
  @Get('stream')
  async streamVideo(@Query('id') id: string, @Res() res: Response) {
    if (!id) {
      return res.status(400).send('Video ID is required');
    }

    try {
      await this.videoStreamingService.streamVideo(id, res);
    } catch (error) {
      res.status(500).send('Error streaming video');
    }
  }
}
