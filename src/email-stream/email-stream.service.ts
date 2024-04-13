import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmailStreamService {
  async getEmailStream() {
    const fileUrl = 'https://ok767777.s3.us-west-004.backblazeb2.com/Sent.mbox';

    try {
      const response = await axios.get(fileUrl, { responseType: 'stream' });
      return response.data;
    } catch (error) {
      console.error('Error fetching file:', error);
      throw new Error('Internal Server Error');
    }
  }
}
