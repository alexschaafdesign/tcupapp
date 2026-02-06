// routes/venue-ratings.js
const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

router.get('/venue-ratings', async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Sheet1!A:I'  // Adjust range as needed
    });

    res.json(response.data.values);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;