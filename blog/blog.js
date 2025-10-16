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
    const searchInput = document.getElementById('search-input');
    const categoryFilters = document.querySelectorAll('.category-filter');

    // Calculate reading time for an article
    function calculateReadingTime(text) {
        const wordsPerMinute = 200; // Average reading speed in Russian
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return minutes;
    }

    // Load and calculate reading time for each article
    function updateReadingTimes() {
        const readTimeElements = document.querySelectorAll('.news-read-time[data-article]');
        
        readTimeElements.forEach(element => {
            const articleName = element.dataset.article;
            const articlePath = `articles/${articleName}.md`;
            
            fetch(articlePath)
                .then(response => response.text())
                .then(markdown => {
                    const minutes = calculateReadingTime(markdown);
                    const textElement = element.querySelector('.read-time-text');
                    if (textElement) {
                        textElement.textContent = `~${minutes} мин`;
                    }
                })
                .catch(error => {
                    console.warn(`Could not calculate reading time for ${articleName}:`, error);
                });
        });
    }

    // Search functionality
    function filterArticles() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const activeCategory = document.querySelector('.category-filter.active');
        const selectedCategory = activeCategory ? activeCategory.dataset.category : 'all';

        newsCards.forEach(card => {
            const title = card.querySelector('.news-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.news-excerpt').textContent.toLowerCase();
            const category = card.querySelector('.news-category').textContent;
            
            const matchesSearch = title.includes(searchTerm) || excerpt.includes(searchTerm);
            const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
            
            if (matchesSearch && matchesCategory) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    // Event listener for search
    if (searchInput) {
        searchInput.addEventListener('input', filterArticles);
    }

    // Event listeners for category filters
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all filters
            categoryFilters.forEach(f => f.classList.remove('active'));
            // Add active class to clicked filter
            filter.classList.add('active');
            // Filter articles
            filterArticles();
        });
    });

    // Check if device is mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Open article modal or navigate to article page
    function openArticle(articleName) {
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
                
                // Get article title for sharing
                const titleElement = articleContent.querySelector('h1');
                const articleTitle = titleElement ? titleElement.textContent : 'Статья AEROTECH';
                
                // Setup share buttons
                setupShareButtons(articleName, articleTitle);
                
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

    // Share functionality
    function setupShareButtons(articleName, articleTitle) {
        const shareButtons = document.getElementById('share-buttons');
        if (!shareButtons) return;

        const currentUrl = `${window.location.origin}/blog/blog.html`;
        const articleUrl = `${window.location.origin}/blog/article.html?article=${articleName}`;
        
        // Copy link button
        const copyButton = document.getElementById('share-copy');
        if (copyButton) {
            copyButton.onclick = async (e) => {
                e.stopPropagation();
                try {
                    await navigator.clipboard.writeText(articleUrl);
                    copyButton.classList.add('copied');
                    setTimeout(() => copyButton.classList.remove('copied'), 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            };
        }

        // Telegram share button
        const telegramButton = document.getElementById('share-telegram');
        if (telegramButton) {
            telegramButton.onclick = (e) => {
                e.stopPropagation();
                const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`;
                window.open(telegramUrl, '_blank', 'noopener,noreferrer');
            };
        }

        // Twitter share button
        const twitterButton = document.getElementById('share-twitter');
        if (twitterButton) {
            twitterButton.onclick = (e) => {
                e.stopPropagation();
                const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`;
                window.open(twitterUrl, '_blank', 'noopener,noreferrer');
            };
        }
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

    // Initialize reading times
    updateReadingTimes();

})();
