import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as readline from 'readline';

@Controller('mbox')
export class MboxController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    try {
      const mboxData = await this.parseMbox(file.path);
      return { mboxData };
    } catch (error) {
      throw new Error('Error parsing mbox file');
    }
  }

  async parseMbox(filePath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = readline.createInterface({
        input: fs.createReadStream(filePath, { encoding: 'utf-8' }),
      });
      let mboxData = '';

      reader.on('line', (line: string) => {
        // Process each line of the mbox file here
        mboxData += line + '\n';
      });

      reader.on('close', () => {
        resolve(mboxData);
      });

      reader.on('error', (error: any) => {
        reject(error);
      });
    });
  }
}
