# Примеры использования

Практические примеры работы с платформами AEROTECH.

## Базовые операции

### Взлет и посадка

```python
from aerotech import AerotechClient

client = AerotechClient(api_key='...', api_secret='...')
drone = client.drones.get('drone-001')

# Взлет на высоту 10 метров
drone.takeoff(altitude=10)

# Подождать завершения
drone.wait_for_command_completion()

# Зависание на 30 секунд
import time
time.sleep(30)

# Посадка
drone.land()
```

### Полет в точку

```python
# Полет в заданную точку
drone.goto(
    latitude=55.7558,
    longitude=37.6173,
    altitude=50
)

# Мониторинг прогресса
while not drone.is_at_target():
    pos = drone.get_position()
    print(f"Current: {pos.latitude}, {pos.longitude}, {pos.altitude}m")
    time.sleep(1)
```

## Автономные миссии

### Простая миссия облета

```python
from aerotech.missions import Mission, Waypoint

# Создать миссию
mission = Mission(name="Perimeter Survey")

# Добавить точки маршрута
waypoints = [
    (55.7558, 37.6173, 100),  # lat, lon, alt
    (55.7600, 37.6173, 100),
    (55.7600, 37.6220, 100),
    (55.7558, 37.6220, 100),
    (55.7558, 37.6173, 100),  # вернуться к старту
]

for lat, lon, alt in waypoints:
    mission.add_waypoint(Waypoint(
        latitude=lat,
        longitude=lon,
        altitude=alt,
        action='photo'  # сделать фото в каждой точке
    ))

# Загрузить и запустить
drone.upload_mission(mission)
drone.start_mission()

# Мониторинг
while drone.mission_active():
    progress = drone.get_mission_progress()
    print(f"Waypoint {progress.current}/{progress.total}")
    print(f"Battery: {drone.get_battery_percent()}%")
    time.sleep(5)
```

### Миссия mapping с grid pattern

```python
from aerotech.missions import GridMission

# Создать grid миссию для покрытия площади
mission = GridMission(
    name="Agricultural Survey",
    area_polygon=[
        (55.7550, 37.6170),
        (55.7650, 37.6170),
        (55.7650, 37.6250),
        (55.7550, 37.6250),
    ],
    altitude=80,
    speed=12,  # m/s
    overlap=0.7,  # 70% overlap
    camera_angle=90,  # nadir
    pattern='parallel'  # или 'crosshatch'
)

# Оптимизировать маршрут
mission.optimize()

# Оценить время и расстояние
print(f"Estimated duration: {mission.estimated_duration/60:.1f} minutes")
print(f"Estimated distance: {mission.estimated_distance/1000:.2f} km")
print(f"Number of photos: {mission.estimated_photos}")

# Выполнить
drone.execute_mission(mission)
```

## Работа с камерой

### Фото и видео

```python
# Сделать фото
drone.camera.take_photo()

# Начать запись видео
drone.camera.start_recording()

# Записывать 60 секунд
time.sleep(60)

# Остановить запись
drone.camera.stop_recording()

# Скачать медиафайлы
media_files = drone.camera.list_media()
for file in media_files:
    drone.camera.download(file, destination='/path/to/save/')
```

### Управление гимбалом

```python
# Наклонить камеру вниз (nadir)
drone.gimbal.set_pitch(-90)

# Наклонить вперед на 45°
drone.gimbal.set_pitch(-45)

# Повернуть камеру
drone.gimbal.set_yaw(90)

# Вернуть в нейтральное положение
drone.gimbal.reset()
```

## Телеметрия и мониторинг

### Real-time мониторинг

```python
from aerotech import AerotechClient

client = AerotechClient(api_key='...', api_secret='...')

@client.on_telemetry('drone-001')
def handle_telemetry(telemetry):
    print(f"Position: {telemetry.latitude:.6f}, {telemetry.longitude:.6f}")
    print(f"Altitude: {telemetry.altitude:.1f}m")
    print(f"Speed: {telemetry.speed:.1f}m/s")
    print(f"Battery: {telemetry.battery_percent}%")
    print(f"Satellites: {telemetry.satellites}")
    print("---")

# Запустить мониторинг
client.start()
```

### Логирование полетов

```python
# Начать запись лога
drone.logging.start()

# Выполнить полет
mission = ...
drone.execute_mission(mission)

# Остановить запись
drone.logging.stop()

# Скачать лог
log_file = drone.logging.download_latest()

# Анализ лога
from aerotech.analysis import FlightLog

log = FlightLog(log_file)
print(f"Flight time: {log.duration} seconds")
print(f"Max altitude: {log.max_altitude}m")
print(f"Max speed: {log.max_speed}m/s")
print(f"Distance traveled: {log.total_distance}m")

# Построить график высоты
log.plot_altitude()
log.plot_speed()
log.plot_battery()
```

## Обработка событий

### Реагирование на низкий заряд

```python
@client.on_event('battery_low')
def handle_low_battery(event):
    drone_id = event.drone_id
    battery_percent = event.data['battery_percent']
    
    print(f"Warning: Drone {drone_id} battery low: {battery_percent}%")
    
    # Автоматически вернуть домой
    drone = client.drones.get(drone_id)
    if drone.mission_active():
        drone.pause_mission()
    drone.return_to_home()
```

### Обнаружение геозоны

```python
@client.on_event('geofence_breach')
def handle_geofence(event):
    drone_id = event.drone_id
    location = event.data['location']
    
    print(f"Alert: Drone {drone_id} breached geofence!")
    print(f"Location: {location}")
    
    # Автоматически вернуть в зону
    drone = client.drones.get(drone_id)
    drone.return_to_home()
```

## Интеграция с роем (Synergia)

### Координация нескольких дронов

```python
from aerotech.synergia import Swarm

# Создать рой
swarm = Swarm(name="Survey Team")
swarm.add_drone('drone-001')
swarm.add_drone('drone-002')
swarm.add_drone('drone-003')

# Создать распределенную миссию
from aerotech.synergia import AreaCoverageMission

mission = AreaCoverageMission(
    area_polygon=[...],
    altitude=100,
    drones_count=3
)

# Автоматическое распределение задач
swarm.execute_mission(mission)

# Мониторинг всего роя
while swarm.mission_active():
    status = swarm.get_status()
    print(f"Coverage: {status.coverage_percent}%")
    print(f"Active drones: {status.active_drones}/{status.total_drones}")
    time.sleep(10)
```

## Продвинутые сценарии

### Следование за объектом

```python
# Включить режим Follow Me
drone.set_mode('FOLLOW_ME')

# Установить параметры
drone.follow_me.set_distance(10)  # 10 метров позади
drone.follow_me.set_altitude(20)   # 20 метров над объектом
drone.follow_me.set_angle(0)       # сзади (180 = спереди)

# Начать следование
drone.follow_me.start(target_id='mobile-device-001')

# Следование будет продолжаться автоматически
# Остановить когда нужно
drone.follow_me.stop()
```

### Orbit (облет точки интереса)

```python
# Orbit вокруг точки
drone.orbit(
    center_lat=55.7558,
    center_lon=37.6173,
    radius=50,          # радиус в метрах
    altitude=30,        # высота облета
    speed=5,            # m/s
    rotations=3,        # количество оборотов
    camera_facing='center'  # камера смотрит в центр
)
```

### Инспекция вышки/здания

```python
from aerotech.missions import InspectionMission

# Автоматическая инспекция вертикальной структуры
mission = InspectionMission(
    structure_center=(55.7558, 37.6173),
    structure_height=100,  # метры
    structure_radius=10,   # радиус структуры
    inspection_distance=15,  # расстояние от структуры
    vertical_overlap=0.5,
    horizontal_points=12,   # 12 точек вокруг (каждые 30°)
)

drone.execute_mission(mission)
```

## Обработка ошибок

### Безопасная обработка исключений

```python
from aerotech.exceptions import (
    DroneNotReadyError,
    LowBatteryError,
    GPSError,
    WeatherError
)

try:
    drone.takeoff(altitude=10)
    drone.goto(55.7558, 37.6173, 50)
    
except DroneNotReadyError as e:
    print(f"Drone not ready: {e}")
    # Проверить статус и повторить
    
except LowBatteryError as e:
    print(f"Battery too low: {e.battery_percent}%")
    drone.return_to_home()
    
except GPSError as e:
    print(f"GPS issue: {e}")
    drone.land()
    
except WeatherError as e:
    print(f"Bad weather: {e}")
    # Отложить миссию
    
finally:
    # Всегда убедиться что дрон приземлился
    if drone.is_flying():
        drone.land()
```

---

*Больше примеров на [GitHub](https://github.com/AEROTECJH/examples)*

Следующий шаг: [Устранение неполадок](troubleshooting.md)
