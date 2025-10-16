// Wiki JavaScript - AEROTECH Documentation
// Handles navigation, content loading, and table of contents

(function() {
    'use strict';

    // Wiki structure configuration
    const wikiStructure = {
        'getting-started': {
            title: 'Начало работы',
            items: [
                { title: 'Введение', file: 'getting-started/introduction.md' },
                { title: 'Быстрый старт', file: 'getting-started/quick-start.md' },
                { title: 'Системные требования', file: 'getting-started/requirements.md' }
            ]
        },
        'platforms': {
            title: 'Платформы',
            items: [
                { title: 'K1 Platform', file: 'platforms/k1.md' },
                { title: 'Synergia 1.0', file: 'platforms/synergia.md' },
                { title: 'SR Platform', file: 'platforms/sr.md' }
            ]
        },
        'api': {
            title: 'API Reference',
            items: [
                { title: 'Обзор API', file: 'api/overview.md' },
                { title: 'Аутентификация', file: 'api/authentication.md' },
                { title: 'Endpoints', file: 'api/endpoints.md' }
            ]
        },
        'guides': {
            title: 'Руководства',
            items: [
                { title: 'Настройка', file: 'guides/setup.md' },
                { title: 'Примеры использования', file: 'guides/examples.md' },
                { title: 'Устранение неполадок', file: 'guides/troubleshooting.md' }
            ]
        }
    };

    // Initialize wiki
    document.addEventListener('DOMContentLoaded', function() {
        initializeNavigation();
        initializeSidebar();
        initializeSearch();
        initializeSectionCards();
        loadContentFromURL();
    });

    // Initialize sidebar navigation
    function initializeNavigation() {
        const navContainer = document.getElementById('wiki-nav');
        if (!navContainer) return;

        let navHTML = '';
        
        for (const [sectionId, section] of Object.entries(wikiStructure)) {
            navHTML += `
                <div class="wiki-nav-section">
                    <div class="wiki-nav-section-title">${section.title}</div>
                    <ul class="wiki-nav-list">
            `;
            
            section.items.forEach(item => {
                navHTML += `
                    <li class="wiki-nav-item">
                        <a href="#${item.file}" class="wiki-nav-link" data-file="${item.file}">
                            ${item.title}
                        </a>
                    </li>
                `;
            });
            
            navHTML += `
                    </ul>
                </div>
            `;
        }
        
        navContainer.innerHTML = navHTML;

        // Add click handlers to navigation links
        document.querySelectorAll('.wiki-nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const file = this.getAttribute('data-file');
                loadDocument(file);
                updateActiveNavLink(this);
            });
        });
    }

    // Initialize sidebar toggle
    function initializeSidebar() {
        const sidebar = document.getElementById('wiki-sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('active');
            });
        }

        // Mobile: close sidebar when clicking outside
        if (window.innerWidth <= 968) {
            document.addEventListener('click', function(e) {
                if (!sidebar.contains(e.target) && !e.target.closest('.nav-toggle')) {
                    sidebar.classList.remove('active');
                }
            });
        }
    }

    // Initialize search functionality
    function initializeSearch() {
        const searchInput = document.getElementById('wiki-search');
        const searchBtn = document.querySelector('.wiki-search-btn');
        
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performSearch(this.value);
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                performSearch(searchInput.value);
            });
        }
    }

    // Initialize section cards
    function initializeSectionCards() {
        document.querySelectorAll('.wiki-section-card').forEach(card => {
            card.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                const section = wikiStructure[sectionId];
                
                if (section && section.items.length > 0) {
                    loadDocument(section.items[0].file);
                    
                    // Highlight the section in nav
                    const navLink = document.querySelector(`.wiki-nav-link[data-file="${section.items[0].file}"]`);
                    if (navLink) {
                        updateActiveNavLink(navLink);
                    }
                }
            });
        });
    }

    // Load document from markdown file
    function loadDocument(file) {
        const contentContainer = document.getElementById('wiki-content');
        
        // Show loading state
        contentContainer.innerHTML = '<div class="wiki-loading">Загрузка документации...</div>';
        
        // Fetch markdown file
        fetch(`docs/${file}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(markdown => {
                // Parse markdown to HTML using the markdown parser
                const html = typeof parseMarkdown === 'function' 
                    ? parseMarkdown(markdown) 
                    : markdown;
                
                contentContainer.innerHTML = html;
                
                // Update URL without page reload
                window.history.pushState({ file: file }, '', `#${file}`);
                
                // Generate table of contents
                generateTableOfContents();
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .catch(error => {
                console.error('Error loading document:', error);
                contentContainer.innerHTML = `
                    <div class="wiki-error">
                        <h2>Ошибка загрузки документации</h2>
                        <p>Не удалось загрузить документ: ${file}</p>
                        <p>Пожалуйста, убедитесь, что файл существует.</p>
                    </div>
                `;
            });
    }

    // Generate table of contents from headings
    function generateTableOfContents() {
        const content = document.getElementById('wiki-content');
        const tocNav = document.getElementById('wiki-toc-nav');
        
        if (!content || !tocNav) return;
        
        const headings = content.querySelectorAll('h2, h3');
        
        if (headings.length === 0) {
            tocNav.innerHTML = '<p style="color: var(--wiki-text-muted); font-size: 0.85rem;">Нет заголовков</p>';
            return;
        }
        
        let tocHTML = '<ul>';
        
        headings.forEach((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id;
            
            const level = heading.tagName.toLowerCase();
            const indent = level === 'h3' ? 'style="padding-left: 1rem;"' : '';
            
            tocHTML += `
                <li>
                    <a href="#${id}" class="wiki-toc-link" ${indent}>
                        ${heading.textContent}
                    </a>
                </li>
            `;
        });
        
        tocHTML += '</ul>';
        tocNav.innerHTML = tocHTML;
        
        // Add smooth scroll to TOC links
        tocNav.querySelectorAll('.wiki-toc-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    // Update active link
                    tocNav.querySelectorAll('.wiki-toc-link').forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            });
        });
    }

    // Update active navigation link
    function updateActiveNavLink(activeLink) {
        document.querySelectorAll('.wiki-nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    // Load content from URL hash
    function loadContentFromURL() {
        const hash = window.location.hash.substring(1);
        
        if (hash) {
            // Find the nav link with matching file
            const navLink = document.querySelector(`.wiki-nav-link[data-file="${hash}"]`);
            if (navLink) {
                loadDocument(hash);
                updateActiveNavLink(navLink);
            }
        }
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.file) {
            loadDocument(event.state.file);
            
            const navLink = document.querySelector(`.wiki-nav-link[data-file="${event.state.file}"]`);
            if (navLink) {
                updateActiveNavLink(navLink);
            }
        }
    });

    // Perform search
    function performSearch(query) {
        if (!query.trim()) {
            alert('Введите поисковый запрос');
            return;
        }
        
        console.log('Поиск:', query);
        
        // TODO: Implement actual search functionality
        // For now, just show an alert
        alert(`Функция поиска в разработке. Запрос: "${query}"`);
    }

    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navClose = document.querySelector('.nav-menu__close');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.setAttribute('aria-expanded', navMenu.classList.contains('active'));
        });
    }

    if (navClose) {
        navClose.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    }

})();
