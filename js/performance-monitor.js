/**
 * AEROTECH Performance Monitoring & Error Tracking System
 * Monitors site performance and tracks errors
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            performance: [],
            errors: [],
            resources: [],
            vitals: {}
        };
        this.errorCount = 0;
        this.maxErrors = 50; // Store max 50 errors
        this.init();
    }

    init() {
        // Monitor page performance
        this.monitorPagePerformance();
        
        // Monitor Core Web Vitals
        this.monitorCoreWebVitals();
        
        // Monitor errors
        this.monitorErrors();
        
        // Monitor resource loading
        this.monitorResources();
        
        // Monitor long tasks
        this.monitorLongTasks();
        
        // Monitor memory usage
        this.monitorMemory();
        
        // Setup performance observer
        this.setupPerformanceObserver();
        
        // Create debug panel
        if (this.isDebugMode()) {
            this.createDebugPanel();
        }
    }

    isDebugMode() {
        return localStorage.getItem('aerotech_debug') === 'true' ||
               window.location.search.includes('debug=true');
    }

    monitorPagePerformance() {
        if (!window.performance || !window.performance.timing) {
            return;
        }

        window.addEventListener('load', () => {
            setTimeout(() => {
                const timing = window.performance.timing;
                const navigation = window.performance.navigation;
                
                const metrics = {
                    // Navigation timings
                    navigationStart: timing.navigationStart,
                    navigationtype: navigation.type,
                    redirectCount: navigation.redirectCount,
                    
                    // Network timings
                    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
                    tcpConnection: timing.connectEnd - timing.connectStart,
                    tlsNegotiation: timing.secureConnectionStart > 0 
                        ? timing.connectEnd - timing.secureConnectionStart 
                        : 0,
                    
                    // Request/Response timings
                    requestTime: timing.responseStart - timing.requestStart,
                    responseTime: timing.responseEnd - timing.responseStart,
                    
                    // DOM timings
                    domLoading: timing.domLoading - timing.navigationStart,
                    domInteractive: timing.domInteractive - timing.navigationStart,
                    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                    domComplete: timing.domComplete - timing.navigationStart,
                    
                    // Load timings
                    pageLoadTime: timing.loadEventEnd - timing.navigationStart,
                    
                    // First Paint
                    firstPaint: this.getFirstPaint(),
                    firstContentfulPaint: this.getFirstContentfulPaint(),
                    
                    timestamp: Date.now()
                };
                
                this.metrics.performance.push(metrics);
                
                // Log slow pages
                if (metrics.pageLoadTime > 3000) {
                    console.warn('[Performance] Slow page load:', metrics.pageLoadTime + 'ms');
                }
                
                // Track in analytics
                if (window.AerotechAnalytics) {
                    window.AerotechAnalytics.track('page_performance', metrics);
                }
                
                // Log to console if in debug mode
                if (this.isDebugMode()) {
                    console.log('[Performance] Page metrics:', metrics);
                }
            }, 0);
        });
    }

    getFirstPaint() {
        if (window.performance && window.performance.getEntriesByType) {
            const paintEntries = window.performance.getEntriesByType('paint');
            const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
            return firstPaint ? firstPaint.startTime : 0;
        }
        return 0;
    }

    getFirstContentfulPaint() {
        if (window.performance && window.performance.getEntriesByType) {
            const paintEntries = window.performance.getEntriesByType('paint');
            const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            return fcp ? fcp.startTime : 0;
        }
        return 0;
    }

    monitorCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        this.observeLCP();
        
        // First Input Delay (FID)
        this.observeFID();
        
        // Cumulative Layout Shift (CLS)
        this.observeCLS();
    }

    observeLCP() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.metrics.vitals.lcp = lastEntry.startTime;
                
                if (this.isDebugMode()) {
                    console.log('[Performance] LCP:', lastEntry.startTime);
                }
                
                // LCP should be under 2.5s for good performance
                if (lastEntry.startTime > 2500) {
                    console.warn('[Performance] Poor LCP:', lastEntry.startTime);
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.error('[Performance] LCP observer error:', e);
        }
    }

    observeFID() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    this.metrics.vitals.fid = entry.processingStart - entry.startTime;
                    
                    if (this.isDebugMode()) {
                        console.log('[Performance] FID:', entry.processingStart - entry.startTime);
                    }
                    
                    // FID should be under 100ms for good performance
                    if ((entry.processingStart - entry.startTime) > 100) {
                        console.warn('[Performance] Poor FID:', entry.processingStart - entry.startTime);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            console.error('[Performance] FID observer error:', e);
        }
    }

    observeCLS() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            let clsValue = 0;
            
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        this.metrics.vitals.cls = clsValue;
                        
                        if (this.isDebugMode()) {
                            console.log('[Performance] CLS:', clsValue);
                        }
                    }
                });
                
                // CLS should be under 0.1 for good performance
                if (clsValue > 0.1) {
                    console.warn('[Performance] Poor CLS:', clsValue);
                }
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            console.error('[Performance] CLS observer error:', e);
        }
    }

    monitorErrors() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise',
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });
        
        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.logError({
                    type: 'resource',
                    message: 'Failed to load resource',
                    url: event.target.src || event.target.href,
                    element: event.target.tagName,
                    timestamp: Date.now()
                });
            }
        }, true);
    }

    logError(error) {
        this.errorCount++;
        this.metrics.errors.push(error);
        
        // Keep only recent errors
        if (this.metrics.errors.length > this.maxErrors) {
            this.metrics.errors.shift();
        }
        
        // Log to console
        console.error('[Error Tracking]', error.type, error.message);
        
        // Track in analytics
        if (window.AerotechAnalytics) {
            window.AerotechAnalytics.track('error', error);
        }
        
        // Update debug panel if active
        if (this.debugPanel) {
            this.updateDebugPanel();
        }
        
        // Store in localStorage for later review
        try {
            const stored = JSON.parse(localStorage.getItem('aerotech_errors') || '[]');
            stored.push(error);
            
            // Keep only last 20 errors
            if (stored.length > 20) {
                stored.shift();
            }
            
            localStorage.setItem('aerotech_errors', JSON.stringify(stored));
        } catch (e) {
            // localStorage might be full
        }
    }

    monitorResources() {
        if (!window.performance || !window.performance.getEntriesByType) {
            return;
        }

        window.addEventListener('load', () => {
            setTimeout(() => {
                const resources = window.performance.getEntriesByType('resource');
                
                resources.forEach((resource) => {
                    const resourceData = {
                        name: resource.name,
                        type: resource.initiatorType,
                        duration: resource.duration,
                        size: resource.transferSize,
                        startTime: resource.startTime,
                        timestamp: Date.now()
                    };
                    
                    this.metrics.resources.push(resourceData);
                    
                    // Warn about slow resources
                    if (resource.duration > 1000) {
                        console.warn('[Performance] Slow resource:', resource.name, resource.duration + 'ms');
                    }
                    
                    // Warn about large resources
                    if (resource.transferSize > 500000) {
                        console.warn('[Performance] Large resource:', resource.name, 
                            Math.round(resource.transferSize / 1024) + 'KB');
                    }
                });
                
                if (this.isDebugMode()) {
                    console.log('[Performance] Resources:', this.metrics.resources);
                }
            }, 0);
        });
    }

    monitorLongTasks() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    console.warn('[Performance] Long task detected:', entry.duration + 'ms');
                    
                    if (window.AerotechAnalytics) {
                        window.AerotechAnalytics.track('long_task', {
                            duration: entry.duration,
                            startTime: entry.startTime
                        });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
            // Long task observer not supported
        }
    }

    monitorMemory() {
        if (!performance.memory) return;
        
        setInterval(() => {
            const memory = {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            };
            
            // Warn if memory usage is high
            const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
            if (usagePercent > 90) {
                console.warn('[Performance] High memory usage:', usagePercent.toFixed(2) + '%');
            }
            
            if (this.isDebugMode() && this.debugPanel) {
                this.updateMemoryDisplay(memory);
            }
        }, 5000); // Check every 5 seconds
    }

    setupPerformanceObserver() {
        if (!('PerformanceObserver' in window)) return;
        
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (this.isDebugMode()) {
                        console.log('[Performance]', entry.entryType, entry.name, entry);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['navigation', 'resource', 'measure', 'mark'] });
        } catch (e) {
            console.error('[Performance] Observer error:', e);
        }
    }

    createDebugPanel() {
        const panel = document.createElement('div');
        panel.className = 'debug-panel';
        panel.innerHTML = `
            <div class="debug-panel-header">
                <h3>🔧 Performance Monitor</h3>
                <button class="debug-panel-toggle">−</button>
                <button class="debug-panel-close">×</button>
            </div>
            <div class="debug-panel-content">
                <div class="debug-section">
                    <h4>Core Web Vitals</h4>
                    <div class="debug-vital">
                        <span>LCP:</span>
                        <span class="debug-value" id="debug-lcp">-</span>
                    </div>
                    <div class="debug-vital">
                        <span>FID:</span>
                        <span class="debug-value" id="debug-fid">-</span>
                    </div>
                    <div class="debug-vital">
                        <span>CLS:</span>
                        <span class="debug-value" id="debug-cls">-</span>
                    </div>
                </div>
                
                <div class="debug-section">
                    <h4>Memory</h4>
                    <div class="debug-memory">
                        <span>Used:</span>
                        <span class="debug-value" id="debug-memory-used">-</span>
                    </div>
                    <div class="debug-memory">
                        <span>Total:</span>
                        <span class="debug-value" id="debug-memory-total">-</span>
                    </div>
                </div>
                
                <div class="debug-section">
                    <h4>Errors</h4>
                    <div class="debug-errors">
                        <span>Total:</span>
                        <span class="debug-value" id="debug-errors-count">0</span>
                    </div>
                    <div class="debug-errors-list" id="debug-errors-list"></div>
                </div>
                
                <div class="debug-actions">
                    <button class="debug-btn" id="debug-clear-errors">Clear Errors</button>
                    <button class="debug-btn" id="debug-export">Export Data</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.debugPanel = panel;
        
        // Setup event listeners
        panel.querySelector('.debug-panel-toggle').addEventListener('click', () => {
            panel.classList.toggle('minimized');
        });
        
        panel.querySelector('.debug-panel-close').addEventListener('click', () => {
            panel.style.display = 'none';
        });
        
        panel.querySelector('#debug-clear-errors').addEventListener('click', () => {
            this.metrics.errors = [];
            this.errorCount = 0;
            localStorage.removeItem('aerotech_errors');
            this.updateDebugPanel();
        });
        
        panel.querySelector('#debug-export').addEventListener('click', () => {
            this.exportMetrics();
        });
        
        // Update panel periodically
        this.updateDebugPanel();
        setInterval(() => this.updateDebugPanel(), 2000);
    }

    updateDebugPanel() {
        if (!this.debugPanel) return;
        
        // Update vitals
        const lcpEl = this.debugPanel.querySelector('#debug-lcp');
        const fidEl = this.debugPanel.querySelector('#debug-fid');
        const clsEl = this.debugPanel.querySelector('#debug-cls');
        
        if (lcpEl && this.metrics.vitals.lcp) {
            lcpEl.textContent = Math.round(this.metrics.vitals.lcp) + 'ms';
            lcpEl.className = 'debug-value ' + this.getVitalClass('lcp', this.metrics.vitals.lcp);
        }
        
        if (fidEl && this.metrics.vitals.fid) {
            fidEl.textContent = Math.round(this.metrics.vitals.fid) + 'ms';
            fidEl.className = 'debug-value ' + this.getVitalClass('fid', this.metrics.vitals.fid);
        }
        
        if (clsEl && this.metrics.vitals.cls) {
            clsEl.textContent = this.metrics.vitals.cls.toFixed(3);
            clsEl.className = 'debug-value ' + this.getVitalClass('cls', this.metrics.vitals.cls);
        }
        
        // Update errors
        const errorsCount = this.debugPanel.querySelector('#debug-errors-count');
        if (errorsCount) {
            errorsCount.textContent = this.errorCount;
        }
        
        const errorsList = this.debugPanel.querySelector('#debug-errors-list');
        if (errorsList) {
            const recent = this.metrics.errors.slice(-5);
            errorsList.innerHTML = recent.map(err => `
                <div class="debug-error-item">
                    <span class="debug-error-type">${err.type}</span>
                    <span class="debug-error-msg">${err.message}</span>
                </div>
            `).join('');
        }
    }

    updateMemoryDisplay(memory) {
        if (!this.debugPanel) return;
        
        const usedEl = this.debugPanel.querySelector('#debug-memory-used');
        const totalEl = this.debugPanel.querySelector('#debug-memory-total');
        
        if (usedEl) {
            usedEl.textContent = this.formatBytes(memory.usedJSHeapSize);
        }
        
        if (totalEl) {
            totalEl.textContent = this.formatBytes(memory.totalJSHeapSize);
        }
    }

    getVitalClass(vital, value) {
        const thresholds = {
            lcp: { good: 2500, poor: 4000 },
            fid: { good: 100, poor: 300 },
            cls: { good: 0.1, poor: 0.25 }
        };
        
        const threshold = thresholds[vital];
        if (!threshold) return '';
        
        if (value <= threshold.good) return 'good';
        if (value <= threshold.poor) return 'needs-improvement';
        return 'poor';
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    exportMetrics() {
        const data = {
            performance: this.metrics.performance,
            vitals: this.metrics.vitals,
            errors: this.metrics.errors,
            resources: this.metrics.resources,
            exportedAt: new Date().toISOString()
        };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `aerotech-metrics-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Public API
    getMetrics() {
        return this.metrics;
    }

    clearMetrics() {
        this.metrics = {
            performance: [],
            errors: [],
            resources: [],
            vitals: {}
        };
        this.errorCount = 0;
    }
}

// Initialize performance monitor
window.addEventListener('DOMContentLoaded', () => {
    window.AerotechPerformance = new PerformanceMonitor();
});

// Add debug panel styles
const debugStyles = document.createElement('style');
debugStyles.textContent = `
    .debug-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 350px;
        max-height: 600px;
        background: rgba(10, 10, 10, 0.95);
        border: 1px solid #00c0c0;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 192, 192, 0.3);
        font-family: 'IBM Plex Mono', monospace;
        font-size: 12px;
        z-index: 99998;
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
    }
    
    .debug-panel.minimized .debug-panel-content {
        display: none;
    }
    
    .debug-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid #333;
        background: rgba(0, 192, 192, 0.1);
    }
    
    .debug-panel-header h3 {
        margin: 0;
        font-size: 14px;
        color: #00c0c0;
        font-weight: 600;
    }
    
    .debug-panel-toggle,
    .debug-panel-close {
        background: transparent;
        border: none;
        color: #00c0c0;
        font-size: 18px;
        cursor: pointer;
        padding: 0 8px;
        line-height: 1;
    }
    
    .debug-panel-toggle:hover,
    .debug-panel-close:hover {
        color: white;
    }
    
    .debug-panel-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
    }
    
    .debug-section {
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid #222;
    }
    
    .debug-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }
    
    .debug-section h4 {
        margin: 0 0 8px 0;
        font-size: 12px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .debug-vital,
    .debug-memory,
    .debug-errors {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        color: #b0b0b0;
    }
    
    .debug-value {
        color: white;
        font-weight: 600;
    }
    
    .debug-value.good {
        color: #00c851;
    }
    
    .debug-value.needs-improvement {
        color: #ffbb33;
    }
    
    .debug-value.poor {
        color: #ff4444;
    }
    
    .debug-errors-list {
        max-height: 150px;
        overflow-y: auto;
        margin-top: 8px;
    }
    
    .debug-error-item {
        padding: 6px;
        background: rgba(255, 68, 68, 0.1);
        border-left: 2px solid #ff4444;
        margin-bottom: 4px;
        font-size: 10px;
    }
    
    .debug-error-type {
        display: block;
        color: #ff4444;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 2px;
    }
    
    .debug-error-msg {
        display: block;
        color: #b0b0b0;
    }
    
    .debug-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #222;
    }
    
    .debug-btn {
        flex: 1;
        padding: 8px;
        background: rgba(0, 192, 192, 0.1);
        border: 1px solid #00c0c0;
        border-radius: 4px;
        color: #00c0c0;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .debug-btn:hover {
        background: rgba(0, 192, 192, 0.2);
    }
    
    @media (max-width: 768px) {
        .debug-panel {
            bottom: 10px;
            right: 10px;
            width: calc(100% - 20px);
            max-width: 350px;
        }
    }
`;
document.head.appendChild(debugStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}
