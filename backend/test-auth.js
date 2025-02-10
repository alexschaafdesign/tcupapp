// test-auth.js
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Because we're in an ES module, we have to set __dirname manually:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAuth() {
  try {
    // Read the credentials file manually.
    const credsPath = path.join(__dirname, 'config/google-credentials.json');
    const credsContent = fs.readFileSync(credsPath, 'utf8');
    const creds = JSON.parse(credsContent);

    // Replace literal "\n" sequences with actual newline characters.
    creds.private_key = creds.private_key.replace(/\\n/g, '\n');

    // Initialize GoogleAuth with the parsed credentials.
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();
    console.log('Successfully obtained token:', token);
  } catch (error) {
    console.error('Error during authentication test:', error);
  }
}

testAuth();