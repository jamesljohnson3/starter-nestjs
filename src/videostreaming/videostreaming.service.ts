import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import axios from 'axios';
import { Response } from 'express';
import { Readable } from 'stream';

@Injectable()
export class VideoStreamingService {
  private readonly ffmpegPath = ffmpegStatic;

  constructor() {
    ffmpeg.setFfmpegPath(this.ffmpegPath);
  }

  async streamVideo(id: string, res: Response): Promise<void> {
    const videoUrl = `https://f004.backblazeb2.com/file/ok767777/${id}-file.mp4`;

    try {
      const response = await axios.get(videoUrl, {
        responseType: 'arraybuffer',
      });

      if (!response.data) {
        res.status(404).send('Video not found');
        return;
      }

      // Create a Readable stream from the ArrayBuffer
      const bufferStream = new Readable();
      bufferStream.push(Buffer.from(response.data));
      bufferStream.push(null);

      // Set up ffmpeg command
      const command = ffmpeg(bufferStream)
        .inputOptions(['-fflags +genpts', '-flags +global_header'])
        .outputOptions([
          '-preset ultrafast',
          '-g 50',
          '-sc_threshold 0',
          '-map 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-hls_allow_cache 1',
          '-hls_flags delete_segments',
        ])
        .videoCodec('libx264')
        .videoBitrate('1M')
        .outputFormat('hls');

      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Pipe the output to the response
      command.pipe(res, { end: true });

    } catch (error) {
      console.error('Error streaming video:', error);
      res.status(500).send('Error streaming video');
    }
  }
}
