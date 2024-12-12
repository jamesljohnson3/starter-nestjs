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
      const response = await axios.default.get(videoUrl, { responseType: 'stream' });

      if (!response.data) {
        res.status(404).send('Video not found');
        return;
      }

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

      const hlsStream = ffmpeg(response.data)
        .setFfmpegPath(this.ffmpegPath)
        .inputFormat('mp4')
        .inputOptions([
          '-analyzeduration', '10000000',
          '-probesize', '10000000'
        ])
        .outputOptions([
          '-fflags', '+genpts',
          '-flags', '+global_header',
          '-preset', 'ultrafast',
          '-g', '50',
          '-sc_threshold', '0',
          '-map', '0',
          '-hls_time', '10',
          '-hls_list_size', '0',
          '-hls_allow_cache', '1',
          '-hls_flags', 'delete_segments',
          '-loglevel', 'debug',
          '-max_muxing_queue_size', '2048',
          '-c:v', 'libx264',
          '-b:v', '1M',
          '-pix_fmt', 'yuv420p'
        ])
        .output(res)
        .format('hls')
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing: ' + progress.percent + '% done');
        })
        .on('end', () => {
          console.log('HLS streaming finished');
        })
        .on('error', (err, stdout, stderr) => {
          console.error('Error occurred while streaming video:', err.message);
          console.error('ffmpeg stdout:', stdout);
          console.error('ffmpeg stderr:', stderr);
          if (!res.headersSent) {
            res.status(500).send('Error streaming video');
          }
        });

      hlsStream.run();
    } catch (error) {
      console.error('Error fetching video: ', error);
      if (!res.headersSent) {
        res.status(500).send('Error fetching video');
      }
    }
  }
}
