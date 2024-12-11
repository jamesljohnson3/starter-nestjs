import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import * as axios from 'axios';
import { Response } from 'express';

@Injectable()
export class VideoStreamingService {
  private readonly ffmpegPath = ffmpegStatic;

  constructor() {}

  // Method to stream video in HLS format
  async streamVideo(id: string, res: Response) {
    const videoUrl = `https://f004.backblazeb2.com/file/ok767777/SheltonHospitalistGroupClearspring%20HealthMedicareAdvantagePartnership.mp4`;  // Use video ID for dynamic URL in a real scenario

    try {
      // Fetch the MP4 video from the URL
      const response = await axios.default.get(videoUrl, { responseType: 'stream' });

      if (!response.data || !response.data.pipe) {
        res.status(404).send('Video not found');
        return;
      }

      // Set headers for HLS streaming
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

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
          '-protocol_whitelist file,http,https,tcp,tls'  // Allow streaming over HTTP(S)
        ])
        .output(res)
        .format('hls')
        .on('end', () => console.log('HLS streaming finished'))
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
