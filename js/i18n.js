/**
 * AEROTECH Multi-Language Support System
 * Provides internationalization (i18n) capabilities
 */

class LanguageManager {
    constructor() {
        this.currentLanguage = 'ru';
        this.defaultLanguage = 'ru';
        this.supportedLanguages = ['ru', 'en'];
        this.translations = {};
        this.init();
    }

    async init() {
        // Load saved language preference
        const saved = localStorage.getItem('aerotech_language');
        if (saved && this.supportedLanguages.includes(saved)) {
            this.currentLanguage = saved;
        } else {
            // Detect browser language
            const browserLang = navigator.language.split('-')[0];
            if (this.supportedLanguages.includes(browserLang)) {
                this.currentLanguage = browserLang;
            }
        }
        
        // Load translations
        await this.loadTranslations();
        
        // Apply language
        this.applyLanguage();
        
        // Create language switcher UI
        this.createLanguageSwitcher();
    }

    async loadTranslations() {
        // Load translation files
        const translations = {
            ru: await this.getRussianTranslations(),
            en: await this.getEnglishTranslations()
        };
        
        this.translations = translations;
    }

    getRussianTranslations() {
        return {
            // Navigation
            'nav.home': 'Главная',
            'nav.about': 'О нас',
            'nav.advantages': 'Наши преимущества',
            'nav.applications': 'Области применения',
            'nav.technology': 'Технологии',
            'nav.k1': 'Платформа K1',
            'nav.synergia': 'Synergia 1.0',
            'nav.sr': 'SR',
            'nav.gallery': 'Галерея',
            'nav.blog': 'Блог',
            'nav.faq': 'FAQ',
            'nav.contact': 'Контакты',
            'nav.search': 'Поиск',
            
            // Hero section
            'hero.title': 'AEROTECH: ИННОВАЦИОННЫЕ БЕСПИЛОТНЫЕ ПЛАТФОРМЫ',
            'hero.subtitle': 'Мы создаем высоконадежные беспилотные системы для критически важных задач, где точность, автономность и устойчивость к внешним воздействиям являются ключевыми факторами успеха.',
            'hero.cta.primary': 'Познакомиться с K1',
            'hero.cta.secondary': 'Связаться с командой',
            
            // About section
            'about.title': 'AEROTECH: ИНЖЕНЕРНЫЙ ПОДХОД К БУДУЩЕМУ',
            'about.description': 'Мы проектируем и собираем высоконадежные беспилотные платформы для критически важных миссий — от обороны и спасения до промышленной логистики.',
            
            // Footer
            'footer.copyright': '© 2025 AEROTECH. Все права защищены.',
            'footer.privacy': 'Политика конфиденциальности',
            
            // Common
            'common.loading': 'Загрузка...',
            'common.readMore': 'Читать далее',
            'common.close': 'Закрыть',
            'common.submit': 'Отправить',
            'common.cancel': 'Отменить',
            'common.save': 'Сохранить',
            'common.delete': 'Удалить',
            'common.edit': 'Редактировать',
            'common.search': 'Поиск',
            'common.filter': 'Фильтр',
            'common.sort': 'Сортировка',
            
            // Search
            'search.placeholder': 'Поиск по сайту... (Ctrl+K)',
            'search.empty': 'Ничего не найдено',
            'search.minChars': 'Введите минимум 2 символа для поиска',
            'search.results': 'Результаты поиска',
            
            // Forms
            'form.name': 'Имя',
            'form.email': 'Email',
            'form.phone': 'Телефон',
            'form.company': 'Компания',
            'form.message': 'Сообщение',
            'form.send': 'Отправить',
            'form.sending': 'Отправка...',
            'form.success': 'Сообщение успешно отправлено!',
            'form.error': 'Произошла ошибка. Попробуйте еще раз.',
            
            // PWA
            'pwa.install': 'Установить приложение',
            'pwa.update': 'Доступна новая версия',
            'pwa.updateNow': 'Обновить',
            'pwa.updateLater': 'Позже',
            'pwa.offline': 'Вы не в сети (работает офлайн режим)',
            'pwa.online': 'Подключение восстановлено'
        };
    }

    getEnglishTranslations() {
        return {
            // Navigation
            'nav.home': 'Home',
            'nav.about': 'About Us',
            'nav.advantages': 'Our Advantages',
            'nav.applications': 'Applications',
            'nav.technology': 'Technology',
            'nav.k1': 'K1 Platform',
            'nav.synergia': 'Synergia 1.0',
            'nav.sr': 'SR',
            'nav.gallery': 'Gallery',
            'nav.blog': 'Blog',
            'nav.faq': 'FAQ',
            'nav.contact': 'Contact',
            'nav.search': 'Search',
            
            // Hero section
            'hero.title': 'AEROTECH: INNOVATIVE UNMANNED PLATFORMS',
            'hero.subtitle': 'We create highly reliable unmanned systems for mission-critical tasks where precision, autonomy, and resilience to external influences are key success factors.',
            'hero.cta.primary': 'Discover K1',
            'hero.cta.secondary': 'Contact Our Team',
            
            // About section
            'about.title': 'AEROTECH: ENGINEERING APPROACH TO THE FUTURE',
            'about.description': 'We design and build highly reliable unmanned platforms for critical missions — from defense and rescue to industrial logistics.',
            
            // Footer
            'footer.copyright': '© 2025 AEROTECH. All rights reserved.',
            'footer.privacy': 'Privacy Policy',
            
            // Common
            'common.loading': 'Loading...',
            'common.readMore': 'Read more',
            'common.close': 'Close',
            'common.submit': 'Submit',
            'common.cancel': 'Cancel',
            'common.save': 'Save',
            'common.delete': 'Delete',
            'common.edit': 'Edit',
            'common.search': 'Search',
            'common.filter': 'Filter',
            'common.sort': 'Sort',
            
            // Search
            'search.placeholder': 'Search site... (Ctrl+K)',
            'search.empty': 'Nothing found',
            'search.minChars': 'Enter at least 2 characters to search',
            'search.results': 'Search results',
            
            // Forms
            'form.name': 'Name',
            'form.email': 'Email',
            'form.phone': 'Phone',
            'form.company': 'Company',
            'form.message': 'Message',
            'form.send': 'Send',
            'form.sending': 'Sending...',
            'form.success': 'Message sent successfully!',
            'form.error': 'An error occurred. Please try again.',
            
            // PWA
            'pwa.install': 'Install App',
            'pwa.update': 'New version available',
            'pwa.updateNow': 'Update',
            'pwa.updateLater': 'Later',
            'pwa.offline': 'You are offline (offline mode active)',
            'pwa.online': 'Connection restored'
        };
    }

    translate(key, defaultText = null) {
        const translation = this.translations[this.currentLanguage]?.[key];
        
        if (translation) {
            return translation;
        }
        
        // Fallback to default language
        const fallback = this.translations[this.defaultLanguage]?.[key];
        if (fallback) {
            return fallback;
        }
        
        // Return default text or key
        return defaultText || key;
    }

    applyLanguage() {
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
        
        // Apply translations to data-i18n elements
        document.querySelectorAll('[data-i18n]').forEach((element) => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Apply translations to data-i18n-attr elements
        document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
            const attrs = JSON.parse(element.getAttribute('data-i18n-attr'));
            
            Object.entries(attrs).forEach(([attr, key]) => {
                const translation = this.translate(key);
                element.setAttribute(attr, translation);
            });
        });
        
        // Update specific elements
        this.updateSearchPlaceholder();
        this.updatePWATexts();
        
        // Emit language change event
        window.dispatchEvent(new CustomEvent('languagechange', {
            detail: { language: this.currentLanguage }
        }));
        
        console.log(`[i18n] Language set to: ${this.currentLanguage}`);
    }

    updateSearchPlaceholder() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.placeholder = this.translate('search.placeholder');
        }
    }

    updatePWATexts() {
        const installBtn = document.querySelector('.pwa-install-button span');
        if (installBtn) {
            installBtn.textContent = this.translate('pwa.install');
        }
    }

    setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`[i18n] Language "${lang}" is not supported`);
            return;
        }
        
        this.currentLanguage = lang;
        localStorage.setItem('aerotech_language', lang);
        
        this.applyLanguage();
        
        // Track language change
        if (window.AerotechAnalytics) {
            window.AerotechAnalytics.track('language_changed', {
                from: this.currentLanguage,
                to: lang
            });
        }
    }

    createLanguageSwitcher() {
        // Create language switcher button
        const switcher = document.createElement('div');
        switcher.className = 'language-switcher';
        switcher.innerHTML = `
            <button class="language-switcher-btn" aria-label="Change language">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <span class="language-current">${this.currentLanguage.toUpperCase()}</span>
            </button>
            <div class="language-dropdown">
                ${this.supportedLanguages.map(lang => `
                    <button class="language-option ${lang === this.currentLanguage ? 'active' : ''}" 
                            data-lang="${lang}">
                        <span class="language-flag">${this.getLanguageFlag(lang)}</span>
                        <span class="language-name">${this.getLanguageName(lang)}</span>
                    </button>
                `).join('')}
            </div>
        `;
        
        // Add to navigation
        const nav = document.querySelector('.main-nav .nav-container');
        if (nav) {
            nav.appendChild(switcher);
        }
        
        // Setup event listeners
        const btn = switcher.querySelector('.language-switcher-btn');
        const dropdown = switcher.querySelector('.language-dropdown');
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
        
        // Handle language selection
        switcher.querySelectorAll('.language-option').forEach((option) => {
            option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang');
                this.setLanguage(lang);
                
                // Update UI
                const current = switcher.querySelector('.language-current');
                current.textContent = lang.toUpperCase();
                
                // Update active state
                switcher.querySelectorAll('.language-option').forEach(opt => {
                    opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
                });
                
                dropdown.classList.remove('show');
            });
        });
    }

    getLanguageFlag(lang) {
        const flags = {
            'ru': '🇷🇺',
            'en': '🇬🇧'
        };
        return flags[lang] || '🌐';
    }

    getLanguageName(lang) {
        const names = {
            'ru': 'Русский',
            'en': 'English'
        };
        return names[lang] || lang.toUpperCase();
    }

    // Helper method to get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Helper method to check if language is supported
    isLanguageSupported(lang) {
        return this.supportedLanguages.includes(lang);
    }
}

// Initialize language manager
window.addEventListener('DOMContentLoaded', () => {
    window.AerotechLang = new LanguageManager();
});

// Add language switcher styles
const langStyles = document.createElement('style');
langStyles.textContent = `
    .language-switcher {
        position: relative;
        margin-left: auto;
        padding-left: 20px;
    }
    
    .language-switcher-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        background: rgba(0, 192, 192, 0.1);
        border: 1px solid rgba(0, 192, 192, 0.3);
        border-radius: 6px;
        color: #00c0c0;
        font-family: 'Montserrat', sans-serif;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .language-switcher-btn:hover {
        background: rgba(0, 192, 192, 0.2);
        border-color: #00c0c0;
    }
    
    .language-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 150px;
        background: rgba(15, 15, 15, 0.98);
        border: 1px solid #00c0c0;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 192, 192, 0.2);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s;
        z-index: 1000;
        overflow: hidden;
    }
    
    .language-dropdown.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    .language-option {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 12px 16px;
        background: transparent;
        border: none;
        color: white;
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .language-option:hover {
        background: rgba(0, 192, 192, 0.1);
    }
    
    .language-option.active {
        background: rgba(0, 192, 192, 0.2);
        color: #00c0c0;
    }
    
    .language-flag {
        font-size: 18px;
        line-height: 1;
    }
    
    .language-name {
        flex: 1;
    }
    
    @media (max-width: 960px) {
        .language-switcher {
            margin-left: 0;
            padding-left: 0;
            padding: 12px 0;
        }
        
        .language-switcher-btn {
            width: 100%;
            justify-content: center;
        }
        
        .language-dropdown {
            position: static;
            transform: none;
            margin-top: 8px;
        }
        
        .language-dropdown.show {
            transform: none;
        }
    }
`;
document.head.appendChild(langStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageManager;
}
