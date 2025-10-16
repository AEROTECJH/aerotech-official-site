/**
 * AEROTECH Wiki - JavaScript
 * Handles documentation loading, navigation, and search
 */

// Password protection configuration
const WIKI_CONFIG = {
    // SHA-256 hash of the password "ANKARSAT71T33"
    passwordHash: 'cb6fa42313897d0327f02c18b1067ed0a31234618cc166ddce09ce83acc64957',
    sessionKey: 'wiki_authenticated'
};

/**
 * Hash a string using SHA-256
 */
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return sessionStorage.getItem(WIKI_CONFIG.sessionKey) === 'true';
}

/**
 * Show password prompt
 */
function showPasswordPrompt() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'wiki-password-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 10, 10, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 40px;
        max-width: 450px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    `;
    
    modal.innerHTML = `
        <h2 style="color: #fff; margin: 0 0 10px 0; font-size: 24px; font-family: 'Montserrat', sans-serif;">Доступ к Wiki</h2>
        <p style="color: #999; margin: 0 0 30px 0; font-size: 14px;">Для доступа к базе знаний требуется пароль</p>
        <form id="wiki-password-form">
            <input 
                type="password" 
                id="wiki-password-input" 
                placeholder="Введите пароль" 
                style="
                    width: 100%;
                    padding: 12px;
                    background: #0a0a0a;
                    border: 1px solid #333;
                    border-radius: 4px;
                    color: #fff;
                    font-size: 16px;
                    font-family: 'IBM Plex Mono', monospace;
                    margin-bottom: 20px;
                    box-sizing: border-box;
                "
                autocomplete="off"
                required
            />
            <div id="wiki-password-error" style="color: #ff4444; font-size: 14px; margin-bottom: 15px; display: none;"></div>
            <button 
                type="submit" 
                style="
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #4a90e2, #357abd);
                    border: none;
                    border-radius: 4px;
                    color: #fff;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Montserrat', sans-serif;
                    transition: all 0.3s ease;
                "
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(74, 144, 226, 0.4)';"
                onmouseout="this.style.transform=''; this.style.boxShadow='';"
            >
                Войти
            </button>
        </form>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Focus input
    const input = document.getElementById('wiki-password-input');
    setTimeout(() => input.focus(), 100);
    
    // Handle form submission
    const form = document.getElementById('wiki-password-form');
    const errorDiv = document.getElementById('wiki-password-error');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const password = input.value;
        const hash = await sha256(password);
        
        if (hash === WIKI_CONFIG.passwordHash) {
            // Correct password
            sessionStorage.setItem(WIKI_CONFIG.sessionKey, 'true');
            overlay.remove();
            initializeWiki();
        } else {
            // Wrong password
            errorDiv.textContent = 'Неверный пароль. Попробуйте еще раз.';
            errorDiv.style.display = 'block';
            input.value = '';
            input.focus();
            
            // Shake animation
            modal.style.animation = 'shake 0.5s';
            setTimeout(() => {
                modal.style.animation = '';
            }, 500);
        }
    });
    
    // Add shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize wiki functionality
 */
function initializeWiki() {
    // Show wiki content
    const wikiContent = document.querySelector('.wiki-main');
    if (wikiContent) {
        wikiContent.style.display = 'block';
    }
    
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
    
    // Add logout functionality
    addLogoutButton();
}

/**
 * Add logout button to wiki
 */
function addLogoutButton() {
    const heroSection = document.querySelector('.wiki-hero .container');
    if (!heroSection) return;
    
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'wiki-logout-btn';
    logoutBtn.textContent = 'Выйти';
    logoutBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        color: #fff;
        font-size: 14px;
        cursor: pointer;
        font-family: 'Montserrat', sans-serif;
        transition: all 0.3s ease;
    `;
    
    logoutBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255, 255, 255, 0.15)';
        this.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    });
    
    logoutBtn.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(255, 255, 255, 0.1)';
        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    });
    
    logoutBtn.addEventListener('click', function() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            sessionStorage.removeItem(WIKI_CONFIG.sessionKey);
            location.reload();
        }
    });
    
    heroSection.style.position = 'relative';
    heroSection.appendChild(logoutBtn);
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (isAuthenticated()) {
        initializeWiki();
    } else {
        showPasswordPrompt();
    }
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
