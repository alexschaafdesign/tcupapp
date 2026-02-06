import { google } from 'googleapis';
import pkg from 'pg'; // Use default import for CommonJS module
import fs from 'fs';

// Load credentials
const credentials = JSON.parse(fs.readFileSync('/Users/musicdaddy/Desktop/concerts/sacred-flash-440600-u0-c0a1dc7af60e.json'));

// Set up Google Sheets API
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth });

// Set up PostgreSQL client
const { Pool } = pkg; // Destructure Pool from the imported pkg
const pool = new Pool({
    user: 'aschaaf',
    host: 'localhost',
    database: 'venues',
    password: 'notthesame', // replace with your actual password
    port: 5432,
});

// Function to fetch data from Google Sheets
async function loadData() {
    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: '1O8-JJvk5oQcecRQrPmoGXCoTgZkgr_vE0OKqwYFzBx4', // Replace with your actual Google Sheets ID
            range: 'Sheet1!A:H', // Adjust based on your sheet structure
        });

        const rows = res.data.values;

        if (rows.length) {
            const query = `
                INSERT INTO venues (
                    venue, location, capacity, bandemail, notes, parking, accessibility, owner, tcup_rating
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `;
            
            for (const row of rows.slice(1)) { // Skip the header row
                // Pad row with nulls if necessary
                const paddedRow = [...row, ...Array(9 - row.length).fill(null)]; // Fill missing values with null
                await pool.query(query, paddedRow);
            }
        } else {
            console.log('No data found.');
        }
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
    }
}

loadData()
    .then(() => {
        console.log('Data loaded successfully');
        pool.end();
    })
    .catch(err => console.error('Error executing query', err.stack));