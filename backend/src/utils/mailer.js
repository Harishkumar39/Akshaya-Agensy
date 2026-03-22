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

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Proper MIME structure for Gmail API
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      html,
    ];
    const message = messageParts.join('\n');

    // Encode the message to Base64URL
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

    console.log("Email Sent via API:", result.data.id);
    return result.data;
  } catch (error) {
    console.error("GMAIL API CRITICAL ERROR:", error.message);
    throw error;
  }
};

export default { sendEmail };