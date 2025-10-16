# AEROTECH Blog

Этот каталог содержит блог для сайта AEROTECH.

## Структура

```
blog/
├── blog.html          # Главная страница блога со списком новостей
├── blog.css           # Стили для блога
├── blog.js            # JavaScript функциональность (модальные окна, парсинг markdown)
└── articles/          # Папка со статьями в формате Markdown
    ├── k1-development-update.md
    ├── 3d-printing-innovations.md
    └── aerotech-vision-2025.md
```

## Как добавить новую новость

### Шаг 1: Создайте файл статьи

Создайте новый файл `.md` в папке `articles/` с содержимым статьи в формате Markdown.

**Пример структуры статьи:**

```markdown
# Заголовок статьи

**Дата:** 15 октября 2025  
**Автор:** Имя автора

## Введение

Текст введения...

## Основной раздел

Текст основного раздела...

### Подраздел

- Пункт списка 1
- Пункт списка 2

## Заключение

Заключительный текст...
```

### Шаг 2: Добавьте карточку новости в blog.html

Откройте `blog.html` и добавьте новую карточку в секцию `<div class="blog-news-grid" id="news-list">`:

```html
<article class="news-card" data-article="имя-файла-без-расширения">
    <div class="news-card-header">
        <span class="news-category">Категория</span>
        <time class="news-date" datetime="2025-10-15">15 октября 2025</time>
    </div>
    <h2 class="news-title">Заголовок новости</h2>
    <p class="news-excerpt">
        Краткое описание новости для отображения на карточке...
    </p>
    <div class="news-footer">
        <span class="news-author">Имя автора</span>
        <button class="news-read-more" aria-label="Читать статью полностью">
            Читать далее
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    </div>
</article>
```

**Важные атрибуты:**

- `data-article` - имя файла статьи без расширения `.md` (например, `data-article="my-article"` для файла `my-article.md`)
- `news-category` - категория новости (например: "Разработка", "Технологии", "Компания")
- `datetime` - дата в формате ISO (YYYY-MM-DD)
- `news-date` - дата в человекочитаемом формате
- `news-title` - заголовок новости
- `news-excerpt` - краткое описание (2-3 предложения)
- `news-author` - имя автора

### Шаг 3: Проверьте результат

1. Откройте `blog.html` в браузере
2. Новая карточка должна появиться в списке
3. При клике на карточку или кнопку "Читать далее" должна открыться модальное окно со статьей

## Поддерживаемый Markdown синтаксис

Блог поддерживает следующие элементы Markdown:

- **Заголовки:** `# H1`, `## H2`, `### H3`
- **Жирный текст:** `**текст**`
- **Курсив:** `*текст*`
- **Ссылки:** `[текст](url)`
- **Изображения:** `![alt текст](url)`
- **Код:** `` `inline code` `` и блоки кода между \`\`\`
- **Списки:** `- пункт` или `1. пункт`
- **Цитаты:** `> цитата`
- **Горизонтальная линия:** `---`
- **Таблицы:** базовая поддержка таблиц с `|`

## Расширенные возможности

### HTML-разметка

Блог теперь поддерживает **прямую вставку HTML-кода** в статьи. Это позволяет использовать:

- Пользовательские стили и классы
- Сложные структуры контента
- Любые HTML-элементы

**Пример:**

```html
<div style="background: #f0f0f0; padding: 20px; border-radius: 8px;">
    <h3>Важное объявление</h3>
    <p>Текст с <strong>HTML-разметкой</strong></p>
</div>
```

### Видео

Вы можете легко встраивать видео в статьи несколькими способами:

#### YouTube и Vimeo (через iframe)

```html
<iframe width="560" height="315" 
    src="https://www.youtube.com/embed/VIDEO_ID" 
    title="YouTube video player" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
</iframe>
```

#### HTML5 видео

```html
<video width="640" height="360" controls>
    <source src="/videos/my-video.mp4" type="video/mp4">
    <source src="/videos/my-video.webm" type="video/webm">
    Ваш браузер не поддерживает видео HTML5.
</video>
```

#### Адаптивное видео с обёрткой

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
    <iframe 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
        src="https://www.youtube.com/embed/VIDEO_ID" 
        frameborder="0" 
        allowfullscreen>
    </iframe>
</div>
```

### Изображения с дополнительными опциями

Помимо стандартного синтаксиса Markdown, вы можете использовать HTML для большего контроля:

```html
<figure style="text-align: center;">
    <img src="/images/photo.jpg" alt="Описание" style="max-width: 100%; border-radius: 8px;">
    <figcaption style="margin-top: 10px; color: #666;">Подпись к изображению</figcaption>
</figure>
```

## Рекомендации по оформлению статей

1. **Используйте четкую структуру** с заголовками разных уровней
2. **Начинайте с метаданных** (дата, автор)
3. **Добавляйте введение и заключение** для полноты статьи
4. **Используйте изображения** для иллюстрации (храните в `/images/`)
5. **Добавляйте ссылки** на связанные страницы и внешние ресурсы
6. **Разбивайте текст на абзацы** для лучшей читаемости

## Примеры

Посмотрите существующие статьи в папке `articles/` для примеров оформления.
