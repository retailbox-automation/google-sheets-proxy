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
  const envVar = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!envVar || envVar === 'undefined') {
    console.error('GOOGLE_SERVICE_ACCOUNT environment variable is not set or is undefined');
    serviceAccount = null;
  } else {
    serviceAccount = JSON.parse(envVar);
    console.log('Successfully parsed GOOGLE_SERVICE_ACCOUNT');
  }
} catch (error) {
  console.error('Error parsing GOOGLE_SERVICE_ACCOUNT:', error);
  serviceAccount = null;
}

// Создаем JWT клиент для аутентификации
function getAuthClient() {
  if (!serviceAccount) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT environment variable is not set or is invalid');
  }
  
  // Добавляем разрешение для Drive API для получения списка таблиц
  return new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.readonly'
    ]
  );
}

// Получение списка таблиц
app.get('/spreadsheets', async (req, res) => {
  try {
    const auth = getAuthClient();
    const drive = google.drive({ version: 'v3', auth });
    
    console.log('Requesting spreadsheets list from Google Drive API...');
    
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name)'
    });
    
    console.log(`Found ${response.data.files.length} spreadsheets`);
    res.json(response.data.files);
  } catch (error) {
    console.error('Error listing spreadsheets:', error);
    
    // Более подробный вывод ошибки для диагностики
    const errorDetails = {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.errors || 'No detailed errors'
    };
    
    res.status(500).json({ 
      error: error.message,
      details: errorDetails,
      tip: "Убедитесь, что Drive API активирован в Google Cloud Console и сервисный аккаунт имеет правильные разрешения"
    });
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
  console.log(`Service account: ${serviceAccount ? serviceAccount.client_email : 'Not configured'}`);
  console.log(`Using scopes: https://www.googleapis.com/auth/spreadsheets, https://www.googleapis.com/auth/drive.readonly`);
});
