// Утилиты
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Feature flags — временные скрытия (легко откатить, поменяв true -> false)
const FeatureFlags = {
    hideArlistBranding: false, // НЕ скрываем подпись «Является частью концерна ARLIST TECH»
    hidePages: {
        synergia: true,
    },
    hideCustomersMentions: true // скрыть упоминания заказчиков/инвесторов
};

function applyFeatureFlags() {
    try {
        // Перенаправление со скрытых страниц
        const path = (location.pathname || '').toLowerCase();
        if (FeatureFlags.hidePages.synergia && path.endsWith('/synergia.html')) {
            location.replace('workinprogress.html');
            return;
        }

        // Скрытие подписи ARLIST TECH в логотипах/прелоадере и футере
        if (FeatureFlags.hideArlistBranding) {
            $$('.logo-caption, .loader-logo__caption').forEach(el => {
                el.style.display = 'none';
            });
            $$('.arlist-signature').forEach(el => {
                el.style.display = 'none';
            });
        }

        // Скрытие ссылок на скрытые страницы по сайту (меню, карточки и т.п.)
        const hideHrefParts = [];
        if (FeatureFlags.hidePages.synergia) hideHrefParts.push('synergia.html');
        if (hideHrefParts.length) {
            $$('a[href]').forEach(a => {
                const href = (a.getAttribute('href') || '').toLowerCase();
                if (hideHrefParts.some(part => href.includes(part))) {
                    // Прячем ссылку; при необходимости прячем небольшой локальный wrapper, но не всё меню
                    const wrapper = a.closest('.project-link-wrapper, li, .arlist-panel, .k1-modularity-cta') || a;
                    a.style.display = 'none';
                    if (wrapper && wrapper !== a) {
                        // Если в wrapper остались видимые ссылки, не скрываем его
                        const visibleLinks = Array.from(wrapper.querySelectorAll('a')).filter(l => l.style.display !== 'none');
                        if (visibleLinks.length === 0) {
                            wrapper.style.display = 'none';
                        }
                    }
                }
            });
        }

        // Скрытие упоминаний «заказчиков/инвесторов» в критериях контактов
        if (FeatureFlags.hideCustomersMentions) {
            const KEYWORDS = ['заказчик', 'заказчиков', 'инвестор', 'министерства обороны', 'полиции', 'государствен', 'гос'];
            $$('.contact-criteria ul li').forEach(li => {
                const t = (li.textContent || '').toLowerCase();
                if (KEYWORDS.some(k => t.includes(k))) {
                    li.style.display = 'none';
                }
            });
        }
    } catch (e) {
        console.error('Feature flags apply error:', e);
    }
}

// Выполним сразу для раннего редиректа/скрытий
try { applyFeatureFlags(); } catch(e) {}

// Hero Canvas Animation
class HeroAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mouse = { x: 0, y: 0 };
        this.running = true;
        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        document.addEventListener('visibilitychange', () => {
            this.running = document.visibilityState !== 'hidden';
        });
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const cssW = this.canvas.offsetWidth;
        const cssH = this.canvas.offsetHeight;
        this.canvas.width = Math.floor(cssW * dpr);
        this.canvas.height = Math.floor(cssH * dpr);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        this.width = cssW;
        this.height = cssH;
    }

    createParticles() {
        this.particles = [];
        const numParticles = Math.floor((this.width * this.height) / 15000);

        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 2 + 1
            });
        }
    }

    animate() {
        if (!this.running) {
            requestAnimationFrame(() => this.animate());
            return;
        }
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Wrap around edges
            if (particle.x < 0) particle.x = this.width;
            if (particle.x > this.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.height;
            if (particle.y > this.height) particle.y = 0;

            // Mouse interaction - simplified for performance
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distanceSquared = dx * dx + dy * dy;

            if (distanceSquared < 10000) { // 100 * 100
                const distance = Math.sqrt(distanceSquared);
                const force = (100 - distance) / 100;
                particle.x -= (dx / distance) * force * 0.3;
                particle.y -= (dy / distance) * force * 0.3;
            }
        });

        // Draw connections - optimized
        this.ctx.strokeStyle = 'rgba(0, 192, 192, 0.1)';
        this.ctx.lineWidth = 1;

        const maxDistance = 150;
        const maxDistanceSquared = maxDistance * maxDistance;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distanceSquared = dx * dx + dy * dy;

                if (distanceSquared < maxDistanceSquared) {
                    const opacity = (1 - distanceSquared / maxDistanceSquared) * 0.1;
                    this.ctx.strokeStyle = `rgba(0, 192, 192, ${opacity})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }

        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.fillStyle = 'rgba(0, 192, 192, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

// PageLoader class removed - loading indicator disabled completely

// Навигация
class Navigation {
    constructor() {
        this.nav = $('.main-nav');
        this.toggle = $('.nav-toggle');
        this.menu = $('#primary-navigation');
        this.menuLinks = this.menu ? this.menu.querySelectorAll('a') : [];
        this.menuClose = this.menu ? this.menu.querySelector('.nav-menu__close') : null;
        this.navHeight = this.nav ? this.nav.offsetHeight : 80;
        this.init();
    }

    init() {
        // Скрытие/показ навигации при скролле - с throttling
        let lastScrollTop = 0;
        let ticking = false;

        const handleScroll = () => {
            if (document.body.classList.contains('nav-open')) return;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > lastScrollTop && scrollTop > 150) {
                this.nav.style.transform = 'translateY(-100%)';
            } else {
                this.nav.style.transform = 'translateY(0)';
            }

            lastScrollTop = scrollTop;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                });
                ticking = true;
            }
        }, { passive: true });

        // Активная ссылка при скролле - с throttling
    const sections = $$('section[id]');
    const navLinks = $$('.nav-menu a[href^="#"]');

        let activeCheckTicking = false;
        const checkActiveLink = () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.getBoundingClientRect().top;
                if (sectionTop <= 120) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (!href || !href.startsWith('#')) return;
                link.classList.remove('active');
                if (href === `#${current}`) {
                    link.classList.add('active');
                }
            });
            activeCheckTicking = false;
        };

        window.addEventListener('scroll', () => {
            if (!activeCheckTicking) {
                window.requestAnimationFrame(() => {
                    checkActiveLink();
                });
                activeCheckTicking = true;
            }
        }, { passive: true });

        if (this.toggle && this.menu) {
            this.toggle.addEventListener('click', () => {
                const willOpen = !document.body.classList.contains('nav-open');
                this.toggleMenu(willOpen);
            });

            this.menuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.toggleMenu(false);
                });
            });

            if (this.menuClose) {
                this.menuClose.addEventListener('click', () => this.toggleMenu(false));
            }

            window.addEventListener('resize', () => {
                if (window.innerWidth > 960) {
                    this.toggleMenu(false);
                }
            });

            document.addEventListener('keyup', (event) => {
                if (event.key === 'Escape') {
                    this.toggleMenu(false);
                }
            });
        }
    }

    toggleMenu(force) {
        if (!this.toggle || !this.menu) return;
        const shouldOpen = typeof force === 'boolean' ? force : !document.body.classList.contains('nav-open');
        if (shouldOpen) {
            document.body.classList.add('nav-open');
            this.toggle.classList.add('is-active');
            this.toggle.setAttribute('aria-expanded', 'true');
            this.toggle.setAttribute('aria-label', 'Закрыть меню');
            // Блокируем прокрутку только для страницы (если не открыт лайтбокс)
            document.body.style.overflow = 'hidden';
        } else {
            document.body.classList.remove('nav-open');
            this.toggle.classList.remove('is-active');
            this.toggle.setAttribute('aria-expanded', 'false');
            this.toggle.setAttribute('aria-label', 'Открыть меню');
            if (!document.querySelector('.lightbox-overlay.is-open')) {
                document.body.style.overflow = '';
            }
        }
    }
}

// Форма обратной связи
class ContactForm {
    constructor() {
        this.form = $('#contactForm');
        this.message = $('#formMessage');
        this.inputs = this.form ? this.form.querySelectorAll('input, textarea') : [];
        this.init();
    }

    init() {
        if (!this.form) return;
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });

        // Анимация для полей ввода
        this.inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });
        });
    }

    async submitForm() {
        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            company: formData.get('company'),
            message: formData.get('message')
        };

        // Простая валидация
        if (!data.name || !data.email || !data.message) {
            this.showMessage('Пожалуйста, заполните все обязательные поля.', 'error');
            return;
        }

        // Проверка email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showMessage('Пожалуйста, введите корректный email адрес.', 'error');
            return;
        }

        try {
            // Имитация отправки
            this.showMessage('Отправка сообщения...', 'info');
            await new Promise(resolve => setTimeout(resolve, 2000));

            this.showMessage('Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.', 'success');
            this.form.reset();

            // Сброс состояния полей
            this.inputs.forEach(input => {
                input.parentElement.classList.remove('focused');
            });

        } catch (error) {
            this.showMessage('Произошла ошибка при отправке сообщения. Попробуйте еще раз.', 'error');
        }
    }

    showMessage(text, type) {
        this.message.textContent = text;
        this.message.className = `form-message ${type}`;

        if (type !== 'info') {
            setTimeout(() => {
                this.message.className = 'form-message';
            }, 5000);
        }
    }
}

// Плавная прокрутка
class SmoothScroll {
    constructor() {
        this.navToggle = $('.nav-toggle');
        this.init();
    }

    init() {
        document.addEventListener('click', (e) => {
            // Обработка кнопки закрытия меню
            if (e.target.matches('.nav-menu__close')) {
                e.preventDefault();
                this.closeMobileNav();
                return;
            }
            if (e.target.matches('a[href^="#"]') || e.target.closest('a[href^="#"]')) {
                e.preventDefault();
                const link = e.target.matches('a[href^="#"]') ? e.target : e.target.closest('a[href^="#"]');
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    this.closeMobileNav();
                    const navHeight = $('.main-nav').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navHeight - 20;

                    // Use smooth scroll with better performance
                    const startPosition = window.pageYOffset;
                    const distance = targetPosition - startPosition;
                    const duration = 600; // Reduced from default for snappier feel
                    let start = null;

                    const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

                    const step = (timestamp) => {
                        if (!start) start = timestamp;
                        const progress = timestamp - start;
                        const percentage = Math.min(progress / duration, 1);
                        const easing = easeInOutCubic(percentage);
                        
                        window.scrollTo(0, startPosition + distance * easing);
                        
                        if (progress < duration) {
                            window.requestAnimationFrame(step);
                        }
                    };

                    window.requestAnimationFrame(step);
                }
            }
        });
    }

    closeMobileNav() {
        if (document.body.classList.contains('nav-open')) {
            document.body.classList.remove('nav-open');
            if (this.navToggle) {
                this.navToggle.classList.remove('is-active');
                this.navToggle.setAttribute('aria-expanded', 'false');
                this.navToggle.setAttribute('aria-label', 'Открыть меню');
            }
        }
    }
}

// Анимация появления элементов при скролле
class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        // Since we're using CSS animations, we only need to observe and add classes
        const sections = $$('section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Add stagger animation to children
                    const children = entry.target.querySelectorAll('.advantage-card, .application-item, .tech-item, .gallery-item, .faq-item');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('is-visible');
                        }, index * 100);
                    });
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        sections.forEach(section => {
            observer.observe(section);
        });

        // Add parallax effect to hero section
        this.addParallaxEffect();
    }

    addParallaxEffect() {
        const hero = $('#hero');
        if (!hero) return;

        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const heroContent = hero.querySelector('.hero-content');
                    const heroBackground = hero.querySelector('.hero-background');
                    
                    if (heroContent && scrolled < window.innerHeight) {
                        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
                        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
                    }
                    
                    if (heroBackground && scrolled < window.innerHeight) {
                        heroBackground.style.transform = `translateY(${scrolled * 0.3}px)`;
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
}

class StickyObserver {
    constructor() {
        this.items = $$('[data-sticky]');
        this.navHeight = $('.main-nav') ? $('.main-nav').offsetHeight : 80;
        if (!this.items.length) return;
        this.observer = new IntersectionObserver(this.handle.bind(this), {
            root: null,
            threshold: 0,
            rootMargin: `-${this.navHeight + 20}px 0px 0px 0px`
        });
        this.items.forEach(item => this.prepare(item));
    }

    prepare(item) {
        const sentinel = document.createElement('span');
        sentinel.className = 'sticky-sentinel';
        sentinel.setAttribute('aria-hidden', 'true');
        sentinel.dataset.stickyTarget = 'true';
        sentinel._stickyNode = item;
        item.parentNode.insertBefore(sentinel, item);
        this.observer.observe(sentinel);
    }

    handle(entries) {
        entries.forEach(entry => {
            const stickyNode = entry.target._stickyNode;
            if (!stickyNode) return;
            stickyNode.classList.toggle('is-stuck', entry.intersectionRatio === 0);
        });
    }
}

class Lightbox {
    constructor() {
        this.triggers = $$('[data-lightbox]');
        if (!this.triggers.length) return;
        this.build();
        this.bind();
    }

    build() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'lightbox-overlay';

        this.image = document.createElement('img');
        this.image.alt = '';

        this.closeBtn = document.createElement('button');
        this.closeBtn.className = 'lightbox-close';
        this.closeBtn.type = 'button';
        this.closeBtn.setAttribute('aria-label', 'Закрыть галерею');
        this.closeBtn.innerText = '×';

        this.overlay.appendChild(this.image);
        this.overlay.appendChild(this.closeBtn);
        document.body.appendChild(this.overlay);
    }

    bind() {
        this.triggers.forEach(trigger => {
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                const href = trigger.getAttribute('href');
                this.open(href, trigger.querySelector('img')?.alt || 'Изображение галереи');
            });
        });

        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (event) => {
            if (event.target === this.overlay) {
                this.close();
            }
        });

        document.addEventListener('keyup', (event) => {
            if (event.key === 'Escape') {
                this.close();
            }
        });
    }

    open(src, altText) {
        if (!src) return;
        this.image.src = src;
        this.image.alt = altText;
        this.overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        this.closeBtn.focus();
    }

    close() {
        this.overlay.classList.remove('is-open');
        this.image.src = '';
        if (!document.body.classList.contains('nav-open')) {
            document.body.style.overflow = '';
        }
    }
}

// Ripple effect for buttons
class RippleEffect {
    constructor() {
        this.buttons = $$('.cta-button, .btn-gradient, .btn-outline');
        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');

                button.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
}

// Smooth hover animations for cards
class CardAnimations {
    constructor() {
        this.cards = $$('.advantage-card, .application-item, .tech-item, .gallery-item');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }
}

// Animated Counter for Statistics
class AnimatedCounter {
    constructor() {
        this.stats = $$('.hero-stat-value, .achievement-number');
        this.hasAnimated = new Set();
        this.init();
    }

    init() {
        if (!this.stats.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated.has(entry.target)) {
                    this.hasAnimated.add(entry.target);
                    this.animateCounter(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.stats.forEach(stat => observer.observe(stat));
    }

    animateCounter(stat) {
        const text = stat.textContent;
        const hasPercent = text.includes('%');
        const hasPlus = text.includes('+');
        const hasCm = text.includes('см');
        const hasHours = text.includes('часа');
        
        let targetValue;
        let suffix = '';
        
        if (hasPercent) {
            targetValue = parseFloat(text);
            suffix = '%';
        } else if (hasHours) {
            targetValue = parseInt(text);
            suffix = '+ часа';
        } else if (hasCm) {
            targetValue = 1;
            suffix = ' см';
        } else if (hasPlus) {
            targetValue = parseInt(text);
            suffix = '+';
        } else {
            targetValue = parseFloat(text);
        }

        if (isNaN(targetValue)) return;

        let currentValue = 0;
        const increment = targetValue / 60;
        const duration = 1500;
        const frameTime = duration / 60;

        const updateCounter = () => {
            currentValue += increment;
            if (currentValue < targetValue) {
                if (hasPercent) {
                    stat.textContent = `${currentValue.toFixed(1)}${suffix}`;
                } else if (hasPlus || suffix === '+') {
                    stat.textContent = `${Math.floor(currentValue)}${suffix}`;
                } else {
                    stat.textContent = `${Math.floor(currentValue)}${suffix}`;
                }
                requestAnimationFrame(() => setTimeout(updateCounter, frameTime));
            } else {
                stat.textContent = text;
            }
        };

        updateCounter();
    }
}

// Parallax Effect for Sections
class ParallaxSections {
    constructor() {
        this.sections = $$('.about-section, .advantages-section, .applications-section');
        this.init();
    }

    init() {
        if (!this.sections.length) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateParallax();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    updateParallax() {
        const scrolled = window.pageYOffset;
        
        this.sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrolled;
            const sectionHeight = section.offsetHeight;
            
            // Only apply parallax when section is in viewport
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const parallaxSpeed = 0.05 * (index + 1);
                const offset = (scrolled - sectionTop + window.innerHeight) * parallaxSpeed;
                
                const background = section.querySelector('::before');
                if (background) {
                    section.style.backgroundPositionY = `${offset}px`;
                }
            }
        });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Применяем фичефлаги до инициализации UI
    applyFeatureFlags();
    // Page loader removed - no loading animation

    // Hero Canvas Animation
    const heroCanvas = $('#hero-canvas');
    if (heroCanvas) {
        new HeroAnimation(heroCanvas);
    }

    // Навигация
    new Navigation();

    // Плавная прокрутка
    new SmoothScroll();

    // Анимации при скролле
    new ScrollAnimations();

    // Ripple эффект для кнопок
    new RippleEffect();

    // Анимации карточек
    new CardAnimations();

    // Анимация счетчиков статистики
    new AnimatedCounter();

    // Параллакс для секций
    new ParallaxSections();

    // Sticky CTA наблюдатель
    new StickyObserver();

    // Лайтбокс для галереи
    new Lightbox();

    // Форма обратной связи
    new ContactForm();
});
