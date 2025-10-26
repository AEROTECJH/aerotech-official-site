/**
 * AEROTECH Lazy Loading & Image Optimization System
 * Improves performance by lazy loading images and optimizing media
 */

class LazyLoadManager {
    constructor() {
        this.images = [];
        this.videos = [];
        this.iframes = [];
        this.observer = null;
        this.options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.01
        };
        this.init();
    }

    init() {
        // Check for native lazy loading support
        if ('loading' in HTMLImageElement.prototype) {
            this.useNativeLazyLoad();
        } else {
            this.useIntersectionObserver();
        }
        
        // Optimize existing images
        this.optimizeImages();
        
        // Setup responsive images
        this.setupResponsiveImages();
        
        // Setup video lazy loading
        this.setupVideoLazyLoad();
        
        // Setup iframe lazy loading
        this.setupIframeLazyLoad();
        
        // Preload critical images
        this.preloadCriticalImages();
        
        // Monitor new images added to DOM
        this.monitorDOMChanges();
    }

    useNativeLazyLoad() {
        console.log('[LazyLoad] Using native lazy loading');
        
        document.querySelectorAll('img[data-src]').forEach((img) => {
            img.src = img.dataset.src;
            img.loading = 'lazy';
            
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }
        });
    }

    useIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            console.warn('[LazyLoad] IntersectionObserver not supported, loading all images');
            this.loadAllImages();
            return;
        }
        
        console.log('[LazyLoad] Using IntersectionObserver');
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.loadElement(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, this.options);
        
        // Observe images
        document.querySelectorAll('img[data-src]').forEach((img) => {
            this.observer.observe(img);
        });
    }

    loadElement(element) {
        if (element.tagName === 'IMG') {
            this.loadImage(element);
        } else if (element.tagName === 'VIDEO') {
            this.loadVideo(element);
        } else if (element.tagName === 'IFRAME') {
            this.loadIframe(element);
        }
    }

    loadImage(img) {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        
        if (!src) return;
        
        // Create a new image to preload
        const tempImg = new Image();
        
        tempImg.onload = () => {
            img.src = src;
            
            if (srcset) {
                img.srcset = srcset;
            }
            
            img.classList.add('lazy-loaded');
            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
            
            // Track successful load
            if (window.AerotechAnalytics) {
                window.AerotechAnalytics.track('image_lazy_loaded', {
                    src: src
                });
            }
        };
        
        tempImg.onerror = () => {
            console.error('[LazyLoad] Failed to load image:', src);
            img.classList.add('lazy-error');
            
            // Show placeholder
            img.alt = 'Не удалось загрузить изображение';
        };
        
        tempImg.src = src;
        if (srcset) {
            tempImg.srcset = srcset;
        }
    }

    loadVideo(video) {
        const sources = video.querySelectorAll('source[data-src]');
        
        sources.forEach((source) => {
            source.src = source.dataset.src;
            source.removeAttribute('data-src');
        });
        
        video.load();
        video.classList.add('lazy-loaded');
    }

    loadIframe(iframe) {
        const src = iframe.dataset.src;
        
        if (!src) return;
        
        iframe.src = src;
        iframe.classList.add('lazy-loaded');
        iframe.removeAttribute('data-src');
    }

    loadAllImages() {
        document.querySelectorAll('img[data-src]').forEach((img) => {
            this.loadImage(img);
        });
    }

    optimizeImages() {
        document.querySelectorAll('img').forEach((img) => {
            // Add decoding hint
            if (!img.hasAttribute('decoding')) {
                img.decoding = 'async';
            }
            
            // Ensure alt text
            if (!img.alt && !img.hasAttribute('aria-hidden')) {
                img.alt = '';
                console.warn('[LazyLoad] Image missing alt text:', img.src);
            }
            
            // Add dimensions if missing (prevents layout shift)
            if (!img.width || !img.height) {
                if (img.naturalWidth && img.naturalHeight) {
                    img.setAttribute('width', img.naturalWidth);
                    img.setAttribute('height', img.naturalHeight);
                }
            }
        });
    }

    setupResponsiveImages() {
        // Find images that should be responsive
        document.querySelectorAll('img:not([srcset])').forEach((img) => {
            const src = img.src || img.dataset.src;
            
            if (!src) return;
            
            // Generate srcset for different screen sizes
            const srcset = this.generateSrcSet(src);
            
            if (srcset && img.dataset.src) {
                img.dataset.srcset = srcset;
            } else if (srcset) {
                img.srcset = srcset;
            }
        });
    }

    generateSrcSet(src) {
        // This is a simplified version - in production, you'd have actual optimized images
        // For now, we just set the original image at different sizes
        const isExternal = src.startsWith('http');
        
        if (isExternal) {
            return null; // Don't generate srcset for external images
        }
        
        // Check if CDN or image service is available
        if (window.IMAGE_CDN_URL) {
            const sizes = [320, 640, 960, 1280, 1920];
            return sizes.map(size => `${window.IMAGE_CDN_URL}${src}?w=${size} ${size}w`).join(', ');
        }
        
        return null;
    }

    setupVideoLazyLoad() {
        document.querySelectorAll('video[data-src]').forEach((video) => {
            if (this.observer) {
                this.observer.observe(video);
            }
        });
        
        // Pause videos when not in viewport
        document.querySelectorAll('video').forEach((video) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting && !video.paused) {
                        video.pause();
                    }
                });
            }, { threshold: 0.25 });
            
            observer.observe(video);
        });
    }

    setupIframeLazyLoad() {
        document.querySelectorAll('iframe[data-src]').forEach((iframe) => {
            if (this.observer) {
                this.observer.observe(iframe);
            }
        });
    }

    preloadCriticalImages() {
        // Preload hero images and other critical content
        document.querySelectorAll('[data-preload]').forEach((element) => {
            if (element.tagName === 'IMG') {
                const src = element.dataset.src || element.src;
                if (src) {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.as = 'image';
                    link.href = src;
                    document.head.appendChild(link);
                }
            }
        });
    }

    monitorDOMChanges() {
        if (!('MutationObserver' in window)) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if it's an image
                        if (node.tagName === 'IMG' && node.dataset.src) {
                            if (this.observer) {
                                this.observer.observe(node);
                            }
                        }
                        
                        // Check child images
                        const images = node.querySelectorAll?.('img[data-src]');
                        images?.forEach((img) => {
                            if (this.observer) {
                                this.observer.observe(img);
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Public API
    load(element) {
        this.loadElement(element);
    }

    loadAll() {
        this.loadAllImages();
    }
}

/**
 * Image Optimizer - Provides additional image optimization utilities
 */
class ImageOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Convert images to WebP if supported
        this.setupWebPSupport();
        
        // Setup blur-up technique for images
        this.setupBlurUp();
        
        // Setup progressive image loading
        this.setupProgressiveLoading();
    }

    setupWebPSupport() {
        // Check WebP support
        const webpSupported = this.checkWebPSupport();
        
        if (webpSupported) {
            document.documentElement.classList.add('webp');
            
            // Update image sources to WebP if available
            document.querySelectorAll('img[data-webp]').forEach((img) => {
                const webpSrc = img.dataset.webp;
                if (webpSrc) {
                    if (img.dataset.src) {
                        img.dataset.src = webpSrc;
                    } else {
                        img.src = webpSrc;
                    }
                }
            });
        } else {
            document.documentElement.classList.add('no-webp');
        }
    }

    checkWebPSupport() {
        const canvas = document.createElement('canvas');
        
        if (!!(canvas.getContext && canvas.getContext('2d'))) {
            return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        
        return false;
    }

    setupBlurUp() {
        // Apply blur-up technique to images with data-blur attribute
        document.querySelectorAll('img[data-blur]').forEach((img) => {
            const blurSrc = img.dataset.blur;
            
            if (!blurSrc) return;
            
            // Create blurred placeholder
            const placeholder = new Image();
            placeholder.src = blurSrc;
            placeholder.classList.add('blur-placeholder');
            
            // Replace with high-res once loaded
            const highRes = new Image();
            const finalSrc = img.dataset.src || img.src;
            
            highRes.onload = () => {
                img.src = finalSrc;
                img.classList.add('blur-loaded');
                
                // Remove placeholder after transition
                setTimeout(() => {
                    placeholder.remove();
                }, 400);
            };
            
            highRes.src = finalSrc;
            
            // Insert placeholder
            img.parentNode.insertBefore(placeholder, img);
        });
    }

    setupProgressiveLoading() {
        // Setup progressive JPEG loading simulation
        document.querySelectorAll('img[data-progressive]').forEach((img) => {
            img.classList.add('progressive-image');
            
            img.addEventListener('load', () => {
                img.classList.add('progressive-loaded');
            });
        });
    }

    // Utility: Generate blur placeholder from image
    async generateBlurPlaceholder(img) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const width = 40;
            const height = (width / img.width) * img.height;
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.filter = 'blur(10px)';
            ctx.drawImage(img, 0, 0, width, height);
            
            resolve(canvas.toDataURL());
        });
    }
}

// Initialize lazy loading
window.addEventListener('DOMContentLoaded', () => {
    window.AerotechLazyLoad = new LazyLoadManager();
    window.AerotechImageOptimizer = new ImageOptimizer();
});

// Add lazy load styles
const lazyStyles = document.createElement('style');
lazyStyles.textContent = `
    img[data-src] {
        opacity: 0;
        transition: opacity 0.4s ease-in-out;
    }
    
    img.lazy-loaded {
        opacity: 1;
    }
    
    img.lazy-error {
        opacity: 0.5;
        border: 2px dashed #ff4444;
    }
    
    .blur-placeholder {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: blur(20px);
        transform: scale(1.1);
        opacity: 1;
        transition: opacity 0.4s ease-out;
    }
    
    img.blur-loaded + .blur-placeholder {
        opacity: 0;
    }
    
    .progressive-image {
        background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
        animation: progressive-pulse 1.5s ease-in-out infinite;
    }
    
    .progressive-image.progressive-loaded {
        animation: none;
        background: none;
    }
    
    @keyframes progressive-pulse {
        0%, 100% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
    }
    
    /* Aspect ratio boxes to prevent layout shift */
    .aspect-ratio-box {
        position: relative;
        overflow: hidden;
    }
    
    .aspect-ratio-box::before {
        content: '';
        display: block;
        padding-top: var(--aspect-ratio, 56.25%); /* 16:9 default */
    }
    
    .aspect-ratio-box > img,
    .aspect-ratio-box > video,
    .aspect-ratio-box > iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;
document.head.appendChild(lazyStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LazyLoadManager, ImageOptimizer };
}
