/* eslint-disable @typescript-eslint/no-empty-function */
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
        headers: {
          'Accept-Encoding': 'identity', // Disable compression
        },
      });

      if (!response.data) {
        res.status(404).send('Video not found');
        return;
      }

      // Buffer the entire stream to ensure complete data
      const chunks: Buffer[] = [];
      const bufferStream = new stream.Writable({
        write(chunk, encoding, callback) {
          chunks.push(chunk);
          callback();
        },
      });

      await new Promise((resolve, reject) => {
        response.data
          .pipe(bufferStream)
          .on('finish', resolve)
          .on('error', reject);
      });

      const completeBuffer = Buffer.concat(chunks);

      // Create a readable stream from the buffered data
      const inputStream = new stream.Readable({
        read() {
          this.push(completeBuffer);
          this.push(null); // Signal end of stream
        },
      });

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

      const hlsStream = ffmpeg(inputStream)
        .setFfmpegPath(this.ffmpegPath)
        .inputFormat('mp4')
        .inputOptions([
          '-analyzeduration',
          '20000000', // Increased from 10000000
          '-probesize',
          '20000000', // Increased from 10000000
          '-fflags',
          '+genpts+igndts+discardcorrupt', // Added discardcorrupt flag
        ])
        .videoCodec('libx264')
        .outputOptions([
          '-preset',
          'ultrafast',
          '-g',
          '50', // GOP size
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
          '2048',
          '-b:v',
          '1M',
          '-pix_fmt',
          'yuv420p',
        ])
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

          // Log complete error details for debugging
          console.error('Complete FFmpeg Error:', {
            commandLine: err.cmd,
            fullMessage: err.toString(),
          });

          if (!res.headersSent) {
            res.status(500).json({
              error: 'Video streaming failed',
              details: err.message,
              fullError: err.toString(),
            });
          }
        });

      // Timeout handling with longer timeout
      const streamTimeout = setTimeout(() => {
        console.error('Stream timeout');
        hlsStream.kill();
        if (!res.headersSent) {
          res.status(504).send('Stream timeout');
        }
      }, 60000); // Increased to 60 seconds

      // Clear timeout on successful completion
      hlsStream.on('end', () => clearTimeout(streamTimeout));

      hlsStream.run();
    } catch (error) {
      console.error('Error fetching video: ', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Video fetch failed',
          details: error.message,
        });
      }
    }
  }
}
