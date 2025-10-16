// Article Page functionality
(function() {
    'use strict';

    // Use the shared markdown parser
    const parseMarkdown = window.MarkdownParser.parseMarkdown;

    // Get article name from URL parameter
    function getArticleNameFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('article');
    }

    // Load article content
    function loadArticle() {
        const articleName = getArticleNameFromUrl();
        const articleContent = document.getElementById('article-content');
        
        if (!articleName) {
            articleContent.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <h2>Статья не найдена</h2>
                    <p>Пожалуйста, выберите статью из <a href="blog.html">блога</a>.</p>
                </div>
            `;
            return;
        }
        
        const articlePath = `articles/${articleName}.md`;
        
        // Show loading state
        articleContent.classList.add('loading');
        articleContent.innerHTML = '';
        
        // Fetch markdown file
        fetch(articlePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load article: ${response.status}`);
                }
                return response.text();
            })
            .then(markdown => {
                // Parse markdown to HTML
                const html = parseMarkdown(markdown);
                
                // Remove loading state
                articleContent.classList.remove('loading');
                
                // Set content
                articleContent.innerHTML = html;
                
                // Update page title
                const titleElement = articleContent.querySelector('h1');
                if (titleElement) {
                    document.title = `${titleElement.textContent} — Блог AEROTECH`;
                }
            })
            .catch(error => {
                console.error('Error loading article:', error);
                articleContent.classList.remove('loading');
                articleContent.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                        <h2>Ошибка загрузки статьи</h2>
                        <p>Не удалось загрузить содержимое статьи. Пожалуйста, попробуйте позже.</p>
                        <a href="blog.html" style="color: var(--accent-primary); text-decoration: none;">← Назад к блогу</a>
                    </div>
                `;
            });
    }

    // Load article on page load
    loadArticle();

    // Handle navigation menu
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navMenuClose = document.querySelector('.nav-menu__close');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', navMenu.classList.contains('active'));
        });
    }

    if (navMenuClose && navMenu) {
        navMenuClose.addEventListener('click', () => {
            navMenu.classList.remove('active');
            if (navToggle) {
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) {
                navMenu.classList.remove('active');
            }
            if (navToggle) {
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

})();
