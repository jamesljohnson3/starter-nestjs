import {
  Controller,
  Post,
  UploadedFile,
  Res,
  Get,
  Param,
} from '@nestjs/common';
import * as fs from 'fs';
import { createReadStream } from 'fs';
import * as MailParser from 'mailparser';
import * as htmlToPdf from 'html-pdf'; // or any other PDF library

@Controller('mbox-to-pdf')
export class MboxToPdfController {
  @Post('convert')
  async convertMboxToPdf(@UploadedFile() file, @Res() response) {
    try {
      // Read mbox file
      const mboxContent = fs.readFileSync(file.path, 'utf-8');

      // Parse mbox content
      const mailParser = new MailParser();
      const messages = [];
      const stream = createReadStream(file.path);
      stream.pipe(mailParser);

      mailParser.on('data', (msg) => {
        if (msg.type === 'message') {
          messages.push(msg);
        }
      });

      // Convert each email to HTML and then to PDF
      const htmlContents = messages.map((msg) => {
        return `<html><body>${msg.html || msg.textAsHtml}</body></html>`;
      });

      const pdfPromises = htmlContents.map((html, index) => {
        return new Promise((resolve, reject) => {
          const pdfPath = `pdf_${index}.pdf`; // Generate unique PDF filename
          htmlToPdf.create(html).toFile(pdfPath, (err, res) => {
            if (err) reject(err);
            else resolve(pdfPath);
          });
        });
      });

      const pdfPaths = await Promise.all(pdfPromises);

      // Send PDF paths as response
      response.status(200).json({ pdfPaths });
    } catch (error) {
      console.error('Error converting mbox to PDF:', error);
      response.status(500).send('Internal Server Error');
    }
  }

  @Get('read/:pdfPath')
  async readPdf(@Param('pdfPath') pdfPath, @Res() response) {
    try {
      // Read PDF file
      const pdfStream = createReadStream(pdfPath);
      pdfStream.pipe(response);
    } catch (error) {
      console.error('Error reading PDF:', error);
      response.status(500).send('Internal Server Error');
    }
  }
}
