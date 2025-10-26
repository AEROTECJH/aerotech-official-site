/**
 * AEROTECH PWA Initialization
 * Handles Service Worker registration and PWA features
 */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    async init() {
        // Check if already installed
        this.checkInstallStatus();
        
        // Register service worker
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });
                
                console.log('[PWA] Service Worker registered:', registration.scope);
                
                // Check for updates
                this.checkForUpdates(registration);
                
                // Handle updates
                this.handleUpdates(registration);
                
            } catch (error) {
                console.error('[PWA] Service Worker registration failed:', error);
            }
        }
        
        // Setup install prompt
        this.setupInstallPrompt();
        
        // Setup network status monitoring
        this.setupNetworkMonitoring();
        
        // Setup notification permission
        this.setupNotifications();
    }

    checkInstallStatus() {
        // Check if running as PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone ||
                           document.referrer.includes('android-app://');
        
        this.isInstalled = isStandalone;
        
        if (isStandalone) {
            console.log('[PWA] Running as installed app');
            document.body.classList.add('pwa-installed');
        }
    }

    setupInstallPrompt() {
        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            
            console.log('[PWA] Install prompt available');
            
            // Show install button
            this.showInstallButton();
        });
        
        // Listen for app installed
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed');
            this.isInstalled = true;
            this.hideInstallButton();
            
            // Track installation
            if (window.AerotechAnalytics) {
                window.AerotechAnalytics.track('pwa_installed');
            }
        });
    }

    showInstallButton() {
        // Create install button if it doesn't exist
        let installBtn = document.getElementById('pwa-install-btn');
        
        if (!installBtn) {
            installBtn = document.createElement('button');
            installBtn.id = 'pwa-install-btn';
            installBtn.className = 'pwa-install-button';
            installBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Установить приложение</span>
            `;
            
            installBtn.addEventListener('click', () => this.promptInstall());
            
            // Add to page (after nav or hero section)
            const nav = document.querySelector('.main-nav');
            if (nav && nav.nextSibling) {
                nav.parentNode.insertBefore(installBtn, nav.nextSibling);
            } else {
                document.body.appendChild(installBtn);
            }
        }
        
        installBtn.style.display = 'flex';
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (installBtn) {
                installBtn.classList.add('minimized');
            }
        }, 10000);
    }

    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('[PWA] No install prompt available');
            return;
        }
        
        // Show install prompt
        this.deferredPrompt.prompt();
        
        // Wait for user response
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log('[PWA] User response:', outcome);
        
        // Track user choice
        if (window.AerotechAnalytics) {
            window.AerotechAnalytics.track('pwa_install_prompt', {
                outcome: outcome
            });
        }
        
        // Clear the prompt
        this.deferredPrompt = null;
        
        // Hide install button
        if (outcome === 'accepted') {
            this.hideInstallButton();
        }
    }

    checkForUpdates(registration) {
        // Check for updates every hour
        setInterval(() => {
            registration.update();
        }, 60 * 60 * 1000);
    }

    handleUpdates(registration) {
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    this.showUpdateNotification();
                }
            });
        });
    }

    showUpdateNotification() {
        // Create update notification
        const notification = document.createElement('div');
        notification.className = 'pwa-update-notification';
        notification.innerHTML = `
            <div class="pwa-update-content">
                <p>Доступна новая версия приложения</p>
                <button class="btn-update">Обновить</button>
                <button class="btn-dismiss">Позже</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Handle update button
        notification.querySelector('.btn-update').addEventListener('click', () => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            }
            window.location.reload();
        });
        
        // Handle dismiss button
        notification.querySelector('.btn-dismiss').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-show
        setTimeout(() => notification.classList.add('show'), 100);
    }

    setupNetworkMonitoring() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            console.log('[PWA] Back online');
            this.showNetworkStatus('online');
            
            if (window.AerotechAnalytics) {
                window.AerotechAnalytics.track('network_online');
            }
        });
        
        window.addEventListener('offline', () => {
            console.log('[PWA] Gone offline');
            this.showNetworkStatus('offline');
            
            if (window.AerotechAnalytics) {
                window.AerotechAnalytics.track('network_offline');
            }
        });
    }

    showNetworkStatus(status) {
        // Remove existing notification
        const existing = document.querySelector('.network-status-notification');
        if (existing) {
            existing.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `network-status-notification ${status}`;
        notification.innerHTML = status === 'online' 
            ? '<span>🌐 Подключение восстановлено</span>'
            : '<span>📡 Вы не в сети (работает офлайн режим)</span>';
        
        document.body.appendChild(notification);
        
        // Auto-show
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async setupNotifications() {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            return;
        }
        
        // Check current permission
        if (Notification.permission === 'default') {
            // Could show a custom prompt here
            console.log('[PWA] Notification permission not determined');
        }
    }

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            return false;
        }
        
        const permission = await Notification.requestPermission();
        
        if (window.AerotechAnalytics) {
            window.AerotechAnalytics.track('notification_permission', {
                result: permission
            });
        }
        
        return permission === 'granted';
    }

    async showNotification(title, options = {}) {
        if (Notification.permission !== 'granted') {
            return;
        }
        
        const registration = await navigator.serviceWorker.ready;
        
        await registration.showNotification(title, {
            icon: '/favicon-192x192.png',
            badge: '/favicon-192x192.png',
            vibrate: [100, 50, 100],
            ...options
        });
    }

    async getCacheSize() {
        if (!navigator.serviceWorker.controller) {
            return null;
        }
        
        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();
            
            messageChannel.port1.onmessage = (event) => {
                if (event.data.type === 'CACHE_SIZE') {
                    resolve(event.data);
                }
            };
            
            navigator.serviceWorker.controller.postMessage(
                { type: 'GET_CACHE_SIZE' },
                [messageChannel.port2]
            );
        });
    }

    async clearCache() {
        if (!navigator.serviceWorker.controller) {
            return;
        }
        
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
        
        // Also clear other browser caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }
        
        console.log('[PWA] Cache cleared');
    }
}

// Initialize PWA
window.AerotechPWA = new PWAManager();

// Add CSS for PWA UI elements
const pwaStyles = document.createElement('style');
pwaStyles.textContent = `
    .pwa-install-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: linear-gradient(135deg, #00c0c0, #00a0a0);
        color: white;
        border: none;
        border-radius: 50px;
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0, 192, 192, 0.4);
        transition: all 0.3s ease;
    }
    
    .pwa-install-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(0, 192, 192, 0.5);
    }
    
    .pwa-install-button.minimized {
        width: 50px;
        height: 50px;
        padding: 0;
        border-radius: 50%;
        justify-content: center;
    }
    
    .pwa-install-button.minimized span {
        display: none;
    }
    
    .pwa-update-notification,
    .network-status-notification {
        position: fixed;
        top: 80px;
        right: -400px;
        z-index: 10000;
        background: rgba(10, 10, 10, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid #00c0c0;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        transition: right 0.3s ease;
    }
    
    .pwa-update-notification.show,
    .network-status-notification.show {
        right: 20px;
    }
    
    .pwa-update-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .pwa-update-content p {
        margin: 0;
        color: white;
        font-family: 'Montserrat', sans-serif;
    }
    
    .pwa-update-content button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .btn-update {
        background: #00c0c0;
        color: #0a0a0a;
    }
    
    .btn-update:hover {
        background: #00d5d5;
    }
    
    .btn-dismiss {
        background: transparent;
        color: #999;
        border: 1px solid #333;
    }
    
    .btn-dismiss:hover {
        color: white;
        border-color: #666;
    }
    
    .network-status-notification {
        padding: 12px 20px;
    }
    
    .network-status-notification span {
        color: white;
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
    }
    
    .network-status-notification.online {
        border-color: #00c851;
    }
    
    .network-status-notification.offline {
        border-color: #ff4444;
    }
    
    @media (max-width: 768px) {
        .pwa-install-button {
            bottom: 10px;
            right: 10px;
            font-size: 12px;
            padding: 10px 16px;
        }
        
        .pwa-update-notification,
        .network-status-notification {
            left: 10px;
            right: 10px;
            width: auto;
        }
        
        .pwa-update-notification.show,
        .network-status-notification.show {
            right: auto;
        }
    }
`;
document.head.appendChild(pwaStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAManager;
}
