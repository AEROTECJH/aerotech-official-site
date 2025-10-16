# AEROTECH Wiki Документация

Статичная Wiki-документация для сайта AEROTECH.

## Структура

```
wiki/
├── index.html          # Главная страница wiki
├── wiki.css            # Стили для wiki
├── wiki.js             # JavaScript функциональность
├── pages/              # Папка со страницами документации
│   ├── getting-started.html
│   ├── k1-overview.html
│   └── ...
├── images/             # Изображения для документации
└── README.md           # Это файл
```

## Возможности

- **Структурированная навигация**: Боковая панель с категориями и подразделами
- **Поиск**: Быстрый поиск по заголовкам страниц
- **Адаптивный дизайн**: Работает на всех устройствах
- **Единый стиль**: Соответствует основному дизайну сайта AEROTECH

## Как добавить новую страницу документации

### Шаг 1: Создайте HTML файл страницы

Создайте новый файл в папке `pages/` со следующей структурой:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Название страницы — Wiki — AEROTECH</title>
    <meta name="description" content="Описание страницы">
    <meta name="theme-color" content="#0A0A0A">
    <link rel="icon" href="../../favicon.ico" type="image/x-icon">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../css/style.css">
    <link rel="stylesheet" href="../wiki.css">
</head>
<body>
    <!-- Навигация (скопируйте из index.html) -->
    <nav class="main-nav" role="navigation" aria-label="Главная навигация">
        <!-- ... -->
    </nav>

    <!-- Главный контент -->
    <main id="main-content" class="wiki-main">
        <div class="wiki-content-wrapper">
            <div class="container">
                <div class="wiki-layout">
                    <!-- Сайдбар (скопируйте из index.html) -->
                    <aside class="wiki-sidebar">
                        <!-- ... -->
                    </aside>

                    <!-- Основной контент страницы -->
                    <article class="wiki-main-content">
                        <div class="wiki-breadcrumbs">
                            <a href="../index.html">Wiki</a>
                            <span>›</span>
                            <a href="#">Раздел</a>
                            <span>›</span>
                            <span>Название страницы</span>
                        </div>

                        <div class="wiki-article">
                            <h1>Название страницы</h1>
                            
                            <p>Введение в тему...</p>

                            <h2>Основной раздел</h2>
                            <p>Текст раздела...</p>

                            <h3>Подраздел</h3>
                            <p>Текст подраздела...</p>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    </main>

    <!-- Футер (скопируйте из index.html) -->
    <footer class="main-footer">
        <!-- ... -->
    </footer>

    <script src="../../js/script.js"></script>
    <script src="../wiki.js"></script>
</body>
</html>
```

### Шаг 2: Добавьте ссылку в навигацию

Откройте `index.html` и все существующие страницы в `pages/`. Добавьте ссылку на новую страницу в соответствующий раздел навигации в сайдбаре:

```html
<div class="wiki-nav-section">
    <h3 class="wiki-nav-section-title">
        <button class="wiki-nav-toggle" aria-expanded="true">
            <!-- SVG иконка -->
            Название раздела
        </button>
    </h3>
    <ul class="wiki-nav-list">
        <li><a href="pages/existing-page.html">Существующая страница</a></li>
        <li><a href="pages/new-page.html">Новая страница</a></li>
    </ul>
</div>
```

### Шаг 3: Проверьте результат

1. Откройте `wiki/index.html` в браузере
2. Новая ссылка должна появиться в навигации
3. При клике на ссылку должна открыться новая страница
4. Проверьте, что breadcrumbs работают корректно

## Рекомендации по оформлению страниц

### Заголовки

- **H1** - используйте только один раз в начале страницы для главного заголовка
- **H2** - для основных разделов
- **H3** - для подразделов
- **H4** - для дополнительных уточнений

### Списки

```html
<!-- Ненумерованный список -->
<ul>
    <li>Элемент 1</li>
    <li>Элемент 2</li>
</ul>

<!-- Нумерованный список -->
<ol>
    <li>Шаг 1</li>
    <li>Шаг 2</li>
</ol>
```

### Код

```html
<!-- Inline код -->
<p>Используйте команду <code>npm install</code> для установки.</p>

<!-- Блок кода -->
<pre><code>function example() {
    return "Hello, World!";
}</code></pre>
```

### Таблицы

```html
<table>
    <thead>
        <tr>
            <th>Параметр</th>
            <th>Значение</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Вес</td>
            <td>5 кг</td>
        </tr>
    </tbody>
</table>
```

### Изображения

```html
<img src="../images/example.jpg" alt="Описание изображения">
```

Храните изображения в папке `wiki/images/`.

### Информационные блоки

```html
<div class="wiki-info-box">
    <h3>Важная информация</h3>
    <p>Текст важного сообщения...</p>
</div>
```

### Ссылки

```html
<!-- Внутренние ссылки -->
<a href="other-page.html">Другая страница</a>

<!-- Внешние ссылки -->
<a href="https://example.com" target="_blank" rel="noopener">Внешний сайт</a>

<!-- Ссылки на якоря -->
<a href="#section-id">Перейти к разделу</a>
```

## Разделы документации

Организуйте документацию по следующим категориям:

1. **Начало работы**
   - Введение
   - Быстрый старт
   - Установка и настройка

2. **Платформы**
   - Обзоры платформ (K1, Synergia, SR)
   - Технические характеристики
   - Руководства пользователя

3. **Технологии**
   - 3D печать
   - Композитные материалы
   - Аэродинамика
   - Другие технологии

4. **Разработка**
   - API Reference
   - SDK
   - Руководство разработчика
   - Участие в проекте

## Поиск

Поиск работает по заголовкам страниц в навигации. Для добавления страницы в поиск достаточно добавить её в навигацию в `index.html`.

## Стилизация

Все стили находятся в файле `wiki.css`. Основные классы:

- `.wiki-article` - контейнер для содержимого статьи
- `.wiki-info-box` - информационный блок
- `.wiki-breadcrumbs` - хлебные крошки
- `.wiki-card` - карточка на главной странице

## Технические требования

- Все страницы должны быть статическими HTML файлами
- Используйте относительные пути для ссылок и ресурсов
- Сохраняйте единообразие структуры между страницами
- Все изображения должны иметь атрибут `alt`
- Используйте семантические HTML теги

## Автоматизация (опционально)

Если вам нужно создать много страниц, вы можете:

1. Создать шаблон страницы
2. Использовать скрипт для генерации страниц из Markdown
3. Автоматизировать обновление навигации

Пример скрипта для генерации можно найти в блоге: `blog/markdown-parser.js`

## Участие

Чтобы внести вклад в документацию:

1. Создайте новую страницу или отредактируйте существующую
2. Проверьте, что все ссылки работают
3. Убедитесь, что страница корректно отображается на разных устройствах
4. Создайте pull request на GitHub

## Поддержка

По вопросам и предложениям обращайтесь через [GitHub Issues](https://github.com/AEROTECJH/aerotech-official-site/issues).
