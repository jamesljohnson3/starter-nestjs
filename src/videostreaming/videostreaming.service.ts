import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import * as axios from 'axios';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VideoStreamingService {
  private readonly ffmpegPath = ffmpegStatic;

  constructor() {}

  // Method to stream video in HLS format
  async streamVideo(id: string, res: Response) {
    const videoUrl = `https://f004.backblazeb2.com/file/ok767777/baadad5a-66ef-44df-9cba-8b358c8dfbd5-file.mp4`;  // Use video ID for dynamic URL in a real scenario

    try {
      // Fetch the MP4 video from the URL
      const response = await axios.default.get(videoUrl, { responseType: 'arraybuffer' });  // Change to arraybuffer to ensure the video is fetched properly

      if (!response.data) {
        res.status(404).send('Video not found');
        return;
      }

      // Save the video file temporarily to disk (for debugging purposes)
      const tempFilePath = path.join(__dirname, 'temp_video.mp4');
      fs.writeFileSync(tempFilePath, response.data);

      // Set headers for HLS streaming
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

      // Add protocol whitelist option to handle HTTP/HTTPS streaming
      const hlsStream = ffmpeg(tempFilePath)  // Use local file for testing
        .setFfmpegPath(this.ffmpegPath)
        .outputOptions([
          '-preset fast',
          '-g 50',
          '-sc_threshold 0',
          '-map 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-hls_allow_cache 1',
          '-hls_flags delete_segments',
          '-loglevel debug', // Added to get more detailed error logs
        ])
        .output(res)
        .format('hls')
        .on('end', () => {
          console.log('HLS streaming finished');
          fs.unlinkSync(tempFilePath);  // Cleanup temporary file
        })
        .on('error', (err) => {
          console.error('Error occurred: ', err);
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
