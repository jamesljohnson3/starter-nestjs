import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as MailParser from 'mailparser';
import * as fastcsv from 'fast-csv';

@Injectable()
export class DataService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async processUploadedCSV(file): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const rows = [];
      fs.createReadStream(file.path)
        .pipe(fastcsv.parse({ headers: true }))
        .on('error', (error) => reject(error))
        .on('data', (row) => rows.push(row))
        .on('end', () => resolve(rows));
    });
  }

  async processMboxFile(filePath: string): Promise<any> {
    try {
      // Read mbox file
      const mboxContent = fs.readFileSync(filePath, 'utf-8');

      // Parse mbox content
      const mailParser = new MailParser();
      const messages = [];
      const stream = fs.createReadStream(filePath);
      stream.pipe(mailParser);

      mailParser.on('data', (msg) => {
        if (msg.type === 'message') {
          messages.push(msg);
        }
      });

      return messages;
    } catch (error) {
      console.error('Error processing mbox file:', error);
      throw error;
    }
  }
}
