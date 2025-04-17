const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

app.post('/book', async (req, res) => {
  try {
    const { service, barber, date, time, name, phone } = req.body;

    const auth = new google.auth.GoogleAuth({
      keyFile: './lecubaquois-booking-1a186c9be3af.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = '1AZZ_SsEmgyf1Q3KybWDA0qqlDR5HQwclTzar9pWGkaY';
    const range = 'Table1!A2:F';

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[service, barber, date, time, name, phone]],
      },
    });

    console.log(`✅ Booking saved: ${name} - ${service}`);
    res.json({ status: 'success' });
  } catch (err) {
    console.error('❌ Error saving booking:', err);
    res.status(500).json({ error: 'Failed to save booking' });
  }
});

app.listen(PORT, () => {
  console.log(`Booking backend running on port ${PORT}`);
});