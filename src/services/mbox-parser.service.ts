// mbox-parser.service.ts

import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MboxParserService {
  async parseMboxFromUrl(url: string): Promise<string[]> {
    try {
      const response = await axios.get(url);
      const mboxData: string = response.data;
      return this.parseMbox(mboxData);
    } catch (error) {
      console.error('Error fetching mbox file:', error);
      throw new Error('Failed to fetch mbox file');
    }
  }

  private parseMbox(mboxData: string): string[] {
    const emails: string[] = [];
    const lines = mboxData.split('\n');
    let currentEmail = '';

    for (const line of lines) {
      if (line.startsWith('From ')) {
        // Start of a new email
        if (currentEmail) {
          // If there was a previous email, push it to the list
          emails.push(currentEmail.trim());
        }
        // Initialize a new email string
        currentEmail = line + '\n';
      } else {
        // Append lines to the current email
        currentEmail += line + '\n';
      }
    }

    // Push the last email to the list
    if (currentEmail) {
      emails.push(currentEmail.trim());
    }

    return emails;
  }
}
