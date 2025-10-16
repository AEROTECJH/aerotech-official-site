# Настройка

Руководство по настройке беспилотных платформ AEROTECH.

## Первоначальная настройка

### 1. Распаковка и сборка

Следуйте инструкциям из [Быстрого старта](../getting-started/quick-start.md).

### 2. Установка программного обеспечения

**Наземная станция:**

```bash
# Для Linux/macOS
wget https://downloads.arlist.tech/ground-station/latest/aerotech-gs-installer.sh
chmod +x aerotech-gs-installer.sh
sudo ./aerotech-gs-installer.sh

# Для Windows
# Скачайте AerotechGroundStation.exe с сайта и запустите
```

**Мобильное приложение:**
- iOS: [App Store](https://apps.apple.com/app/aerotech-control)
- Android: [Google Play](https://play.google.com/store/apps/details?id=tech.arlist.aerotech)

### 3. Подключение к дрону

**USB подключение:**
1. Подключите дрон к компьютеру через USB
2. Запустите Ground Station
3. Выберите COM порт
4. Установите скорость: 57600 baud

**Wi-Fi подключение:**
1. Включите дрон
2. Подключитесь к Wi-Fi сети дрона (AEROTECH-XXXX)
3. Пароль: см. на наклейке дрона
4. Откройте Ground Station
5. Выберите TCP подключение: 192.168.4.1:14550

## Калибровка

### Калибровка компаса

**Важно!** Проводите калибровку вдали от металлических объектов.

```
1. Выберите "Calibrate Compass" в Ground Station
2. Медленно поверните дрон на 360° горизонтально
3. Поверните дрон вертикально (нос вверх-вниз) на 360°
4. Дождитесь подтверждения
```

### Калибровка акселерометра

```
1. Выберите "Calibrate Accelerometer"
2. Разместите дрон в 6 позициях:
   - Горизонтально (нормально)
   - На левом боку
   - На правом боку
   - Носом вверх
   - Носом вниз
   - Вверх ногами
3. Удерживайте каждую позицию до сигнала
```

### Калибровка радио

```
1. Включите пульт управления
2. Выберите "Calibrate Radio"
3. Двигайте все стики в крайние положения
4. Нажмите "Complete"
```

## Параметры полета

### Базовые параметры

Рекомендуемые настройки для начинающих:

```yaml
Flight Modes:
  Mode 1: Stabilize
  Mode 2: Alt Hold
  Mode 3: Loiter
  Mode 4: RTL
  Mode 5: Auto

Failsafe:
  Battery: RTL at 20%
  Radio: RTL after 3 seconds
  GCS: Continue mission

Geofence:
  Enabled: Yes
  Max Altitude: 120 meters
  Max Distance: 500 meters
  Action: RTL
```

### Продвинутые параметры

```yaml
PID Tuning:
  # Только для опытных пользователей
  Roll P: 0.150
  Roll I: 0.100
  Roll D: 0.004
  
Navigation:
  Waypoint Radius: 2 meters
  Loiter Radius: 10 meters
  RTL Altitude: 50 meters
```

## Настройка полезной нагрузки

### Камера

```
1. Подключите камеру к порту AUX
2. Настройте триггер в Ground Station
3. Установите параметры:
   - Interval: 2 seconds (для mapping)
   - Distance: 10 meters (для corridor mapping)
```

### Тепловизор

```
1. Подключите к HDMI порту
2. Настройте параметры в меню камеры
3. Выберите цветовую палитру
4. Установите диапазон температур
```

## Проверка перед полетом

Контрольный список:

- [ ] Батареи заряжены и установлены
- [ ] Пропеллеры установлены правильно
- [ ] SD карта установлена
- [ ] GPS получает сигнал (min 8 satellites)
- [ ] Компас откалиброван
- [ ] Failsafe настроен
- [ ] Радио связь работает
- [ ] Geofence настроен
- [ ] Погода подходит для полета
- [ ] Разрешение на полет получено

## Обновление прошивки

**ВАЖНО:** Обновляйте прошивку только с полностью заряженной батареей!

```bash
# Через Ground Station
1. Подключите дрон через USB
2. Перейдите в "Firmware Update"
3. Выберите последнюю версию
4. Нажмите "Update"
5. НЕ отключайте дрон во время обновления!

# Через командную строку (Linux)
aerotech-cli firmware update --port /dev/ttyUSB0 --file firmware-v2.5.1.hex
```

## Резервное копирование

Сохраните конфигурацию перед изменениями:

```bash
# Экспорт параметров
aerotech-cli config export --output my-drone-config.json

# Импорт параметров
aerotech-cli config import --file my-drone-config.json
```

## Решение проблем

См. [Устранение неполадок](troubleshooting.md).

---

*После настройки переходите к [Примерам использования](examples.md)*
