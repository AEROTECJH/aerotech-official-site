// Article Page functionality
(function() {
    'use strict';

    // Simple markdown parser (same as in blog.js)
    function parseMarkdown(markdown) {
        let html = markdown;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
        
        // Images
        html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">');
        
        // Code blocks
        html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
        
        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Horizontal rules
        html = html.replace(/^---$/gim, '<hr>');
        
        // Tables (basic support)
        html = html.replace(/^\|(.+)\|$/gim, function(match) {
            const cells = match.split('|').filter(cell => cell.trim());
            const cellsHtml = cells.map(cell => `<td>${cell.trim()}</td>`).join('');
            return `<tr>${cellsHtml}</tr>`;
        });
        
        // Wrap table rows in table
        html = html.replace(/(<tr>.+<\/tr>)+/g, function(match) {
            // First row is header
            const rows = match.split('</tr>').filter(r => r.trim());
            if (rows.length > 0) {
                const headerRow = rows[0].replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>') + '</tr>';
                const bodyRows = rows.slice(1).join('</tr>') + (rows.length > 1 ? '</tr>' : '');
                return `<table>${headerRow}${bodyRows}</table>`;
            }
            return match;
        });
        
        // Unordered lists
        html = html.replace(/^\- (.+)$/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');
        
        // Ordered lists
        html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
        
        // Blockquotes
        html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');
        
        // Paragraphs (split by double newlines)
        const lines = html.split('\n');
        let inParagraph = false;
        let result = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (!line) {
                if (inParagraph) {
                    result.push('</p>');
                    inParagraph = false;
                }
                continue;
            }
            
            // Check if line is already wrapped in a tag
            if (line.match(/^<(h[1-6]|ul|ol|li|pre|code|table|tr|blockquote|hr|img)/)) {
                if (inParagraph) {
                    result.push('</p>');
                    inParagraph = false;
                }
                result.push(line);
            } else {
                if (!inParagraph) {
                    result.push('<p>');
                    inParagraph = true;
                }
                result.push(line);
                
                // Check if next line is empty or a tag
                if (i === lines.length - 1 || !lines[i + 1].trim() || lines[i + 1].match(/^<(h[1-6]|ul|ol|li|pre|code|table|tr|blockquote|hr)/)) {
                    result.push('</p>');
                    inParagraph = false;
                }
            }
        }
        
        if (inParagraph) {
            result.push('</p>');
        }
        
        return result.join('\n');
    }

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
