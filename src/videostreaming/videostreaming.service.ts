import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import * as axios from 'axios';
import { Response } from 'express';
import { Readable } from 'stream';

@Injectable()
export class VideoStreamingService {
  private readonly ffmpegPath = ffmpegStatic;

  constructor() {}

  async streamVideo(id: string, res: Response) {
    const videoUrl = `https://f004.backblazeb2.com/file/ok767777/baadad5a-66ef-44df-9cba-8b358c8dfbd5-file.mp4`;

    try {
      const response = await axios.default.get(videoUrl, {
        responseType: 'arraybuffer',
      });

      if (!response.data) {
        res.status(404).send('Video not found');
        return;
      }

      const bufferStream = new Readable();
      bufferStream.push(response.data);
      bufferStream.push(null);

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

      const hlsStream = ffmpeg(bufferStream)
        .setFfmpegPath(this.ffmpegPath)
        .inputOptions([
          '-fflags +genpts',
          '-analyzeduration 20000000', // Double analyzeduration
          '-probesize 20000000', // Double probe size
        ])
        .outputOptions([
          '-preset ultrafast',
          '-pix_fmt yuv420p', // Ensure compatibility
          '-g 50',
          '-sc_threshold 0',
          '-map 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-hls_allow_cache 1',
          '-hls_flags delete_segments',
          '-loglevel debug',
          '-max_muxing_queue_size 4096', // Further increase queue size
          '-c:v libx264',
          '-b:v 1M',
        ])
        .output(res)
        .format('hls')
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('end', () => {
          console.log('HLS streaming finished');
        })
        .on('error', (err, stdout, stderr) => {
          console.error('FFmpeg Error:', err.message);
          console.error('FFmpeg Stdout:', stdout);
          console.error('FFmpeg Stderr:', stderr);
          if (!res.headersSent) {
            res.status(500).send('Error streaming video');
          }
        });

      hlsStream.run();
    } catch (error) {
      console.error('Error fetching video:', error);
      if (!res.headersSent) {
        res.status(500).send('Error fetching video');
      }
    }
  }
}
