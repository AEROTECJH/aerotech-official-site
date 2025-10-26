/**
 * AEROTECH Enhanced Features Integration
 * Main initialization file for all new platform features
 */

(function() {
    'use strict';
    
    // Configuration
    const config = {
        analytics: {
            enabled: true,
            endpoint: null // Set to your analytics endpoint
        },
        pwa: {
            enabled: true,
            autoInstallPrompt: true
        },
        search: {
            enabled: true,
            minChars: 2
        },
        i18n: {
            enabled: true,
            defaultLanguage: 'ru',
            supportedLanguages: ['ru', 'en']
        },
        performance: {
            enabled: true,
            debug: false // Set to true or add ?debug=true to URL
        },
        lazyLoad: {
            enabled: true,
            rootMargin: '50px'
        },
        social: {
            enabled: true,
            floatingButtons: true
        }
    };
    
    // Feature detection
    const features = {
        serviceWorker: 'serviceWorker' in navigator,
        intersectionObserver: 'IntersectionObserver' in window,
        performanceObserver: 'PerformanceObserver' in window,
        localStorage: typeof Storage !== 'undefined',
        webp: false
    };
    
    // Initialize features on DOM ready
    function init() {
        console.log('[AEROTECH] Initializing enhanced features...');
        
        // Check feature support
        checkFeatureSupport();
        
        // Load features based on configuration
        loadFeatures();
        
        // Setup global event listeners
        setupGlobalListeners();
        
        // Initialize third-party integrations
        initThirdPartyIntegrations();
        
        console.log('[AEROTECH] Enhanced features initialized');
    }
    
    function checkFeatureSupport() {
        // Check WebP support
        const canvas = document.createElement('canvas');
        if (canvas.getContext && canvas.getContext('2d')) {
            features.webp = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        
        // Log feature support
        console.log('[AEROTECH] Feature support:', features);
        
        // Add classes to html element
        document.documentElement.classList.add(features.webp ? 'webp' : 'no-webp');
        
        if (!features.serviceWorker) {
            console.warn('[AEROTECH] Service Worker not supported');
        }
        
        if (!features.intersectionObserver) {
            console.warn('[AEROTECH] IntersectionObserver not supported');
        }
    }
    
    function loadFeatures() {
        // All features are now loaded via separate script files
        // This function ensures they are initialized in the correct order
        
        // 1. Analytics (loaded first to track all events)
        if (config.analytics.enabled && window.AerotechAnalytics) {
            console.log('[AEROTECH] Analytics initialized');
            if (config.analytics.endpoint) {
                window.ANALYTICS_ENDPOINT = config.analytics.endpoint;
            }
        }
        
        // 2. Performance monitoring
        if (config.performance.enabled) {
            if (config.performance.debug) {
                localStorage.setItem('aerotech_debug', 'true');
            }
            console.log('[AEROTECH] Performance monitoring enabled');
        }
        
        // 3. PWA features
        if (config.pwa.enabled && features.serviceWorker && window.AerotechPWA) {
            console.log('[AEROTECH] PWA features initialized');
        }
        
        // 4. Search functionality
        if (config.search.enabled && window.AerotechSearch) {
            console.log('[AEROTECH] Search initialized');
        }
        
        // 5. Internationalization
        if (config.i18n.enabled && window.AerotechLang) {
            console.log('[AEROTECH] i18n initialized');
        }
        
        // 6. Lazy loading
        if (config.lazyLoad.enabled && window.AerotechLazyLoad) {
            console.log('[AEROTECH] Lazy loading initialized');
        }
        
        // 7. Social sharing
        if (config.social.enabled && window.AerotechSocial) {
            console.log('[AEROTECH] Social sharing initialized');
        }
    }
    
    function setupGlobalListeners() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('[AEROTECH] Page hidden');
                if (window.AerotechAnalytics) {
                    window.AerotechAnalytics.track('page_hidden');
                }
            } else {
                console.log('[AEROTECH] Page visible');
                if (window.AerotechAnalytics) {
                    window.AerotechAnalytics.track('page_visible');
                }
            }
        });
        
        // Handle online/offline events
        window.addEventListener('online', () => {
            console.log('[AEROTECH] Connection restored');
        });
        
        window.addEventListener('offline', () => {
            console.log('[AEROTECH] Connection lost');
        });
        
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            if (window.AerotechAnalytics) {
                window.AerotechAnalytics.track('orientation_changed', {
                    orientation: screen.orientation?.type || 'unknown'
                });
            }
        });
        
        // Handle print events
        window.addEventListener('beforeprint', () => {
            if (window.AerotechAnalytics) {
                window.AerotechAnalytics.track('page_print_start');
            }
        });
        
        window.addEventListener('afterprint', () => {
            if (window.AerotechAnalytics) {
                window.AerotechAnalytics.track('page_print_complete');
            }
        });
    }
    
    function initThirdPartyIntegrations() {
        // Initialize Google Analytics (if configured)
        if (window.GA_TRACKING_ID) {
            initGoogleAnalytics(window.GA_TRACKING_ID);
        }
        
        // Initialize Yandex Metrika (if configured)
        if (window.YM_COUNTER_ID) {
            initYandexMetrika(window.YM_COUNTER_ID);
        }
    }
    
    function initGoogleAnalytics(trackingId) {
        // Load Google Analytics
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', trackingId);
        
        console.log('[AEROTECH] Google Analytics initialized');
    }
    
    function initYandexMetrika(counterId) {
        // Load Yandex Metrika
        (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
        })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
        
        ym(counterId, "init", {
            clickmap:true,
            trackLinks:true,
            accurateTrackBounce:true,
            webvisor:true
        });
        
        console.log('[AEROTECH] Yandex Metrika initialized');
    }
    
    // Expose global API
    window.AEROTECH = {
        version: '2.0.0',
        config: config,
        features: features,
        
        // Public methods
        getAnalytics: () => window.AerotechAnalytics,
        getPWA: () => window.AerotechPWA,
        getSearch: () => window.AerotechSearch,
        getLang: () => window.AerotechLang,
        getPerformance: () => window.AerotechPerformance,
        getLazyLoad: () => window.AerotechLazyLoad,
        getSocial: () => window.AerotechSocial,
        
        // Utility methods
        track: (event, data) => {
            if (window.AerotechAnalytics) {
                window.AerotechAnalytics.track(event, data);
            }
        },
        
        changeLanguage: (lang) => {
            if (window.AerotechLang) {
                window.AerotechLang.setLanguage(lang);
            }
        },
        
        search: (query) => {
            if (window.AerotechSearch) {
                return window.AerotechSearch.search(query);
            }
            return [];
        },
        
        share: (platform, data) => {
            if (window.AerotechSocial) {
                window.AerotechSocial.share(platform, data);
            }
        },
        
        getMetrics: () => {
            if (window.AerotechPerformance) {
                return window.AerotechPerformance.getMetrics();
            }
            return null;
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Log initialization
    console.log('%c🚁 AEROTECH Enhanced Platform v2.0.0', 
        'color: #00c0c0; font-size: 16px; font-weight: bold;');
    console.log('%cNew features: Analytics, PWA, Search, i18n, Performance Monitoring, Lazy Load, Social Share', 
        'color: #b0b0b0; font-size: 12px;');
})();
