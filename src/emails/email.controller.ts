// emails/email.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import axios from 'axios';
import { parseMbox } from '../mboxParser'; // You need to implement mbox parsing logic

@Controller('emails')
export class EmailController {
  @Get()
  async getEmails(
    @Query('page') page = 1, // Default to page 1
    @Query('limit') limit = 10, // Default to 10 items per page
    @Query('search') search = '', // Default to empty string for search query
    @Query('filterFrom') filterFrom = '', // Default to empty string for filtering by 'from' field
  ) {
    try {
      // Fetch mbox file from the URL
      const response = await axios.get(
        'https://ok767777.s3.us-west-004.backblazeb2.com/All+mail+Including+Spam+and+Trash.mbox',
      );

      // Parse mbox file into individual email messages
      const mboxData = response.data;
      let emails = parseMbox(mboxData); // Implement this function

      // Search filter: filter emails by search query in 'from' or 'subject' fields
      if (search) {
        const searchRegex = new RegExp(search, 'i'); // Case insensitive search
        emails = emails.filter(
          (email) =>
            searchRegex.test(email.from) || searchRegex.test(email.subject),
        );
      }

      // Filter by 'from' field
      if (filterFrom) {
        emails = emails.filter((email) => email.from === filterFrom);
      }

      // Calculate start and end indexes for the current page
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      // Get the emails for the current page
      const emailsForPage = emails.slice(startIndex, endIndex);

      // Send JSON response containing email data for the current page
      return { emails: emailsForPage };
    } catch (error) {
      console.error('Error fetching or parsing mbox file:', error);
      return { error: 'Failed to fetch or parse mbox file' };
    }
  }
}
