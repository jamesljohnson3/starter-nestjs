// chunk-upload.service.ts

import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises'; // Import the fs module to write to files

@Injectable()
export class ChunkUploadService {
  async handleChunk(
    chunk: Buffer,
    offset: number,
    fileName: string,
  ): Promise<void> {
    // Define the file path where chunks will be stored
    const filePath = `./uploads/${fileName}`;

    try {
      // Open the file in 'r+' mode to read and write
      const fileHandle = await fs.open(filePath, 'r+');

      // Write the chunk to the file at the specified offset
      await fileHandle.write(chunk, 0, chunk.length, offset);

      // Close the file
      await fileHandle.close();
    } catch (error) {
      // Handle any errors that occur during file operations
      console.error('Error handling chunk:', error);
      throw error;
    }
  }
}
