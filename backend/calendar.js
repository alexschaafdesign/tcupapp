import { google } from 'googleapis';
import fs from 'fs/promises';

// Load the service account key from an environment variable
const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH; // Path to the JSON file
if (!credentialsPath) {
  throw new Error('GOOGLE_CREDENTIALS_PATH is not set');
}

const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));

// Authenticate with the service account
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
});

const calendar = google.calendar({ version: 'v3', auth });

// Function to fetch events
export async function listEvents() {
  const res = await calendar.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID, // Use environment variable for calendar ID
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return res.data.items;
}


