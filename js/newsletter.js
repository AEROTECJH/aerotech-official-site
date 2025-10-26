/**
 * AEROTECH Newsletter Subscription System
 * Manages email subscriptions and newsletter functionality
 */

class NewsletterManager {
    constructor() {
        this.subscribers = [];
        this.apiEndpoint = window.NEWSLETTER_API || null;
        this.init();
    }

    init() {
        // Create newsletter subscription forms
        this.createNewsletterForms();
        
        // Create popup subscription
        this.createPopupSubscription();
        
        // Setup exit intent
        this.setupExitIntent();
        
        // Load saved subscription status
        this.loadSubscriptionStatus();
    }

    createNewsletterForms() {
        // Find all newsletter form containers
        document.querySelectorAll('[data-newsletter-form]').forEach((container) => {
            const form = this.createSubscriptionForm();
            container.appendChild(form);
        });
        
        // Add newsletter section to footer if not exists
        if (!document.querySelector('.newsletter-section')) {
            this.addNewsletterToFooter();
        }
    }

    createSubscriptionForm(compact = false) {
        const form = document.createElement('form');
        form.className = compact ? 'newsletter-form newsletter-compact' : 'newsletter-form';
        form.innerHTML = `
            <div class="newsletter-content">
                ${!compact ? `
                    <h3 class="newsletter-title">Подпишитесь на рассылку</h3>
                    <p class="newsletter-description">
                        Получайте новости о разработках, эксклюзивный контент и специальные предложения
                    </p>
                ` : ''}
                <div class="newsletter-input-group">
                    <input 
                        type="email" 
                        name="email" 
                        class="newsletter-input" 
                        placeholder="Ваш email"
                        required
                        autocomplete="email"
                    >
                    <button type="submit" class="newsletter-submit">
                        ${compact ? 'Подписаться' : 'Подписаться на рассылку'}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
                <div class="newsletter-message"></div>
                ${!compact ? `
                    <p class="newsletter-privacy">
                        Отправляя форму, вы соглашаетесь с 
                        <a href="/privacy.html" target="_blank">политикой конфиденциальности</a>
                    </p>
                ` : ''}
            </div>
        `;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubscription(form);
        });
        
        return form;
    }

    async handleSubscription(form) {
        const email = form.querySelector('input[name="email"]').value;
        const messageEl = form.querySelector('.newsletter-message');
        const submitBtn = form.querySelector('.newsletter-submit');
        
        // Validate email
        if (!this.validateEmail(email)) {
            this.showMessage(messageEl, 'Пожалуйста, введите корректный email адрес', 'error');
            return;
        }
        
        // Check if already subscribed
        if (this.isSubscribed(email)) {
            this.showMessage(messageEl, 'Вы уже подписаны на рассылку', 'info');
            return;
        }
        
        // Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Подписываем...';
        
        try {
            // Send to API
            const success = await this.subscribe(email);
            
            if (success) {
                this.showMessage(messageEl, 'Спасибо за подписку! Проверьте вашу почту для подтверждения.', 'success');
                form.reset();
                
                // Save subscription
                this.saveSubscription(email);
                
                // Track subscription
                if (window.AerotechAnalytics) {
                    window.AerotechAnalytics.track('newsletter_subscribed', {
                        email: email
                    });
                }
                
                // Hide popup if subscribed from there
                const popup = document.querySelector('.newsletter-popup');
                if (popup && popup.contains(form)) {
                    setTimeout(() => {
                        popup.classList.remove('show');
                    }, 2000);
                }
            } else {
                this.showMessage(messageEl, 'Произошла ошибка. Попробуйте позже.', 'error');
            }
        } catch (error) {
            console.error('[Newsletter] Subscription error:', error);
            this.showMessage(messageEl, 'Произошла ошибка. Попробуйте позже.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                Подписаться на рассылку
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            `;
        }
    }

    async subscribe(email) {
        if (this.apiEndpoint) {
            // Send to real API
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            });
            
            return response.ok;
        } else {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            return true;
        }
    }

    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    isSubscribed(email) {
        const subscriptions = JSON.parse(localStorage.getItem('aerotech_subscriptions') || '[]');
        return subscriptions.includes(email);
    }

    saveSubscription(email) {
        const subscriptions = JSON.parse(localStorage.getItem('aerotech_subscriptions') || '[]');
        if (!subscriptions.includes(email)) {
            subscriptions.push(email);
            localStorage.setItem('aerotech_subscriptions', JSON.stringify(subscriptions));
        }
    }

    loadSubscriptionStatus() {
        const subscriptions = JSON.parse(localStorage.getItem('aerotech_subscriptions') || '[]');
        if (subscriptions.length > 0) {
            console.log('[Newsletter] User has active subscriptions');
        }
    }

    showMessage(element, message, type) {
        element.textContent = message;
        element.className = `newsletter-message ${type}`;
        
        setTimeout(() => {
            element.className = 'newsletter-message';
        }, 5000);
    }

    createPopupSubscription() {
        // Don't show if already subscribed
        const subscriptions = JSON.parse(localStorage.getItem('aerotech_subscriptions') || '[]');
        if (subscriptions.length > 0) {
            return;
        }
        
        // Don't show if dismissed recently
        const dismissed = localStorage.getItem('newsletter_popup_dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) {
                return; // Don't show for 7 days after dismissal
            }
        }
        
        const popup = document.createElement('div');
        popup.className = 'newsletter-popup';
        popup.innerHTML = `
            <div class="newsletter-popup-content">
                <button class="newsletter-popup-close" aria-label="Закрыть">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div class="newsletter-popup-icon">📬</div>
                <h3 class="newsletter-popup-title">Будьте в курсе новинок AEROTECH</h3>
                <p class="newsletter-popup-text">
                    Получайте эксклюзивные обновления о новых разработках, технологиях и специальных предложениях
                </p>
                <div class="newsletter-popup-form"></div>
            </div>
            <div class="newsletter-popup-overlay"></div>
        `;
        
        document.body.appendChild(popup);
        
        // Add form
        const formContainer = popup.querySelector('.newsletter-popup-form');
        const form = this.createSubscriptionForm(true);
        formContainer.appendChild(form);
        
        // Setup close button
        const closeBtn = popup.querySelector('.newsletter-popup-close');
        const overlay = popup.querySelector('.newsletter-popup-overlay');
        
        const closePopup = () => {
            popup.classList.remove('show');
            localStorage.setItem('newsletter_popup_dismissed', Date.now().toString());
            
            if (window.AerotechAnalytics) {
                window.AerotechAnalytics.track('newsletter_popup_dismissed');
            }
        };
        
        closeBtn.addEventListener('click', closePopup);
        overlay.addEventListener('click', closePopup);
        
        // Show popup after delay (don't annoy immediately)
        setTimeout(() => {
            popup.classList.add('show');
            
            if (window.AerotechAnalytics) {
                window.AerotechAnalytics.track('newsletter_popup_shown');
            }
        }, 30000); // Show after 30 seconds
    }

    setupExitIntent() {
        // Track exit intent
        let exitIntentShown = false;
        
        document.addEventListener('mouseout', (e) => {
            if (exitIntentShown) return;
            
            // Check if mouse is leaving viewport from top
            if (e.clientY < 0) {
                const popup = document.querySelector('.newsletter-popup');
                if (popup && !popup.classList.contains('show')) {
                    const subscriptions = JSON.parse(localStorage.getItem('aerotech_subscriptions') || '[]');
                    if (subscriptions.length === 0) {
                        popup.classList.add('show');
                        exitIntentShown = true;
                        
                        if (window.AerotechAnalytics) {
                            window.AerotechAnalytics.track('newsletter_exit_intent_shown');
                        }
                    }
                }
            }
        });
    }

    addNewsletterToFooter() {
        const footer = document.querySelector('.main-footer .container');
        if (!footer) return;
        
        const newsletterSection = document.createElement('div');
        newsletterSection.className = 'newsletter-section';
        newsletterSection.innerHTML = `
            <div class="newsletter-footer-content">
                <div class="newsletter-footer-info">
                    <h3>Подпишитесь на рассылку AEROTECH</h3>
                    <p>Будьте первыми, кто узнает о новых разработках и технологиях</p>
                </div>
                <div class="newsletter-footer-form" data-newsletter-form></div>
            </div>
        `;
        
        footer.insertBefore(newsletterSection, footer.firstChild);
        
        // Add form
        const formContainer = newsletterSection.querySelector('[data-newsletter-form]');
        const form = this.createSubscriptionForm(true);
        formContainer.appendChild(form);
    }
}

// Initialize newsletter manager
window.addEventListener('DOMContentLoaded', () => {
    window.AerotechNewsletter = new NewsletterManager();
});

// Add newsletter styles
const newsletterStyles = document.createElement('style');
newsletterStyles.textContent = `
    .newsletter-form {
        width: 100%;
        max-width: 600px;
    }
    
    .newsletter-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    
    .newsletter-title {
        font-size: 24px;
        font-weight: 700;
        color: white;
        margin: 0;
    }
    
    .newsletter-description {
        font-size: 16px;
        color: #b0b0b0;
        margin: 0;
    }
    
    .newsletter-input-group {
        display: flex;
        gap: 8px;
    }
    
    .newsletter-input {
        flex: 1;
        padding: 14px 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: white;
        font-family: 'Montserrat', sans-serif;
        font-size: 16px;
        transition: all 0.3s;
    }
    
    .newsletter-input:focus {
        outline: none;
        border-color: #00c0c0;
        box-shadow: 0 0 0 3px rgba(0, 192, 192, 0.1);
    }
    
    .newsletter-submit {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 14px 24px;
        background: linear-gradient(135deg, #00c0c0, #00a0a0);
        border: none;
        border-radius: 8px;
        color: #0a0a0a;
        font-family: 'Montserrat', sans-serif;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        white-space: nowrap;
    }
    
    .newsletter-submit:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 192, 192, 0.4);
    }
    
    .newsletter-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
    
    .newsletter-message {
        padding: 12px 16px;
        border-radius: 6px;
        font-size: 14px;
        display: none;
    }
    
    .newsletter-message.success {
        display: block;
        background: rgba(0, 200, 81, 0.1);
        border: 1px solid #00c851;
        color: #00c851;
    }
    
    .newsletter-message.error {
        display: block;
        background: rgba(255, 68, 68, 0.1);
        border: 1px solid #ff4444;
        color: #ff4444;
    }
    
    .newsletter-message.info {
        display: block;
        background: rgba(0, 192, 192, 0.1);
        border: 1px solid #00c0c0;
        color: #00c0c0;
    }
    
    .newsletter-privacy {
        font-size: 12px;
        color: #666;
        margin: 0;
    }
    
    .newsletter-privacy a {
        color: #00c0c0;
        text-decoration: none;
    }
    
    .newsletter-privacy a:hover {
        text-decoration: underline;
    }
    
    .newsletter-compact {
        max-width: 100%;
    }
    
    .newsletter-compact .newsletter-input-group {
        flex-direction: row;
    }
    
    /* Newsletter popup */
    .newsletter-popup {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s;
    }
    
    .newsletter-popup.show {
        opacity: 1;
        visibility: visible;
    }
    
    .newsletter-popup-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
    }
    
    .newsletter-popup-content {
        position: relative;
        z-index: 1;
        max-width: 500px;
        width: 90%;
        background: rgba(15, 15, 15, 0.98);
        border: 1px solid #00c0c0;
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 20px 60px rgba(0, 192, 192, 0.3);
        animation: popupSlideIn 0.4s ease-out;
    }
    
    @keyframes popupSlideIn {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    .newsletter-popup-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: transparent;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
    }
    
    .newsletter-popup-close:hover {
        color: white;
    }
    
    .newsletter-popup-icon {
        font-size: 48px;
        text-align: center;
        margin-bottom: 20px;
    }
    
    .newsletter-popup-title {
        font-size: 24px;
        font-weight: 700;
        color: white;
        text-align: center;
        margin: 0 0 12px 0;
    }
    
    .newsletter-popup-text {
        font-size: 16px;
        color: #b0b0b0;
        text-align: center;
        margin: 0 0 24px 0;
    }
    
    /* Footer newsletter */
    .newsletter-section {
        margin-bottom: 40px;
        padding: 40px;
        background: rgba(0, 192, 192, 0.05);
        border: 1px solid rgba(0, 192, 192, 0.2);
        border-radius: 12px;
    }
    
    .newsletter-footer-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        align-items: center;
    }
    
    .newsletter-footer-info h3 {
        font-size: 24px;
        font-weight: 700;
        color: white;
        margin: 0 0 12px 0;
    }
    
    .newsletter-footer-info p {
        font-size: 16px;
        color: #b0b0b0;
        margin: 0;
    }
    
    @media (max-width: 768px) {
        .newsletter-input-group {
            flex-direction: column;
        }
        
        .newsletter-submit {
            width: 100%;
            justify-content: center;
        }
        
        .newsletter-footer-content {
            grid-template-columns: 1fr;
            gap: 24px;
        }
        
        .newsletter-popup-content {
            padding: 32px 24px;
        }
    }
`;
document.head.appendChild(newsletterStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsletterManager;
}
