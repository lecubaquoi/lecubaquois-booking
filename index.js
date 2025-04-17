const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

app.post('/book', async (req, res) => {
  try {
    const keyBase64 = process.env.GOOGLE_SERVICE_KEY_B64;
    if (!keyBase64) throw new Error("Environment variable 'GOOGLE_SERVICE_KEY_B64' not found");

    let key;
    try {
      key = JSON.parse(Buffer.from(keyBase64, 'base64').toString('utf-8'));
    } catch (parseErr) {
      throw new Error("Failed to decode GOOGLE_SERVICE_KEY_B64. Invalid Base64 or malformed JSON.");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    let client;
    try {
      client = await auth.getClient();
    } catch (authErr) {
      throw new Error("Failed to authenticate with Google API: " + authErr.message);
    }

    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = '1AZZ_SsEmgyf1Q3KybWDA0qqlDR5HQwclTzar9pWGkaY';
    const range = 'Table1!A2:F';
    const { service, barber, date, time, name, phone } = req.body;

    if (!(service && barber && date && time && name && phone)) {
      throw new Error("Missing one or more booking fields (service, barber, date, time, name, phone)");
    }

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[service, barber, date, time, name, phone]],
        }
      });
    } catch (sheetsErr) {
      throw new Error("Failed to write to Google Sheet: " + sheetsErr.message);
    }

    console.log(`✅ Booking saved: ${name} - ${service}`);
    res.json({ status: 'success' });

  } catch (err) {
    console.error('❌ Error saving booking:', err.message);
    res.status(500).json({ error: 'Booking failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Booking backend running on port ${PORT}`);
});