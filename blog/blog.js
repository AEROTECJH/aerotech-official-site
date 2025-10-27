// Blog functionality
(function() {
    'use strict';

    // Use the shared markdown parser
    const parseMarkdown = window.MarkdownParser.parseMarkdown;

    // DOM elements
    const modal = document.getElementById('article-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const articleContent = document.getElementById('article-content');
    const newsCards = document.querySelectorAll('.news-card');
    const searchInput = document.getElementById('blog-search-input');
    const searchClear = document.getElementById('search-clear');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const newsList = document.getElementById('news-list');


    // Current filter state
    let currentCategory = 'all';
    let currentSearchTerm = '';
    let currentArticleName = '';

    // Check if device is mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Filter and search articles
    function filterArticles() {
        let visibleCount = 0;
        
        newsCards.forEach(card => {
            const cardCategory = card.dataset.category || '';
            const cardTitle = card.querySelector('.news-title')?.textContent.toLowerCase() || '';
            const cardExcerpt = card.querySelector('.news-excerpt')?.textContent.toLowerCase() || '';
            const cardAuthor = card.querySelector('.news-author')?.textContent.toLowerCase() || '';
            
            const matchesCategory = currentCategory === 'all' || cardCategory === currentCategory;
            const matchesSearch = !currentSearchTerm || 
                cardTitle.includes(currentSearchTerm) || 
                cardExcerpt.includes(currentSearchTerm) ||
                cardAuthor.includes(currentSearchTerm);
            
            if (matchesCategory && matchesSearch) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });
        
        // Show/hide no results message
        const existingNoResults = newsList.querySelector('.no-results');
        if (existingNoResults) {
            existingNoResults.remove();
        }
        
        if (visibleCount === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить критерии поиска или выбрать другую категорию.</p>
            `;
            newsList.appendChild(noResults);
        }
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.toLowerCase().trim();
            
            // Show/hide clear button
            if (searchClear) {
                searchClear.style.display = currentSearchTerm ? 'flex' : 'none';
            }
            
            filterArticles();
        });
    }

    // Clear search
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                currentSearchTerm = '';
                searchClear.style.display = 'none';
                filterArticles();
                searchInput.focus();
            }
        });
    }

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update current category
            currentCategory = button.dataset.category || 'all';
            
            // Filter articles
            filterArticles();
        });
    });

    // Open article modal or navigate to article page
    function openArticle(articleName) {
        currentArticleName = articleName;
        
        // On mobile, navigate to article page
        if (isMobile()) {
            window.location.href = `article.html?article=${articleName}`;
            return;
        }
        
        // On desktop, show modal
        const articlePath = `articles/${articleName}.md`;
        
        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
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
                
                // Scroll to top of article
                articleContent.scrollTop = 0;
            })
            .catch(error => {
                console.error('Error loading article:', error);
                articleContent.classList.remove('loading');
                articleContent.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                        <h2>Ошибка загрузки статьи</h2>
                        <p>Не удалось загрузить содержимое статьи. Пожалуйста, попробуйте позже.</p>
                    </div>
                `;
            });
    }

    // Close article modal
    function closeArticle() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear content after animation
        setTimeout(() => {
            articleContent.innerHTML = '';
        }, 300);
    }

    // Event listeners for news cards
    newsCards.forEach(card => {
        const readMoreButton = card.querySelector('.news-read-more');
        const articleName = card.dataset.article;
        
        if (!articleName) {
            console.warn('News card missing data-article attribute:', card);
            return;
        }
        
        // Click on card opens article
        card.addEventListener('click', (e) => {
            // Prevent opening if clicking on a link inside the card
            if (e.target.tagName === 'A') return;
            
            openArticle(articleName);
        });
        
        // Click on read more button
        if (readMoreButton) {
            readMoreButton.addEventListener('click', (e) => {
                e.stopPropagation();
                openArticle(articleName);
            });
        }
    });

    // Close modal event listeners
    if (modalClose) {
        modalClose.addEventListener('click', closeArticle);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeArticle);
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeArticle();
        }
    });

    // Prevent closing when clicking inside article content
    if (articleContent) {
        articleContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

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
