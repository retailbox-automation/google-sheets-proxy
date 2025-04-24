# Google Sheets API Proxy

Прокси-сервис для работы с Google Sheets API через сервисный аккаунт Google. Этот сервис предоставляет простой HTTP API для взаимодействия с Google Sheets, используя JWT аутентификацию сервисного аккаунта.

## Зачем нужен этот сервис?

Этот сервис решает следующие проблемы:

1. Упрощает интеграцию Google Sheets API с платформами, которые поддерживают только API Key или Basic Auth (например, LibreChat)
2. Автоматически обрабатывает авторизацию через сервисный аккаунт Google
3. Предоставляет простой REST API для чтения и записи данных в Google Sheets

## Требования

- Node.js 18 или выше
- Сервисный аккаунт Google с доступом к Google Sheets API

## Установка и запуск

### Локальная разработка

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/your-username/google-sheets-proxy.git
   cd google-sheets-proxy
