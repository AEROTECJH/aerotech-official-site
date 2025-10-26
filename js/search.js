/**
 * AEROTECH Advanced Search System
 * Full-text search across site content with fuzzy matching
 */

class SearchEngine {
    constructor() {
        this.index = [];
        this.searchBox = null;
        this.resultsContainer = null;
        this.init();
    }

    async init() {
        // Build search index
        await this.buildIndex();
        
        // Create search UI
        this.createSearchUI();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    async buildIndex() {
        console.log('[Search] Building search index...');
        
        // Index current page content
        this.indexPage(window.location.pathname, document);
        
        // Index other pages (fetch and parse)
        const pages = [
            { path: '/index.html', title: 'Главная' },
            { path: '/k1.html', title: 'Платформа K1' },
            { path: '/synergia.html', title: 'Synergia 1.0' },
            { path: '/sr.html', title: 'SR' },
            { path: '/ArlistTech.html', title: 'ARLIST TECH' },
            { path: '/privacy.html', title: 'Политика конфиденциальности' }
        ];
        
        for (const page of pages) {
            if (page.path !== window.location.pathname) {
                try {
                    const response = await fetch(page.path);
                    const html = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    this.indexPage(page.path, doc);
                } catch (error) {
                    console.error(`[Search] Failed to index ${page.path}:`, error);
                }
            }
        }
        
        // Index blog articles
        await this.indexBlogArticles();
        
        console.log(`[Search] Index built with ${this.index.length} entries`);
    }

    indexPage(path, doc) {
        // Extract page title
        const title = doc.querySelector('title')?.textContent || '';
        
        // Extract meta description
        const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        
        // Extract main content sections
        const sections = doc.querySelectorAll('section[id], .section-title, h1, h2, h3, p');
        
        sections.forEach((section, index) => {
            const text = section.textContent.trim();
            
            if (text.length > 10) { // Skip very short content
                const entry = {
                    id: `${path}-${index}`,
                    path: path,
                    title: this.extractTitle(section, doc),
                    content: text,
                    snippet: this.createSnippet(text),
                    sectionId: section.id || null,
                    type: this.getContentType(section),
                    keywords: this.extractKeywords(text)
                };
                
                this.index.push(entry);
            }
        });
        
        // Add page-level entry
        this.index.push({
            id: `${path}-page`,
            path: path,
            title: title,
            content: description,
            snippet: description,
            sectionId: null,
            type: 'page',
            keywords: this.extractKeywords(title + ' ' + description)
        });
    }

    async indexBlogArticles() {
        // This would index blog articles if blog is available
        try {
            const blogPath = '/blog/blog.html';
            const response = await fetch(blogPath);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const articles = doc.querySelectorAll('.news-card');
            articles.forEach((article) => {
                const title = article.querySelector('.news-title')?.textContent || '';
                const excerpt = article.querySelector('.news-excerpt')?.textContent || '';
                const category = article.querySelector('.news-category')?.textContent || '';
                const articleId = article.getAttribute('data-article');
                
                this.index.push({
                    id: `blog-${articleId}`,
                    path: `/blog/blog.html#${articleId}`,
                    title: title,
                    content: excerpt,
                    snippet: excerpt,
                    sectionId: articleId,
                    type: 'blog',
                    keywords: this.extractKeywords(title + ' ' + excerpt + ' ' + category)
                });
            });
        } catch (error) {
            // Blog not available, skip
        }
    }

    extractTitle(element, doc) {
        // Try to find the nearest heading
        const heading = element.closest('section')?.querySelector('h1, h2, .section-title');
        if (heading) {
            return heading.textContent.trim();
        }
        
        // Fallback to page title
        return doc.querySelector('title')?.textContent || 'Без названия';
    }

    createSnippet(text, maxLength = 150) {
        if (text.length <= maxLength) {
            return text;
        }
        
        return text.substring(0, maxLength).trim() + '...';
    }

    getContentType(element) {
        if (element.tagName === 'H1') return 'heading';
        if (element.tagName === 'H2') return 'subheading';
        if (element.tagName === 'H3') return 'section';
        if (element.classList.contains('section-title')) return 'heading';
        return 'content';
    }

    extractKeywords(text) {
        // Extract meaningful keywords
        const words = text
            .toLowerCase()
            .replace(/[^\wа-яё\s]/gi, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3); // Skip short words
        
        // Remove duplicates
        return [...new Set(words)];
    }

    search(query) {
        if (!query || query.length < 2) {
            return [];
        }
        
        const searchTerms = query
            .toLowerCase()
            .replace(/[^\wа-яё\s]/gi, ' ')
            .split(/\s+/)
            .filter(term => term.length > 0);
        
        const results = [];
        
        this.index.forEach((entry) => {
            let score = 0;
            const contentLower = entry.content.toLowerCase();
            const titleLower = entry.title.toLowerCase();
            
            searchTerms.forEach((term) => {
                // Exact match in title (highest weight)
                if (titleLower === term) {
                    score += 100;
                } else if (titleLower.includes(term)) {
                    score += 50;
                }
                
                // Exact match in content
                if (contentLower.includes(term)) {
                    score += 10;
                }
                
                // Keyword match
                if (entry.keywords.some(keyword => keyword.includes(term) || term.includes(keyword))) {
                    score += 5;
                }
                
                // Fuzzy match
                if (this.fuzzyMatch(term, titleLower) || this.fuzzyMatch(term, contentLower)) {
                    score += 2;
                }
            });
            
            if (score > 0) {
                results.push({
                    ...entry,
                    score: score,
                    highlight: this.highlightMatch(entry.snippet, searchTerms)
                });
            }
        });
        
        // Sort by score and remove duplicates
        return results
            .sort((a, b) => b.score - a.score)
            .filter((result, index, self) => 
                index === self.findIndex((r) => r.path === result.path && r.title === result.title)
            )
            .slice(0, 10); // Return top 10 results
    }

    fuzzyMatch(term, text) {
        // Simple fuzzy matching (allow 1 character difference for words > 4 chars)
        if (term.length <= 4) {
            return false;
        }
        
        const regex = new RegExp(term.split('').join('.?'), 'i');
        return regex.test(text);
    }

    highlightMatch(text, terms) {
        let highlighted = text;
        
        terms.forEach((term) => {
            const regex = new RegExp(`(${term})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark>$1</mark>');
        });
        
        return highlighted;
    }

    createSearchUI() {
        // Create search container
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <div class="search-overlay"></div>
            <div class="search-modal">
                <div class="search-header">
                    <div class="search-input-wrapper">
                        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input 
                            type="text" 
                            class="search-input" 
                            placeholder="Поиск по сайту... (Ctrl+K)"
                            autocomplete="off"
                            spellcheck="false"
                        >
                        <button class="search-close" aria-label="Закрыть поиск">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="search-tips">
                        <span class="search-tip">Начните вводить для поиска</span>
                        <kbd>ESC</kbd> для закрытия
                    </div>
                </div>
                <div class="search-results"></div>
                <div class="search-footer">
                    <span>Используйте ↑↓ для навигации, Enter для перехода</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(searchContainer);
        
        // Cache elements
        this.searchBox = searchContainer.querySelector('.search-input');
        this.resultsContainer = searchContainer.querySelector('.search-results');
        const overlay = searchContainer.querySelector('.search-overlay');
        const closeBtn = searchContainer.querySelector('.search-close');
        
        // Setup event listeners
        this.searchBox.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        this.searchBox.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e);
        });
        
        closeBtn.addEventListener('click', () => {
            this.closeSearch();
        });
        
        overlay.addEventListener('click', () => {
            this.closeSearch();
        });
        
        // Add search button to nav
        this.addSearchButton();
    }

    addSearchButton() {
        const nav = document.querySelector('.main-nav .nav-menu');
        if (!nav) return;
        
        const searchBtn = document.createElement('button');
        searchBtn.className = 'nav-search-btn';
        searchBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
            <span>Поиск</span>
            <kbd>Ctrl K</kbd>
        `;
        searchBtn.addEventListener('click', () => {
            this.openSearch();
        });
        
        nav.appendChild(searchBtn);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }
            
            // Escape to close search
            if (e.key === 'Escape') {
                this.closeSearch();
            }
        });
    }

    openSearch() {
        const container = document.querySelector('.search-container');
        if (container) {
            container.classList.add('active');
            this.searchBox.focus();
            document.body.style.overflow = 'hidden';
            
            // Track search open
            if (window.AerotechAnalytics) {
                window.AerotechAnalytics.track('search_opened');
            }
        }
    }

    closeSearch() {
        const container = document.querySelector('.search-container');
        if (container) {
            container.classList.remove('active');
            this.searchBox.value = '';
            this.resultsContainer.innerHTML = '';
            document.body.style.overflow = '';
        }
    }

    handleSearch(query) {
        if (!query || query.length < 2) {
            this.resultsContainer.innerHTML = '<div class="search-empty">Введите минимум 2 символа для поиска</div>';
            return;
        }
        
        const results = this.search(query);
        
        if (results.length === 0) {
            this.resultsContainer.innerHTML = '<div class="search-empty">Ничего не найдено</div>';
            return;
        }
        
        // Render results
        this.renderResults(results);
        
        // Track search
        if (window.AerotechAnalytics) {
            window.AerotechAnalytics.track('search_query', {
                query: query,
                resultsCount: results.length
            });
        }
    }

    renderResults(results) {
        const html = results.map((result, index) => `
            <a href="${result.path}${result.sectionId ? '#' + result.sectionId : ''}" 
               class="search-result" 
               data-index="${index}">
                <div class="search-result-header">
                    <span class="search-result-type">${this.getTypeLabel(result.type)}</span>
                    <span class="search-result-score">${result.score} pts</span>
                </div>
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-snippet">${result.highlight}</div>
                <div class="search-result-path">${result.path}</div>
            </a>
        `).join('');
        
        this.resultsContainer.innerHTML = html;
        
        // Add click handlers
        this.resultsContainer.querySelectorAll('.search-result').forEach((link) => {
            link.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                const result = results[index];
                
                // Track search click
                if (window.AerotechAnalytics) {
                    window.AerotechAnalytics.track('search_result_click', {
                        query: this.searchBox.value,
                        resultTitle: result.title,
                        resultPath: result.path,
                        position: index
                    });
                }
                
                this.closeSearch();
            });
        });
    }

    getTypeLabel(type) {
        const labels = {
            'page': 'Страница',
            'heading': 'Заголовок',
            'subheading': 'Подзаголовок',
            'section': 'Раздел',
            'content': 'Контент',
            'blog': 'Блог'
        };
        
        return labels[type] || type;
    }

    handleKeyNavigation(e) {
        const results = this.resultsContainer.querySelectorAll('.search-result');
        if (results.length === 0) return;
        
        const currentIndex = Array.from(results).findIndex(r => r.classList.contains('selected'));
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
            this.selectResult(results, nextIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
            this.selectResult(results, prevIndex);
        } else if (e.key === 'Enter' && currentIndex >= 0) {
            e.preventDefault();
            results[currentIndex].click();
        }
    }

    selectResult(results, index) {
        results.forEach((r, i) => {
            r.classList.toggle('selected', i === index);
        });
        
        // Scroll to selected
        results[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

// Initialize search
window.addEventListener('DOMContentLoaded', () => {
    window.AerotechSearch = new SearchEngine();
});

// Add search styles
const searchStyles = document.createElement('style');
searchStyles.textContent = `
    .search-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 99999;
        display: none;
    }
    
    .search-container.active {
        display: block;
    }
    
    .search-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
    }
    
    .search-modal {
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 800px;
        max-height: 80vh;
        background: rgba(15, 15, 15, 0.98);
        border: 1px solid #00c0c0;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 192, 192, 0.3);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    
    .search-header {
        padding: 20px;
        border-bottom: 1px solid #333;
    }
    
    .search-input-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid #333;
        border-radius: 8px;
        padding: 12px 16px;
        transition: all 0.3s;
    }
    
    .search-input-wrapper:focus-within {
        border-color: #00c0c0;
        box-shadow: 0 0 0 3px rgba(0, 192, 192, 0.1);
    }
    
    .search-icon {
        color: #666;
        flex-shrink: 0;
    }
    
    .search-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: white;
        font-family: 'Montserrat', sans-serif;
        font-size: 16px;
    }
    
    .search-close {
        background: transparent;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
    }
    
    .search-close:hover {
        color: white;
    }
    
    .search-tips {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 12px;
        font-size: 12px;
        color: #666;
    }
    
    .search-tips kbd {
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid #333;
        border-radius: 3px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
    }
    
    .search-results {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
    }
    
    .search-result {
        display: block;
        padding: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid transparent;
        border-radius: 8px;
        margin-bottom: 8px;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s;
    }
    
    .search-result:hover,
    .search-result.selected {
        background: rgba(0, 192, 192, 0.1);
        border-color: #00c0c0;
    }
    
    .search-result-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
    }
    
    .search-result-type {
        font-size: 11px;
        text-transform: uppercase;
        color: #00c0c0;
        font-weight: 600;
    }
    
    .search-result-score {
        font-size: 10px;
        color: #666;
        font-family: 'IBM Plex Mono', monospace;
    }
    
    .search-result-title {
        font-size: 16px;
        font-weight: 600;
        color: white;
        margin-bottom: 8px;
    }
    
    .search-result-snippet {
        font-size: 14px;
        color: #b0b0b0;
        line-height: 1.5;
        margin-bottom: 8px;
    }
    
    .search-result-snippet mark {
        background: #00c0c0;
        color: #0a0a0a;
        padding: 2px 4px;
        border-radius: 2px;
        font-weight: 600;
    }
    
    .search-result-path {
        font-size: 12px;
        color: #666;
        font-family: 'IBM Plex Mono', monospace;
    }
    
    .search-empty {
        padding: 40px 20px;
        text-align: center;
        color: #666;
    }
    
    .search-footer {
        padding: 12px 20px;
        border-top: 1px solid #333;
        font-size: 12px;
        color: #666;
        text-align: center;
    }
    
    .nav-search-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(0, 192, 192, 0.1);
        border: 1px solid #00c0c0;
        border-radius: 6px;
        color: #00c0c0;
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .nav-search-btn:hover {
        background: rgba(0, 192, 192, 0.2);
    }
    
    .nav-search-btn kbd {
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid #333;
        border-radius: 3px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
    }
    
    @media (max-width: 768px) {
        .search-modal {
            top: 5%;
            width: 95%;
            max-height: 90vh;
        }
        
        .nav-search-btn kbd {
            display: none;
        }
    }
`;
document.head.appendChild(searchStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchEngine;
}
