import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import * as axios from 'axios';
import { Response } from 'express';
import { Readable } from 'stream';

@Injectable()
export class VideoStreamingService {
  private readonly ffmpegPath = ffmpegStatic; // Path to FFmpeg binary

  constructor() {}

  // Method to stream video in HLS format
  async streamVideo(id: string, res: Response) {
    const videoUrl = `https://f004.backblazeb2.com/file/ok767777/SheltonHospitalistGroupClearspring%20HealthMedicareAdvantagePartnership.mp4`;  // Hardcoded video URL for testing

    try {
      // Fetch the MP4 video from the URL
      const response = await axios.default.get(videoUrl, { responseType: 'stream' });

      if (!response.data || !response.data.pipe) {
        res.status(404).send('Video not found');
        return;
      }

      // Set headers for HLS streaming
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Access-Control-Allow-Origin', '*'); // Optional: Allow cross-origin requests

      // FFmpeg command to convert the video to HLS format and pipe it to the response
      const hlsStream = ffmpeg(response.data)
        .setFfmpegPath(this.ffmpegPath) // Use the correct path for ffmpeg
        .outputOptions([
          '-preset fast', // Set fast encoding for real-time conversion
          '-g 50', // Set GOP size for HLS
          '-sc_threshold 0', // Disable scene change detection
          '-map 0', // Map the input stream
          '-hls_time 10', // Segment length in seconds
          '-hls_list_size 0', // Unlimited playlist length
          '-hls_allow_cache 1', // Allow caching of HLS segments
          '-hls_flags delete_segments', // Delete old segments
        ])
        .output(res) // Output the stream directly to the response body
        .format('hls') // Set the format to HLS
        .on('end', () => console.log('HLS streaming finished'))
        .on('error', (err) => {
          console.error('Error occurred: ', err);
          res.status(500).send('Error streaming video');
        });

      hlsStream.run(); // Start the FFmpeg process to stream the video

    } catch (error) {
      console.error('Error fetching or processing video:', error);
      res.status(500).send('Error streaming video');
    }
  }
}
