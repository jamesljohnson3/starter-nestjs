// mboxParser.ts
import { Email } from './shared/email.interface';

export function parseMbox(mboxData: string): Email[] {
  const emails: Email[] = [];
  const lines = mboxData.split('\n');
  let currentEmail: Partial<Email> = {};
  let isBody = false;

  for (const line of lines) {
    if (line.startsWith('From ')) {
      // Start of a new email
      if (currentEmail.from) {
        // If there was a previous email, push it to the list
        emails.push(currentEmail as Email);
      }
      // Initialize a new email object
      currentEmail = {};
      isBody = false;
    } else if (line.startsWith('From: ')) {
      currentEmail.from = line.substring(6).trim();
    } else if (line.startsWith('Date: ')) {
      currentEmail.date = line.substring(6).trim();
    } else if (line.startsWith('Subject: ')) {
      currentEmail.subject = line.substring(9).trim();
    } else if (line === '') {
      // Empty line indicates the start of the email body
      isBody = true;
      currentEmail.body = '';
    } else if (isBody) {
      // Append lines to the email body
      currentEmail.body += line + '\n';
    }
  }

  // Push the last email to the list
  if (currentEmail.from) {
    emails.push(currentEmail as Email);
  }

  return emails;
}
