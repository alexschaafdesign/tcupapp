import { google } from 'googleapis';
import fs from 'fs/promises';

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);


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


