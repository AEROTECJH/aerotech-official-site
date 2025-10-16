/**
 * AEROTECH Wiki - JavaScript
 * Handles documentation loading, navigation, and search
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initNavigation();
    
    // Initialize mobile sidebar toggle
    initMobileSidebarToggle();
    
    // Initialize category toggles
    initCategoryToggles();
    
    // Initialize search
    initSearch();
    
    // Initialize document links
    initDocLinks();
    
    // Load default document if specified in URL
    loadFromURL();
});

/**
 * Initialize main navigation (reuse from blog)
 */
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navClose = document.querySelector('.nav-menu__close');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.add('active');
            navToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        });
    }

    if (navClose) {
        navClose.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    }

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });
}

/**
 * Initialize mobile sidebar toggle
 */
function initMobileSidebarToggle() {
    const sidebar = document.getElementById('wiki-sidebar');
    if (!sidebar) return;
    
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'wiki-sidebar-toggle';
    toggleBtn.textContent = 'Категории документации';
    toggleBtn.setAttribute('type', 'button');
    toggleBtn.setAttribute('aria-label', 'Показать/скрыть категории');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', 'wiki-sidebar');
    
    // Insert button before sidebar
    sidebar.parentNode.insertBefore(toggleBtn, sidebar);
    
    // Toggle functionality
    toggleBtn.addEventListener('click', function() {
        const isActive = sidebar.classList.contains('active');
        
        if (isActive) {
            sidebar.classList.remove('active');
            this.classList.remove('active');
            this.setAttribute('aria-expanded', 'false');
        } else {
            sidebar.classList.add('active');
            this.classList.add('active');
            this.setAttribute('aria-expanded', 'true');
        }
    });
    
    // Close sidebar when clicking on a document link (mobile only)
    const docLinks = document.querySelectorAll('.wiki-doc-link');
    docLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                toggleBtn.classList.remove('active');
                toggleBtn.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

/**
 * Initialize category toggle functionality
 */
function initCategoryToggles() {
    const categoryToggles = document.querySelectorAll('.wiki-category-toggle');
    
    categoryToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const categoryList = this.nextElementSibling;
            
            // Toggle state
            this.setAttribute('aria-expanded', !isExpanded);
            categoryList.style.display = isExpanded ? 'none' : 'block';
        });
    });
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('wiki-search-input');
    const searchBtn = document.getElementById('wiki-search-btn');
    
    if (!searchInput || !searchBtn) return;
    
    // Search on button click
    searchBtn.addEventListener('click', performSearch);
    
    // Search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

/**
 * Perform search in documentation
 */
function performSearch() {
    const searchInput = document.getElementById('wiki-search-input');
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) return;
    
    // Get all document links
    const docLinks = document.querySelectorAll('.wiki-doc-link');
    let matchedLinks = [];
    
    docLinks.forEach(link => {
        const text = link.textContent.toLowerCase();
        if (text.includes(query)) {
            matchedLinks.push(link);
        }
    });
    
    // If matches found, highlight the first one and expand its category
    if (matchedLinks.length > 0) {
        const firstMatch = matchedLinks[0];
        
        // Expand parent category if collapsed
        const category = firstMatch.closest('.wiki-category');
        if (category) {
            const toggle = category.querySelector('.wiki-category-toggle');
            const list = category.querySelector('.wiki-category-list');
            
            toggle.setAttribute('aria-expanded', 'true');
            list.style.display = 'block';
        }
        
        // Scroll to and highlight the match
        firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstMatch.style.backgroundColor = 'rgba(122, 183, 255, 0.2)';
        
        setTimeout(() => {
            firstMatch.style.backgroundColor = '';
        }, 2000);
    } else {
        alert('Документы не найдены по запросу: ' + query);
    }
}

/**
 * Initialize document link clicks
 */
function initDocLinks() {
    const docLinks = document.querySelectorAll('.wiki-doc-link');
    
    docLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const docPath = this.getAttribute('data-doc');
            if (docPath) {
                loadDocument(docPath);
                
                // Update active state
                docLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Update URL without reload
                history.pushState({ doc: docPath }, '', `?doc=${docPath}`);
            }
        });
    });
}

/**
 * Load document from URL parameter
 */
function loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const docPath = urlParams.get('doc');
    
    if (docPath) {
        loadDocument(docPath);
        
        // Set active link
        const activeLink = document.querySelector(`[data-doc="${docPath}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            
            // Expand parent category
            const category = activeLink.closest('.wiki-category');
            if (category) {
                const toggle = category.querySelector('.wiki-category-toggle');
                const list = category.querySelector('.wiki-category-list');
                
                toggle.setAttribute('aria-expanded', 'true');
                list.style.display = 'block';
            }
        }
    }
}

/**
 * Load and display a documentation file
 */
async function loadDocument(docPath) {
    const articleContainer = document.getElementById('wiki-article');
    
    if (!articleContainer) return;
    
    // Show loading state
    articleContainer.innerHTML = '<div class="wiki-loading">Загрузка документации...</div>';
    
    try {
        // Try to load markdown file
        const response = await fetch(`docs/${docPath}.md`);
        
        if (!response.ok) {
            throw new Error('Document not found');
        }
        
        const markdown = await response.text();
        
        // Parse markdown to HTML (using the markdown parser from blog)
        const parseMarkdown = window.MarkdownParser ? window.MarkdownParser.parseMarkdown : null;
        const html = parseMarkdown ? parseMarkdown(markdown) : markdown.replace(/\n/g, '<br>');
        
        // Extract title from first heading or use default
        const titleMatch = markdown.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : 'Документация';
        
        // Update article content
        articleContainer.innerHTML = `
            <div class="wiki-article-header">
                <h2 class="wiki-article-title">${escapeHtml(title)}</h2>
            </div>
            <div class="wiki-article-body">
                ${html}
            </div>
            <div class="wiki-article-footer">
                <div class="wiki-article-meta">
                    <span class="wiki-meta-item">Последнее обновление: ${new Date().toLocaleDateString('ru-RU')}</span>
                </div>
            </div>
        `;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        // Show error state
        articleContainer.innerHTML = `
            <div class="wiki-error">
                <h3>Документ не найден</h3>
                <p>Не удалось загрузить документацию по пути: ${escapeHtml(docPath)}</p>
                <p>Пожалуйста, выберите другой раздел из меню слева.</p>
            </div>
        `;
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Handle browser back/forward buttons
 */
window.addEventListener('popstate', function(e) {
    if (e.state && e.state.doc) {
        loadDocument(e.state.doc);
        
        // Update active link
        const docLinks = document.querySelectorAll('.wiki-doc-link');
        docLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-doc') === e.state.doc);
        });
    }
});
