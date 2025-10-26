/**
 * AEROTECH Advanced Analytics System
 * Tracks user interactions, performance metrics, and engagement
 */

class AnalyticsManager {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.events = [];
        this.userAgent = navigator.userAgent;
        this.screenResolution = `${window.screen.width}x${window.screen.height}`;
        this.init();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    init() {
        // Track page view
        this.trackPageView();
        
        // Track page performance
        this.trackPerformance();
        
        // Track user interactions
        this.setupInteractionTracking();
        
        // Track scroll depth
        this.setupScrollTracking();
        
        // Track time on page
        this.setupTimeTracking();
        
        // Track exit intent
        this.setupExitTracking();
    }

    trackPageView() {
        const pageData = {
            event: 'page_view',
            timestamp: Date.now(),
            url: window.location.href,
            pathname: window.location.pathname,
            referrer: document.referrer,
            title: document.title,
            sessionId: this.sessionId,
            userAgent: this.userAgent,
            screenResolution: this.screenResolution
        };
        
        this.logEvent(pageData);
    }

    trackPerformance() {
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const timing = window.performance.timing;
                    const performanceData = {
                        event: 'performance',
                        timestamp: Date.now(),
                        sessionId: this.sessionId,
                        metrics: {
                            pageLoadTime: timing.loadEventEnd - timing.navigationStart,
                            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                            firstPaint: this.getFirstPaint(),
                            dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
                            tcpConnection: timing.connectEnd - timing.connectStart,
                            serverResponse: timing.responseEnd - timing.requestStart,
                            domProcessing: timing.domComplete - timing.domLoading
                        }
                    };
                    
                    this.logEvent(performanceData);
                }, 0);
            });
        }
    }

    getFirstPaint() {
        if (window.performance && window.performance.getEntriesByType) {
            const paintEntries = window.performance.getEntriesByType('paint');
            const firstPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            return firstPaint ? firstPaint.startTime : null;
        }
        return null;
    }

    setupInteractionTracking() {
        // Track button clicks
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, a, .cta-button, .btn-gradient, .btn-outline');
            if (button) {
                this.trackEvent('click', {
                    element: button.tagName,
                    text: button.textContent.trim().substring(0, 50),
                    href: button.getAttribute('href'),
                    class: button.className
                });
            }
        });

        // Track form interactions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.trackEvent('form_submit', {
                    formId: form.id,
                    action: form.action
                });
            });
        });

        // Track video plays
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.addEventListener('play', () => {
                this.trackEvent('video_play', {
                    src: video.src || video.querySelector('source')?.src
                });
            });
        });

        // Track navigation
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.trackEvent('navigation', {
                    destination: link.getAttribute('href'),
                    text: link.textContent.trim()
                });
            });
        });
    }

    setupScrollTracking() {
        let maxScroll = 0;
        const milestones = [25, 50, 75, 100];
        const reached = new Set();

        const checkScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (window.pageYOffset / scrollHeight) * 100;
            
            maxScroll = Math.max(maxScroll, scrolled);

            milestones.forEach(milestone => {
                if (scrolled >= milestone && !reached.has(milestone)) {
                    reached.add(milestone);
                    this.trackEvent('scroll_depth', {
                        depth: milestone,
                        pixels: window.pageYOffset
                    });
                }
            });
        };

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(checkScroll, 100);
        });
    }

    setupTimeTracking() {
        // Track time spent on page
        setInterval(() => {
            const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
            if (timeSpent % 30 === 0) { // Log every 30 seconds
                this.trackEvent('time_on_page', {
                    seconds: timeSpent
                });
            }
        }, 1000);

        // Track when user becomes inactive
        let inactiveTimeout;
        const resetInactiveTimer = () => {
            clearTimeout(inactiveTimeout);
            inactiveTimeout = setTimeout(() => {
                this.trackEvent('user_inactive', {
                    afterSeconds: 60
                });
            }, 60000); // 1 minute
        };

        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetInactiveTimer, true);
        });
    }

    setupExitTracking() {
        // Track exit intent
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY < 0) {
                this.trackEvent('exit_intent', {
                    timeOnPage: Math.floor((Date.now() - this.startTime) / 1000)
                });
            }
        });

        // Track before unload
        window.addEventListener('beforeunload', () => {
            this.trackEvent('page_exit', {
                timeOnPage: Math.floor((Date.now() - this.startTime) / 1000),
                scrollDepth: (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            });
            
            // Send all pending events
            this.flush();
        });
    }

    trackEvent(eventName, data = {}) {
        const event = {
            event: eventName,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            url: window.location.href,
            ...data
        };
        
        this.logEvent(event);
    }

    logEvent(event) {
        this.events.push(event);
        
        // Console logging for development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('[Analytics]', event.event, event);
        }
        
        // Store in localStorage for later analysis
        this.storeEvent(event);
        
        // Send to analytics endpoint (if configured)
        this.sendToEndpoint(event);
    }

    storeEvent(event) {
        try {
            const key = 'aerotech_analytics_' + new Date().toISOString().split('T')[0];
            const stored = JSON.parse(localStorage.getItem(key) || '[]');
            stored.push(event);
            
            // Keep only last 100 events per day
            if (stored.length > 100) {
                stored.shift();
            }
            
            localStorage.setItem(key, JSON.stringify(stored));
        } catch (e) {
            console.error('Failed to store analytics event:', e);
        }
    }

    sendToEndpoint(event) {
        // This would send to your analytics backend
        // For now, we'll use navigator.sendBeacon if available
        if (navigator.sendBeacon && window.ANALYTICS_ENDPOINT) {
            const data = JSON.stringify(event);
            navigator.sendBeacon(window.ANALYTICS_ENDPOINT, data);
        }
    }

    flush() {
        // Send all pending events
        if (this.events.length > 0 && navigator.sendBeacon && window.ANALYTICS_ENDPOINT) {
            const data = JSON.stringify(this.events);
            navigator.sendBeacon(window.ANALYTICS_ENDPOINT, data);
            this.events = [];
        }
    }

    // Public API for custom tracking
    track(eventName, data) {
        this.trackEvent(eventName, data);
    }

    // Get analytics summary
    getSummary() {
        return {
            sessionId: this.sessionId,
            sessionDuration: Math.floor((Date.now() - this.startTime) / 1000),
            eventsCount: this.events.length,
            userAgent: this.userAgent,
            screenResolution: this.screenResolution
        };
    }
}

// Initialize analytics
window.AerotechAnalytics = new AnalyticsManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsManager;
}
