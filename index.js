
const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const app = express();
const PORT = process.env.PORT || 3000;
const sheetId = '1AZZ_SsEmgyf1Q3KybWDA0qqlDR5HQwclTzar9pWGkaY'; // Your Google Sheet ID

app.use(bodyParser.json());

const auth = new google.auth.GoogleAuth({
  keyFile: 'lecubaquois-booking-1a186c9be3af.json', // Path to your service account key
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

app.post('/book', async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const { service, barber, date, time, name, phone } = req.body;

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Bookings!A1',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[service, barber, date, time, name, phone]]
      }
    });

    res.status(200).json({ message: 'Booking saved!' });
  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`Booking backend running on port ${PORT}`);
});
