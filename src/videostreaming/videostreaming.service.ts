import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import stream from 'stream';
import { Response } from 'express';

async function streamVideo(id: string, res: Response) {
  const videoUrl = `https://f004.backblazeb2.com/file/ok767777/baadad5a-66ef-44df-9cba-8b358c8dfbd5-file.mp4`;

  try {
    // Step 1: Fetch the video as a stream
    const response = await axios.get(videoUrl, {
      responseType: 'stream',
      headers: { 'Accept-Encoding': 'identity' },
    });

    if (!response.data) {
      res.status(404).send('Video not found');
      return;
    }

    // Step 2: Buffer the fetched data
    const chunks: Buffer[] = [];
    const bufferStream = new stream.Writable({
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

    // Step 3: Create a readable stream from the buffered data
    const inputStream = new stream.Readable({
      read() {
        this.push(completeBuffer);
        this.push(null);
      },
    });

    // Step 4: Set up response headers for HLS streaming
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

    // Step 5: Configure FFmpeg for HLS conversion
    ffmpeg(inputStream)
      .setFfmpegPath('/usr/bin/ffmpeg') // Path to FFmpeg binary
      .inputFormat('mp4')
      .inputOptions([
        '-analyzeduration',
        '100000000', // Increased analysis duration
        '-probesize',
        '100000000', // Increased probe size
        '-fflags',
        '+genpts+discardcorrupt',
        '-err_detect',
        'ignore_err', // Handle corrupt or missing data
        '-pix_fmt',
        'yuv420p', // Force pixel format
      ])
      .videoCodec('libx264')
      .outputOptions([
        '-preset',
        'ultrafast',
        '-g',
        '50', // Group of pictures (GOP) size
        '-sc_threshold',
        '0', // Disable scene change detection
        '-hls_time',
        '10', // HLS segment duration
        '-hls_list_size',
        '0', // Allow unlimited segment list
        '-hls_allow_cache',
        '1', // Allow caching
        '-hls_flags',
        'delete_segments', // Delete old segments
        '-max_muxing_queue_size',
        '4096', // Queue size for FFmpeg
        '-b:v',
        '1M', // Video bitrate
        '-loglevel',
        'debug', // Debug logging for troubleshooting
      ])
      .toFormat('hls') // Specify HLS format
      .output(res) // Stream output directly to response
      .on('start', (commandLine) => {
        console.log('FFmpeg process started:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Processing: ${(progress.percent || 0).toFixed(2)}% done`);
      })
      .on('end', () => {
        console.log('HLS streaming finished');
        if (!res.headersSent) res.end();
      })
      .on('error', (err) => {
        console.error('FFmpeg Error:', err.message);
        if (!res.headersSent) res.status(500).send('Streaming error');
      })
      .run();
  } catch (error) {
    // Handle any errors during the process
    console.error('Error fetching or streaming video:', error.message);
    if (!res.headersSent) {
      res.status(500).send('Failed to fetch or process the video');
    }
  }
}

export { streamVideo };
