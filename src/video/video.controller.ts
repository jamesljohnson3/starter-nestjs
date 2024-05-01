import {
  Controller,
  Get,
  Param,
  Res,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { VideoService, VideoData } from './video.service'; // Import the VideoData interface from the service
import { statSync, createReadStream } from 'fs';
import { Response } from 'express';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('stream/:id')
  @Header('Accept-Ranges', 'bytes')
  @Header('Content-Type', 'video/mp4')
  async getStreamVideo(@Param('id') id: string, @Res() res: Response) {
    const video = this.videoService.findOne(+id);
    if (typeof video === 'string') {
      return res.status(HttpStatus.NOT_FOUND).send({ error: video });
    }
    const videoPath = `assets/${video.name}.mp4`;
    const videoURL = video.url; // Check if URL is provided
    if (videoURL) {
      // Redirect to the provided URL if available
      return res.redirect(HttpStatus.FOUND, videoURL);
    }
    const { size } = statSync(videoPath);
    const head = {
      'Content-Length': size,
    };
    res.writeHead(HttpStatus.OK, head); //200
    createReadStream(videoPath).pipe(res);
  }

  @Get()
  findAll(): VideoData[] {
    return this.videoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): VideoData | string {
    return this.videoService.findOne(+id);
  }
}
