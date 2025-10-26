/**
 * AEROTECH Social Media Integration & Sharing System
 * Provides social sharing capabilities and social media integration
 */

class SocialMediaManager {
    constructor() {
        this.platforms = {
            telegram: {
                name: 'Telegram',
                icon: this.getTelegramIcon(),
                shareUrl: 'https://t.me/share/url',
                color: '#0088cc'
            },
            vk: {
                name: 'VKontakte',
                icon: this.getVKIcon(),
                shareUrl: 'https://vk.com/share.php',
                color: '#4680C2'
            },
            twitter: {
                name: 'Twitter',
                icon: this.getTwitterIcon(),
                shareUrl: 'https://twitter.com/intent/tweet',
                color: '#1DA1F2'
            },
            facebook: {
                name: 'Facebook',
                icon: this.getFacebookIcon(),
                shareUrl: 'https://www.facebook.com/sharer/sharer.php',
                color: '#1877F2'
            },
            whatsapp: {
                name: 'WhatsApp',
                icon: this.getWhatsAppIcon(),
                shareUrl: 'https://wa.me/',
                color: '#25D366'
            },
            linkedin: {
                name: 'LinkedIn',
                icon: this.getLinkedInIcon(),
                shareUrl: 'https://www.linkedin.com/sharing/share-offsite/',
                color: '#0A66C2'
            },
            email: {
                name: 'Email',
                icon: this.getEmailIcon(),
                shareUrl: 'mailto:',
                color: '#666'
            }
        };
        
        this.init();
    }

    init() {
        // Create share buttons
        this.createShareButtons();
        
        // Setup native share API if available
        this.setupNativeShare();
        
        // Add social meta tags
        this.updateSocialMetaTags();
        
        // Track social shares
        this.trackSocialShares();
    }

    createShareButtons() {
        // Find all elements with data-share attribute
        document.querySelectorAll('[data-share]').forEach((element) => {
            const container = this.createShareContainer(element);
            element.appendChild(container);
        });
        
        // Add floating share buttons if configured
        if (this.shouldShowFloatingShare()) {
            this.createFloatingShareButtons();
        }
    }

    createShareContainer(element) {
        const container = document.createElement('div');
        container.className = 'social-share-container';
        
        const title = element.dataset.shareTitle || document.title;
        const url = element.dataset.shareUrl || window.location.href;
        const description = element.dataset.shareDescription || 
                          document.querySelector('meta[name="description"]')?.content || '';
        
        // Add share label
        const label = document.createElement('span');
        label.className = 'share-label';
        label.textContent = 'Поделиться:';
        container.appendChild(label);
        
        // Add share buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'share-buttons';
        
        ['telegram', 'vk', 'twitter', 'facebook', 'whatsapp'].forEach((platform) => {
            const button = this.createShareButton(platform, { title, url, description });
            buttonsContainer.appendChild(button);
        });
        
        // Add native share button if available
        if (navigator.share) {
            const nativeButton = this.createNativeShareButton({ title, url, description });
            buttonsContainer.appendChild(nativeButton);
        }
        
        // Add copy link button
        const copyButton = this.createCopyLinkButton(url);
        buttonsContainer.appendChild(copyButton);
        
        container.appendChild(buttonsContainer);
        
        return container;
    }

    createShareButton(platform, data) {
        const config = this.platforms[platform];
        
        const button = document.createElement('button');
        button.className = 'share-button';
        button.setAttribute('data-platform', platform);
        button.setAttribute('aria-label', `Поделиться в ${config.name}`);
        button.innerHTML = config.icon;
        button.style.setProperty('--platform-color', config.color);
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.share(platform, data);
        });
        
        return button;
    }

    createNativeShareButton(data) {
        const button = document.createElement('button');
        button.className = 'share-button share-native';
        button.setAttribute('aria-label', 'Поделиться');
        button.innerHTML = this.getShareIcon();
        
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            await this.nativeShare(data);
        });
        
        return button;
    }

    createCopyLinkButton(url) {
        const button = document.createElement('button');
        button.className = 'share-button share-copy';
        button.setAttribute('aria-label', 'Скопировать ссылку');
        button.innerHTML = this.getCopyIcon();
        
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            await this.copyToClipboard(url);
            
            // Visual feedback
            button.innerHTML = this.getCheckIcon();
            button.classList.add('copied');
            
            setTimeout(() => {
                button.innerHTML = this.getCopyIcon();
                button.classList.remove('copied');
            }, 2000);
        });
        
        return button;
    }

    share(platform, data) {
        const config = this.platforms[platform];
        let shareUrl = '';
        
        switch (platform) {
            case 'telegram':
                shareUrl = `${config.shareUrl}?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.title)}`;
                break;
                
            case 'vk':
                shareUrl = `${config.shareUrl}?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}&description=${encodeURIComponent(data.description)}`;
                break;
                
            case 'twitter':
                shareUrl = `${config.shareUrl}?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.title)}`;
                break;
                
            case 'facebook':
                shareUrl = `${config.shareUrl}?u=${encodeURIComponent(data.url)}`;
                break;
                
            case 'whatsapp':
                shareUrl = `${config.shareUrl}?text=${encodeURIComponent(data.title + ' ' + data.url)}`;
                break;
                
            case 'linkedin':
                shareUrl = `${config.shareUrl}?url=${encodeURIComponent(data.url)}`;
                break;
                
            case 'email':
                shareUrl = `${config.shareUrl}?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(data.description + '\n\n' + data.url)}`;
                break;
        }
        
        if (platform === 'email') {
            window.location.href = shareUrl;
        } else {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
        
        // Track share
        if (window.AerotechAnalytics) {
            window.AerotechAnalytics.track('social_share', {
                platform: platform,
                url: data.url,
                title: data.title
            });
        }
    }

    setupNativeShare() {
        // Add native share buttons
        document.querySelectorAll('[data-native-share]').forEach((button) => {
            button.addEventListener('click', async () => {
                const title = button.dataset.shareTitle || document.title;
                const url = button.dataset.shareUrl || window.location.href;
                const text = button.dataset.shareText || '';
                
                await this.nativeShare({ title, url, text });
            });
        });
    }

    async nativeShare(data) {
        if (!navigator.share) {
            console.warn('[Social] Native share API not available');
            return;
        }
        
        try {
            await navigator.share({
                title: data.title,
                text: data.description || data.text,
                url: data.url
            });
            
            // Track share
            if (window.AerotechAnalytics) {
                window.AerotechAnalytics.track('social_share', {
                    platform: 'native',
                    url: data.url,
                    title: data.title
                });
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('[Social] Share failed:', error);
            }
        }
    }

    async copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                this.showNotification('Ссылка скопирована в буфер обмена');
                
                // Track copy
                if (window.AerotechAnalytics) {
                    window.AerotechAnalytics.track('link_copied', { url: text });
                }
            } catch (error) {
                console.error('[Social] Copy failed:', error);
                this.fallbackCopyToClipboard(text);
            }
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('Ссылка скопирована в буфер обмена');
        } catch (error) {
            console.error('[Social] Fallback copy failed:', error);
            this.showNotification('Не удалось скопировать ссылку', 'error');
        }
        
        document.body.removeChild(textarea);
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `social-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    createFloatingShareButtons() {
        const floating = document.createElement('div');
        floating.className = 'floating-share-buttons';
        floating.innerHTML = `
            <button class="floating-share-trigger" aria-label="Открыть меню шаринга">
                ${this.getShareIcon()}
            </button>
            <div class="floating-share-menu">
                ${['telegram', 'vk', 'twitter', 'facebook'].map(platform => {
                    const config = this.platforms[platform];
                    return `
                        <button class="floating-share-item" data-platform="${platform}" 
                                style="--platform-color: ${config.color}"
                                aria-label="Поделиться в ${config.name}">
                            ${config.icon}
                        </button>
                    `;
                }).join('')}
            </div>
        `;
        
        document.body.appendChild(floating);
        
        const trigger = floating.querySelector('.floating-share-trigger');
        const menu = floating.querySelector('.floating-share-menu');
        
        trigger.addEventListener('click', () => {
            floating.classList.toggle('active');
        });
        
        floating.querySelectorAll('.floating-share-item').forEach((button) => {
            button.addEventListener('click', () => {
                const platform = button.dataset.platform;
                this.share(platform, {
                    title: document.title,
                    url: window.location.href,
                    description: document.querySelector('meta[name="description"]')?.content || ''
                });
                floating.classList.remove('active');
            });
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!floating.contains(e.target)) {
                floating.classList.remove('active');
            }
        });
    }

    shouldShowFloatingShare() {
        // Show floating share on longer pages
        return document.body.scrollHeight > window.innerHeight * 2;
    }

    updateSocialMetaTags() {
        // Ensure proper Open Graph and Twitter Card tags
        const metas = {
            'og:type': 'website',
            'og:url': window.location.href,
            'og:title': document.title,
            'og:description': document.querySelector('meta[name="description"]')?.content || '',
            'og:image': this.getDefaultShareImage(),
            'twitter:card': 'summary_large_image',
            'twitter:url': window.location.href,
            'twitter:title': document.title,
            'twitter:description': document.querySelector('meta[name="description"]')?.content || '',
            'twitter:image': this.getDefaultShareImage()
        };
        
        Object.entries(metas).forEach(([property, content]) => {
            if (!content) return;
            
            let meta = document.querySelector(`meta[property="${property}"]`) ||
                      document.querySelector(`meta[name="${property}"]`);
            
            if (!meta) {
                meta = document.createElement('meta');
                if (property.startsWith('og:')) {
                    meta.setAttribute('property', property);
                } else {
                    meta.setAttribute('name', property);
                }
                document.head.appendChild(meta);
            }
            
            meta.setAttribute('content', content);
        });
    }

    getDefaultShareImage() {
        // Try to find a suitable image
        const ogImage = document.querySelector('meta[property="og:image"]')?.content;
        if (ogImage) return ogImage;
        
        const firstImage = document.querySelector('img[src]')?.src;
        if (firstImage && firstImage.startsWith('http')) return firstImage;
        
        return window.location.origin + '/images/k1-drone-MAINVIEW.jpg';
    }

    trackSocialShares() {
        // Track when users come from social media
        const referrer = document.referrer.toLowerCase();
        const socialSources = ['facebook.com', 'twitter.com', 't.me', 'vk.com', 'linkedin.com'];
        
        const source = socialSources.find(s => referrer.includes(s));
        
        if (source && window.AerotechAnalytics) {
            window.AerotechAnalytics.track('social_referral', {
                source: source,
                referrer: document.referrer
            });
        }
    }

    // SVG Icons
    getTelegramIcon() {
        return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.099.154.232.17.326.016.094.036.307.02.474z"/></svg>`;
    }

    getVKIcon() {
        return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.066 14.122c.48.48 1.003 1.003 1.387 1.554.169.242.329.496.44.784.157.406.014.853-.322.877h-2.103c-.546.045-1.003-.157-1.376-.53-.298-.298-.574-.619-.862-.918-.119-.119-.242-.227-.384-.313-.377-.228-.706-.146-.92.073-.218.224-.268.513-.291.807-.028.413-.128.521-.54.543-.873.045-1.704-.067-2.492-.495-.693-.373-1.234-.914-1.704-1.524-.916-1.186-1.623-2.505-2.244-3.88-.146-.325-.041-.495.312-.502.582-.014 1.164-.014 1.746 0 .236.007.39.145.488.364.347.771.748 1.508 1.234 2.186.134.186.273.373.467.495.214.134.38.079.48-.156.059-.134.087-.28.1-.425.046-.539.052-1.078-.014-1.617-.041-.337-.201-.556-.532-.623-.169-.034-.145-.101-.063-.203.141-.169.273-.273.536-.273h1.974c.311.063.38.203.423.515l.002 2.199c-.003.119.059.471.273.549.171.05.285-.079.387-.186.466-.488.799-1.065 1.107-1.657.137-.257.257-.527.37-.797.083-.198.214-.296.44-.289l2.267.003c.067 0 .135 0 .199.014.385.064.491.227.369.602-.207.633-.596 1.164-.985 1.688-.411.554-.851 1.092-1.264 1.654-.37.506-.337.759.125 1.197z"/></svg>`;
    }

    getTwitterIcon() {
        return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>`;
    }

    getFacebookIcon() {
        return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
    }

    getWhatsAppIcon() {
        return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;
    }

    getLinkedInIcon() {
        return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
    }

    getEmailIcon() {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
    }

    getShareIcon() {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`;
    }

    getCopyIcon() {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    }

    getCheckIcon() {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    }
}

// Initialize social media manager
window.addEventListener('DOMContentLoaded', () => {
    window.AerotechSocial = new SocialMediaManager();
});

// Add social sharing styles
const socialStyles = document.createElement('style');
socialStyles.textContent = `
    .social-share-container {
        display: flex;
        align-items: center;
        gap: 16px;
        margin: 24px 0;
        padding: 16px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
    }
    
    .share-label {
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        font-weight: 600;
        color: #b0b0b0;
    }
    
    .share-buttons {
        display: flex;
        gap: 8px;
    }
    
    .share-button {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        color: var(--platform-color, #00c0c0);
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .share-button svg {
        width: 20px;
        height: 20px;
    }
    
    .share-button:hover {
        background: var(--platform-color, #00c0c0);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 192, 192, 0.3);
    }
    
    .share-button.copied {
        background: #00c851;
        color: white;
    }
    
    .floating-share-buttons {
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 9990;
    }
    
    .floating-share-trigger {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #00c0c0, #00a0a0);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0, 192, 192, 0.4);
        transition: all 0.3s;
    }
    
    .floating-share-trigger svg {
        width: 24px;
        height: 24px;
    }
    
    .floating-share-trigger:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(0, 192, 192, 0.5);
    }
    
    .floating-share-menu {
        position: absolute;
        bottom: 70px;
        right: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: all 0.3s;
    }
    
    .floating-share-buttons.active .floating-share-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    .floating-share-item {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--platform-color);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.3s;
    }
    
    .floating-share-item svg {
        width: 24px;
        height: 24px;
    }
    
    .floating-share-item:hover {
        transform: scale(1.1);
    }
    
    .social-notification {
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 10001;
        padding: 16px 24px;
        background: rgba(15, 15, 15, 0.98);
        border: 1px solid #00c0c0;
        border-radius: 8px;
        color: white;
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 20px rgba(0, 192, 192, 0.3);
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s;
    }
    
    .social-notification.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .social-notification.error {
        border-color: #ff4444;
    }
    
    @media (max-width: 768px) {
        .social-share-container {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .floating-share-buttons {
            bottom: 70px;
            right: 10px;
        }
        
        .social-notification {
            left: 10px;
            right: 10px;
        }
        
        .social-notification.show {
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(socialStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocialMediaManager;
}
