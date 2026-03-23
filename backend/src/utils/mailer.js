import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// This tells Google to use your refresh token whenever the access token expires
oAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN });

export const sendEmail = async ({ to, subject, html, attachmentBuffer, fileName }) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const boundary = "__MY_BOUNDARY__"; // Unique string to separate parts

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

    // 1. Construct Multipart MIME message
    const messageParts = [
      `To: ${to}`,
      `Subject: ${utf8Subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      html,
      '',
    ];

    if (attachmentBuffer) {
      messageParts.push(
        `--${boundary}`,
        `Content-Type: application/pdf; name="${fileName}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${fileName}"`,
        '',
        attachmentBuffer.toString('base64'),
        ''
      );
    }

    messageParts.push(`--${boundary}--`);

    const message = messageParts.join('\r\n'); // Use \r\n for MIME standards

    // 2. Encode to Base64URL
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return result.data;
  } catch (error) {
    console.error("GMAIL API ATTACHMENT ERROR:", error.message);
    throw error;
  }
};

export default { sendEmail };