# API Overview

Обзор AEROTECH API для интеграции беспилотных платформ.

## Введение

AEROTECH предоставляет REST API и WebSocket интерфейсы для управления беспилотными платформами, получения телеметрии и интеграции с внешними системами.

### Основные возможности

- 🔌 REST API для основных операций
- 📡 WebSocket для real-time данных
- 🐍 Python SDK
- 📱 Mobile SDK (iOS/Android)
- 🤖 ROS интеграция

## Quick Start

### Получение API ключа

1. Зарегистрируйтесь на [developer portal](https://developers.arlist.tech)
2. Создайте приложение
3. Получите API ключ и секрет

### Первый запрос

```bash
# Установите переменные окружения
export AEROTECH_API_KEY="your_api_key"
export AEROTECH_API_SECRET="your_api_secret"

# Получите токен доступа
curl -X POST https://api.arlist.tech/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "'$AEROTECH_API_KEY'",
    "api_secret": "'$AEROTECH_API_SECRET'"
  }'
```

**Ответ:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

## API Endpoints

### Base URL

```
Production: https://api.arlist.tech/v1
Sandbox: https://sandbox-api.arlist.tech/v1
```

### Аутентификация

Все запросы требуют Bearer токен:

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://api.arlist.tech/v1/drones
```

### Основные endpoints

#### Дроны

```http
GET    /drones              # Список дронов
GET    /drones/{id}         # Информация о дроне
POST   /drones              # Регистрация дрона
PUT    /drones/{id}         # Обновление конфигурации
DELETE /drones/{id}         # Удаление дрона
```

#### Телеметрия

```http
GET    /drones/{id}/telemetry        # Текущая телеметрия
GET    /drones/{id}/telemetry/history # История телеметрии
```

#### Команды

```http
POST   /drones/{id}/commands         # Отправить команду
GET    /drones/{id}/commands/{cmd_id} # Статус команды
```

#### Миссии

```http
GET    /missions            # Список миссий
POST   /missions            # Создать миссию
GET    /missions/{id}       # Информация о миссии
PUT    /missions/{id}       # Обновить миссию
DELETE /missions/{id}       # Удалить миссию
POST   /missions/{id}/start # Запустить миссию
POST   /missions/{id}/pause # Приостановить миссию
POST   /missions/{id}/stop  # Остановить миссию
```

## Python SDK

### Установка

```bash
pip install aerotech-sdk
```

### Базовое использование

```python
from aerotech import AerotechClient

# Инициализация клиента
client = AerotechClient(
    api_key='your_api_key',
    api_secret='your_api_secret'
)

# Получить список дронов
drones = client.drones.list()
for drone in drones:
    print(f"Drone {drone.id}: {drone.status}")

# Получить телеметрию
drone = client.drones.get('drone-001')
telemetry = drone.get_telemetry()
print(f"Position: {telemetry.latitude}, {telemetry.longitude}")
print(f"Battery: {telemetry.battery_percent}%")

# Отправить команду
result = drone.takeoff(altitude=10)
print(f"Command status: {result.status}")
```

### Работа с миссиями

```python
from aerotech.missions import Mission, Waypoint

# Создать миссию
mission = Mission()
mission.add_waypoint(Waypoint(
    latitude=55.7558,
    longitude=37.6173,
    altitude=100,
    action='photo'
))
mission.add_waypoint(Waypoint(
    latitude=55.7600,
    longitude=37.6200,
    altitude=100
))

# Загрузить миссию на дрон
drone = client.drones.get('drone-001')
drone.upload_mission(mission)

# Запустить миссию
drone.start_mission()

# Мониторинг
while drone.mission_active():
    progress = drone.get_mission_progress()
    print(f"Progress: {progress.completed_waypoints}/{progress.total_waypoints}")
```

### Real-time телеметрия (WebSocket)

```python
from aerotech import AerotechClient

client = AerotechClient(api_key='...', api_secret='...')

# Подписаться на телеметрию
@client.on_telemetry('drone-001')
def handle_telemetry(telemetry):
    print(f"Altitude: {telemetry.altitude}m")
    print(f"Speed: {telemetry.speed}m/s")
    print(f"Battery: {telemetry.battery_percent}%")

# Запустить listening
client.start()
```

## REST API Examples

### Получить список дронов

**Request:**
```bash
curl -X GET https://api.arlist.tech/v1/drones \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "drones": [
    {
      "id": "drone-001",
      "name": "K1 Alpha",
      "type": "k1",
      "status": "ready",
      "firmware_version": "2.5.1",
      "battery_percent": 85,
      "location": {
        "latitude": 55.7558,
        "longitude": 37.6173,
        "altitude": 0
      }
    }
  ],
  "total": 1
}
```

### Отправить команду взлета

**Request:**
```bash
curl -X POST https://api.arlist.tech/v1/drones/drone-001/commands \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "takeoff",
    "parameters": {
      "altitude": 10
    }
  }'
```

**Response:**
```json
{
  "command_id": "cmd-12345",
  "status": "accepted",
  "estimated_completion": "2025-10-16T10:30:15Z"
}
```

### Создать миссию

**Request:**
```bash
curl -X POST https://api.arlist.tech/v1/missions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Survey Mission Alpha",
    "drone_id": "drone-001",
    "waypoints": [
      {
        "latitude": 55.7558,
        "longitude": 37.6173,
        "altitude": 100,
        "action": "photo"
      },
      {
        "latitude": 55.7600,
        "longitude": 37.6200,
        "altitude": 100,
        "action": "photo"
      }
    ],
    "settings": {
      "speed": 15,
      "return_to_home": true
    }
  }'
```

**Response:**
```json
{
  "mission_id": "mission-789",
  "status": "created",
  "estimated_duration": 600,
  "estimated_distance": 5000
}
```

## WebSocket API

### Подключение

```javascript
const ws = new WebSocket('wss://api.arlist.tech/v1/stream?token=YOUR_TOKEN');

ws.onopen = () => {
    console.log('Connected to AEROTECH API');
    
    // Подписаться на телеметрию
    ws.send(JSON.stringify({
        type: 'subscribe',
        channel: 'telemetry',
        drone_id: 'drone-001'
    }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'telemetry') {
        console.log('Telemetry:', data.payload);
    }
};
```

### Каналы подписки

- `telemetry` - телеметрия дрона
- `status` - изменения статуса
- `mission_progress` - прогресс миссии
- `alerts` - предупреждения и ошибки
- `video` - видеопоток (requires separate authentication)

## Rate Limits

```
Free tier:     100 requests/minute
Basic:        1000 requests/minute
Professional: 5000 requests/minute
Enterprise:   Unlimited
```

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 997
X-RateLimit-Reset: 1634371200
```

## Обработка ошибок

**Error Response:**
```json
{
  "error": {
    "code": "DRONE_NOT_FOUND",
    "message": "Drone with ID 'drone-999' not found",
    "details": {
      "drone_id": "drone-999"
    }
  }
}
```

**HTTP Status Codes:**
```
200 OK              - Success
201 Created         - Resource created
400 Bad Request     - Invalid parameters
401 Unauthorized    - Invalid/missing token
403 Forbidden       - Insufficient permissions
404 Not Found       - Resource not found
429 Too Many Requests - Rate limit exceeded
500 Internal Error  - Server error
```

## Безопасность

### Best Practices

1. **Храните ключи безопасно**
   - Никогда не коммитьте ключи в Git
   - Используйте переменные окружения
   - Ротируйте ключи регулярно

2. **Используйте HTTPS**
   - Все запросы только через HTTPS
   - Проверяйте SSL сертификаты

3. **Ограничивайте права**
   - Используйте минимальные необходимые права
   - Создавайте отдельные ключи для разных приложений

## Следующие шаги

- [Аутентификация](authentication.md) - детальная информация об аутентификации
- [Endpoints](endpoints.md) - полная документация всех endpoints
- [Примеры](../guides/examples.md) - практические примеры использования

---

*Полная документация доступна на [developers.arlist.tech](https://developers.arlist.tech)*
