const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const dotenv = require('dotenv');

// Загрузка переменных окружения
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Получаем данные сервисного аккаунта из переменной окружения
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
} catch (error) {
  console.error('Error parsing GOOGLE_SERVICE_ACCOUNT:', error);
  serviceAccount = null;
}

// Создаем JWT клиент для аутентификации
function getAuthClient() {
  if (!serviceAccount) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT environment variable is not set or is invalid');
  }
  
  return new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
}

// Получение списка таблиц
app.get('/spreadsheets', async (req, res) => {
  try {
    const auth = getAuthClient();
    const drive = google.drive({ version: 'v3', auth });
    
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name)'
    });
    
    res.json(response.data.files);
  } catch (error) {
    console.error('Error listing spreadsheets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получение информации о таблице
app.get('/spreadsheets/:spreadsheetId', async (req, res) => {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: req.params.spreadsheetId
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error getting spreadsheet:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получение значений из диапазона
app.get('/spreadsheets/:spreadsheetId/values/:range', async (req, res) => {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: req.params.spreadsheetId,
      range: req.params.range
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error getting values:', error);
    res.status(500).json({ error: error.message });
  }
});

// Обновление значений в диапазоне
app.put('/spreadsheets/:spreadsheetId/values/:range', async (req, res) => {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: req.params.spreadsheetId,
      range: req.params.range,
      valueInputOption: req.query.valueInputOption || 'RAW',
      resource: {
        values: req.body.values
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error updating values:', error);
    res.status(500).json({ error: error.message });
  }
});

// Простой маршрут для проверки работоспособности
app.get('/', (req, res) => {
  res.json({ status: 'Google Sheets API Proxy is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Google Sheets API proxy server running on port ${PORT}`);
});
