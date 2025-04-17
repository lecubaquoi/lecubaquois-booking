const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

app.post('/book', async (req, res) => {
  try {
    // Decode the service account key from base64 env variable
    const key = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_KEY_B64, 'base64').toString('utf8'));

    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = '1AZZ_SsEmgyf1Q3KybWDA0qqlDR5HQwclTzar9pWGkaY';
    const range = 'Table1!A2:F';
    const { service, barber, date, time, name, phone } = req.body;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[service, barber, date, time, name, phone]],
      }
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