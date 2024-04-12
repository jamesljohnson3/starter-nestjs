import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmailStreamService {
  async getEmailStream() {
    const fileUrl = 'https://f004.backblazeb2.com/file/ok767777/Sent.mbox';

    try {
      const response = await axios.get(fileUrl, { responseType: 'stream' });
      return response.data;
    } catch (error) {
      console.error('Error fetching file:', error);
      throw new Error('Internal Server Error');
    }
  }
}
