// Wiki JavaScript - Navigation and Search Functionality

(function() {
    'use strict';

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        initSidebarToggle();
        initSearch();
        highlightActiveNavItem();
    });

    /**
     * Initialize sidebar section toggles
     */
    function initSidebarToggle() {
        const toggleButtons = document.querySelectorAll('.wiki-nav-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isExpanded);
                
                // Toggle the list visibility
                const section = this.closest('.wiki-nav-section');
                const list = section.querySelector('.wiki-nav-list');
                
                if (list) {
                    list.style.display = isExpanded ? 'none' : 'block';
                }
            });
        });
    }

    /**
     * Initialize search functionality
     */
    function initSearch() {
        const searchInput = document.getElementById('wiki-search-input');
        
        if (!searchInput) return;

        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length === 0) {
                resetSearch();
                return;
            }

            performSearch(query);
        });
    }

    /**
     * Perform search across navigation items
     */
    function performSearch(query) {
        const navItems = document.querySelectorAll('.wiki-nav-list a');
        let matchCount = 0;

        navItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const listItem = item.closest('li');
            
            if (text.includes(query)) {
                listItem.style.display = 'block';
                // Highlight matching text
                highlightMatch(item, query);
                matchCount++;
                
                // Expand parent section
                const section = item.closest('.wiki-nav-section');
                const toggle = section.querySelector('.wiki-nav-toggle');
                if (toggle.getAttribute('aria-expanded') === 'false') {
                    toggle.click();
                }
            } else {
                listItem.style.display = 'none';
            }
        });

        // Show "no results" message if needed
        if (matchCount === 0) {
            showNoResults();
        }
    }

    /**
     * Highlight matching text in search results
     */
    function highlightMatch(element, query) {
        const text = element.textContent;
        const index = text.toLowerCase().indexOf(query);
        
        if (index !== -1) {
            const before = text.substring(0, index);
            const match = text.substring(index, index + query.length);
            const after = text.substring(index + query.length);
            
            element.innerHTML = `${before}<mark style="background: rgba(255, 255, 255, 0.2); padding: 2px 4px; border-radius: 3px;">${match}</mark>${after}`;
        }
    }

    /**
     * Reset search and show all items
     */
    function resetSearch() {
        const navItems = document.querySelectorAll('.wiki-nav-list a');
        
        navItems.forEach(item => {
            const listItem = item.closest('li');
            listItem.style.display = 'block';
            
            // Remove highlight
            const originalText = item.textContent;
            item.textContent = originalText;
        });

        // Remove "no results" message if exists
        const noResults = document.querySelector('.wiki-no-results');
        if (noResults) {
            noResults.remove();
        }
    }

    /**
     * Show "no results" message
     */
    function showNoResults() {
        // Remove existing message
        const existing = document.querySelector('.wiki-no-results');
        if (existing) {
            existing.remove();
        }

        const sidebar = document.querySelector('.wiki-sidebar');
        const message = document.createElement('div');
        message.className = 'wiki-no-results';
        message.style.cssText = 'padding: 20px; text-align: center; color: rgba(255, 255, 255, 0.5); font-family: "IBM Plex Mono", monospace; font-size: 0.9rem;';
        message.textContent = 'Ничего не найдено';
        sidebar.appendChild(message);
    }

    /**
     * Highlight active navigation item based on current page
     */
    function highlightActiveNavItem() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.wiki-nav-list a');
        
        navLinks.forEach(link => {
            const linkPath = new URL(link.href, window.location.origin).pathname;
            
            if (currentPath.includes(linkPath) && linkPath !== '/') {
                link.classList.add('active');
            }
        });
    }

    /**
     * Smooth scroll to anchors
     */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            if (!targetId) return;
            
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

})();
