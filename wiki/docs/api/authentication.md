# Аутентификация

Руководство по аутентификации в AEROTECH API.

## Типы аутентификации

AEROTECH API поддерживает следующие методы аутентификации:

1. **API Keys** - для server-to-server интеграции
2. **OAuth 2.0** - для приложений от третьих лиц
3. **JWT Tokens** - для мобильных и web приложений

## API Keys

### Получение API ключа

1. Зарегистрируйтесь на [developers.arlist.tech](https://developers.arlist.tech)
2. Перейдите в раздел "Applications"
3. Создайте новое приложение
4. Получите API Key и API Secret

### Использование

```bash
curl -X POST https://api.arlist.tech/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "your_api_key",
    "api_secret": "your_api_secret"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def502003e7c..."
}
```

### Использование токена

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://api.arlist.tech/v1/drones
```

## OAuth 2.0

### Authorization Code Flow

**Шаг 1: Получение authorization code**

```
https://auth.arlist.tech/oauth/authorize?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=drones.read+drones.write&
  state=RANDOM_STATE
```

**Шаг 2: Обмен code на токен**

```bash
curl -X POST https://auth.arlist.tech/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=YOUR_REDIRECT_URI"
```

## Обновление токена

```bash
curl -X POST https://api.arlist.tech/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "your_refresh_token"
  }'
```

## Scopes

Доступные области доступа:

```
drones.read        - Чтение информации о дронах
drones.write       - Управление дронами
drones.telemetry   - Доступ к телеметрии
missions.read      - Чтение миссий
missions.write     - Создание и управление миссиями
analytics.read     - Доступ к аналитике
admin              - Административный доступ
```

## Безопасность

### Best Practices

1. Храните секреты в переменных окружения
2. Используйте HTTPS для всех запросов
3. Регулярно ротируйте ключи
4. Используйте минимально необходимые scopes
5. Никогда не передавайте токены в URL

Подробнее в [API Overview](overview.md).
