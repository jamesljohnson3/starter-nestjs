import axios from 'axios';
import { Writable, Readable } from 'stream'; // Correct import for Writable and Readable
import ffmpeg from 'fluent-ffmpeg'; // Ensure correct import style for fluent-ffmpeg
import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import ffmpegStatic from 'ffmpeg-static';

@Injectable()
export class VideoStreamingService {
  private readonly ffmpegPath = ffmpegStatic;

  constructor() {}

  async streamVideo(id: string, res: Response): Promise<void> {
    const videoUrl =
      'https://f004.backblazeb2.com/file/ok767777/baadad5a-66ef-44df-9cba-8b358c8dfbd5-file.mp4';

    try {
      // Fetch video stream
      const response = await axios.get(videoUrl, {
        responseType: 'stream',
        headers: { 'Accept-Encoding': 'identity' }, // Disable compression
      });

      if (!response.data) {
        res.status(404).send('Video not found');
        return;
      }

      // Buffer the entire stream to ensure complete data
      const chunks: Buffer[] = [];
      const bufferStream = new Writable({
        write(chunk, encoding, callback) {
          chunks.push(chunk);
          callback();
        },
      });

      await new Promise<void>((resolve, reject) => {
        response.data
          .pipe(bufferStream)
          .on('finish', resolve)
          .on('error', reject);
      });

      const completeBuffer = Buffer.concat(chunks);
      console.log('Buffered data size:', completeBuffer.length);

      // Create a readable stream from the buffered data
      const inputStream = new Readable({
        read() {
          this.push(completeBuffer);
          this.push(null); // Signal end of stream
        },
      });

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

      const hlsStream = ffmpeg(inputStream) // Using the correct ffmpeg function
        .setFfmpegPath(this.ffmpegPath)
        .inputFormat('mp4')
        .inputOptions([
          '-analyzeduration',
          '100000000', // Increased for deeper analysis
          '-probesize',
          '100000000', // Increased for deeper analysis
          '-fflags',
          '+genpts+igndts+discardcorrupt',
          '-err_detect',
          'ignore_err', // Ignore decoding errors
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
          '4096', // Increased queue size
          '-b:v',
          '1M',
          '-pix_fmt',
          'yuv420p',
          '-loglevel',
          'debug', // Verbose logging
        ])
        .toFormat('hls')
        .output(res)
        .on('start', (commandLine) => {
          console.log('FFmpeg process started:', commandLine);
        })
        .on('progress', (progress) => {
          console.log(`Processing: ${progress.percent || 0}% done`);
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

      // Timeout handling with a longer timeout
      const streamTimeout = setTimeout(() => {
        console.error('Stream timeout');
        hlsStream.kill('SIGTERM'); // Pass 'SIGTERM' to gracefully terminate the process
        if (!res.headersSent) {
          res.status(504).send('Stream timeout');
        }
      }, 60000); // 60 seconds timeout

      // Clear timeout on successful completion
      hlsStream.on('end', () => clearTimeout(streamTimeout));

      hlsStream.run();
    } catch (error) {
      console.error('Error fetching video:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Video fetch failed',
          details: error.message,
        });
      }
    }
  }
}
