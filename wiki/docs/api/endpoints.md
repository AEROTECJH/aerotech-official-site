# API Endpoints

Полная документация всех API endpoints.

## Дроны

### GET /drones

Получить список всех дронов.

**Parameters:**
- `status` (optional) - фильтр по статусу: `ready`, `flying`, `charging`, `maintenance`
- `type` (optional) - фильтр по типу: `k1`, `sr`, `custom`
- `page` (optional) - номер страницы (default: 1)
- `limit` (optional) - количество на странице (default: 20, max: 100)

**Response:**
```json
{
  "drones": [...],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

### GET /drones/{id}

Получить информацию о конкретном дроне.

### POST /drones

Зарегистрировать новый дрон.

**Request Body:**
```json
{
  "name": "K1 Alpha",
  "type": "k1",
  "serial_number": "K1-2025-001"
}
```

## Телеметрия

### GET /drones/{id}/telemetry

Получить текущую телеметрию дрона.

**Response:**
```json
{
  "timestamp": "2025-10-16T10:30:00Z",
  "position": {
    "latitude": 55.7558,
    "longitude": 37.6173,
    "altitude": 150
  },
  "velocity": {
    "north": 5.2,
    "east": 3.1,
    "down": -0.5
  },
  "battery": {
    "percent": 75,
    "voltage": 22.1,
    "current": 15.5
  },
  "status": "flying"
}
```

## Команды

### POST /drones/{id}/commands

Отправить команду дрону.

**Available Commands:**

**Takeoff:**
```json
{
  "command": "takeoff",
  "parameters": {
    "altitude": 10
  }
}
```

**Land:**
```json
{
  "command": "land",
  "parameters": {}
}
```

**Goto:**
```json
{
  "command": "goto",
  "parameters": {
    "latitude": 55.7558,
    "longitude": 37.6173,
    "altitude": 100
  }
}
```

**Return to Home:**
```json
{
  "command": "return_to_home",
  "parameters": {}
}
```

## Миссии

### POST /missions

Создать новую миссию.

**Request Body:**
```json
{
  "name": "Survey Mission",
  "drone_id": "drone-001",
  "waypoints": [
    {
      "latitude": 55.7558,
      "longitude": 37.6173,
      "altitude": 100,
      "action": "photo",
      "delay": 2
    }
  ],
  "settings": {
    "speed": 15,
    "return_to_home": true,
    "failsafe_action": "return_to_home"
  }
}
```

### GET /missions/{id}

Получить информацию о миссии.

### POST /missions/{id}/start

Запустить миссию.

### POST /missions/{id}/pause

Приостановить миссию.

### POST /missions/{id}/stop

Остановить миссию.

---

Полная документация: [developers.arlist.tech](https://developers.arlist.tech)
