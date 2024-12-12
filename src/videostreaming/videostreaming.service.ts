import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import * as axios from 'axios';
import { Response } from 'express';
import * as stream from 'stream';

@Injectable()
export class VideoStreamingService {
  private readonly ffmpegPath = ffmpegStatic;

  constructor() {}

  async streamVideo(id: string, res: Response) {
    const videoUrl = `https://f004.backblazeb2.com/file/ok767777/baadad5a-66ef-44df-9cba-8b358c8dfbd5-file.mp4`;

    try {
      const response = await axios.default.get(videoUrl, {
        responseType: 'stream',
        headers: { 'Accept-Encoding': 'identity' },
      });

      if (response.status !== 200) {
        console.error('Download failed with status:', response.status);
        res.status(response.status).send('Failed to download video');
        return;
      }

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

      const hlsStream = ffmpeg(response.data)
        .setFfmpegPath(this.ffmpegPath) // Replace this.ffmpegPath with the actual path
        .inputFormat('mp4')
        .inputOptions([
          '-analyzeduration',
          '50000000',
          '-probesize',
          '50000000',
          '-fflags',
          '+genpts+igndts+discardcorrupt',
          '-err_detect',
          'ignore_err',
        ])
        .videoCodec('libx264')
        .outputOptions([
          '-preset',
          'ultrafast',
          '-g',
          '50',
          '-sc_threshold',
          '0',
          '-map',
          '0',
          '-hls_time',
          '10',
          '-hls_list_size',
          '0',
          '-hls_allow_cache',
          '1',
          '-hls_flags',
          'delete_segments',
          '-max_muxing_queue_size',
          '4096',
          '-b:v',
          '1M',
          '-pix_fmt',
          'yuv420p',
        ]) // Removed debug logging for production
        .toFormat('hls')
        .output(res)
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing: ' + (progress.percent || 0) + '% done');
        })
        .on('end', () => {
          console.log('HLS streaming finished');
          if (!res.headersSent) {
            res.end();
          }
        })
        .on('error', (err, stdout, stderr) => {
          console.error('Streaming error details:', {
            message: err.message,
            stdout,
            stderr,
          });
          console.error('Complete FFmpeg Error:', {
            commandLine: err.cmd,
            fullMessage: err.toString(),
          });

          let statusCode = 500; // Generic server error as default
          if (
            err.message.includes('Invalid data found when processing input') ||
            err.message.includes('partial file')
          ) {
            statusCode = 400; // Bad Request - indicate potential client-side issue (corrupted file)
          } else if (stderr.includes('No such file or directory')) {
            statusCode = 404; // Not Found - if the input file is missing
          }

          if (!res.headersSent) {
            res.status(statusCode).json({
              error: 'Video streaming failed',
              details: err.message,
              fullError: err.toString(),
            });
          }
        });

      const streamTimeout = setTimeout(() => {
        console.error('Stream timeout');
        hlsStream.kill();
        if (!res.headersSent) {
          res.status(504).send('Stream timeout');
        }
      }, 60000);

      hlsStream.on('end', () => clearTimeout(streamTimeout));

      hlsStream.run();
    } catch (error) {
      console.error('Error fetching video:', error);
      if (!res.headersSent) {
        res
          .status(500)
          .json({ error: 'Video fetch failed', details: error.message });
      }
    }
  }
}
