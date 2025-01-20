import dotenv from 'dotenv';
import { google } from 'googleapis';

const environment = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${environment}` });

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
 credentials,
 scopes: [
   'https://www.googleapis.com/auth/calendar.readonly',
   'https://www.googleapis.com/auth/calendar'
 ]
});

const calendar = google.calendar({ version: 'v3', auth });

export async function listEvents() {
 try {
   console.log('Service Account:', {
     email: credentials.client_email,
     project: credentials.project_id
   });

   const res = await calendar.events.list({
     calendarId: 'tcupminnesota@gmail.com',
     timeMin: new Date().toISOString(),
     maxResults: 10,
     singleEvents: true,
     orderBy: 'startTime'
   });

   return res.data.items;
 } catch (error) {
   console.error('Calendar API Error:', error);
   throw error;
 }
}