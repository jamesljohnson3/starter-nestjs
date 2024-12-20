import axios from 'axios';
import { Writable, Readable } from 'stream';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

// Set the FFmpeg binary path explicitly
ffmpeg.setFfmpegPath(ffmpegStatic);

@Injectable()
export class VideoStreamingService {
  private readonly ffmpegPath = ffmpegStatic;

  constructor() {
    if (!this.ffmpegPath) {
      console.error('FFmpeg binary not found!');
    } else {
      console.log('FFmpeg Path:', this.ffmpegPath); // Log the FFmpeg path for debugging
    }
  }

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
        .setFfmpegPath(this.ffmpegPath) // Explicitly set the path
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
          '-fflags',
          '+genpts',
          '-flags',
          '+global_header',
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
          '-loglevel',
          'debug',
          '-max_muxing_queue_size',
          '4096', // Increased queue size
          '-c:v',
          'libx264',
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
          console.log(`Processing: ${progress.percent || 0}% done`);
        })
        .on('end', () => {
          console.log('HLS streaming finished');
          clearTimeout(streamTimeout); // Clear timeout on completion
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
            commandLine: err,
            fullMessage: err.toString(),
          });
          clearTimeout(streamTimeout); // Make sure timeout is cleared on error
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
        hlsStream.kill('SIGTERM'); // Gracefully terminate the process
        if (!res.headersSent) {
          res.status(504).send('Stream timeout');
        }
      }, 60000); // 60 seconds timeout

      // Clear timeout on successful completion or error
      hlsStream.on('end', () => {
        clearTimeout(streamTimeout);
      });

      hlsStream.on('error', () => {
        clearTimeout(streamTimeout); // Clear the timeout on error as well
      });

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
