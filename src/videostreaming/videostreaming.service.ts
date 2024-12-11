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

  // Method to stream video in HLS format
  async streamVideo(id: string, res: Response) {
    const videoUrl = `https://f004.backblazeb2.com/file/ok767777/baadad5a-66ef-44df-9cba-8b358c8dfbd5-file.mp4`;  // Replace with actual video URL using `id`

    try {
      // Stream the video directly using axios with responseType 'stream'
      const response = await axios.default.get(videoUrl, { responseType: 'stream' });

      if (!response.data) {
        res.status(404).send('Video not found');
        return;
      }

      // Set the headers for the HLS stream response
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

      // Pass the stream directly to ffmpeg
      const hlsStream = ffmpeg(response.data)
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
          '-loglevel debug', // Use for debugging ffmpeg
        ])
        .output(res) // Output directly to the response object
        .format('hls') // Set HLS as the format
        .on('end', () => {
          console.log('HLS streaming finished');
        })
        .on('error', (err) => {
          console.error('Error occurred while streaming video:', err);
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
