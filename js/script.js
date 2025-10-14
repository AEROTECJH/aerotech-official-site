// Утилиты
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Feature flags — временные скрытия (легко откатить, поменяв true -> false)
const FeatureFlags = {
    hideArlistBranding: true, // скрыть подпись «Является частью концерна ARLIST TECH»
    hidePages: {
        arlist: true,
        synergia: true,
        asa: true,
    },
    hideCustomersMentions: true // скрыть упоминания заказчиков/инвесторов
};

function applyFeatureFlags() {
    try {
        // Перенаправление со скрытых страниц
        const path = (location.pathname || '').toLowerCase();
        if (FeatureFlags.hidePages.arlist && path.endsWith('/arlist-tech.html')) {
            location.replace('workinprogress.html');
            return;
        }
        if (FeatureFlags.hidePages.synergia && path.endsWith('/synergia.html')) {
            location.replace('workinprogress.html');
            return;
        }
        if (FeatureFlags.hidePages.asa && path.endsWith('/asa.html')) {
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
        if (FeatureFlags.hidePages.arlist) hideHrefParts.push('arlist-tech.html');
        if (FeatureFlags.hidePages.synergia) hideHrefParts.push('synergia.html');
        if (FeatureFlags.hidePages.asa) hideHrefParts.push('asa.html');
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

            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.x -= (dx / distance) * force * 0.3;
                particle.y -= (dy / distance) * force * 0.3;
            }
        });

        // Draw connections
        this.ctx.strokeStyle = 'rgba(0, 192, 192, 0.1)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const opacity = (150 - distance) / 150 * 0.1;
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

class PageLoader {
    constructor() {
        // Определяем мобильную версию сразу
        this.isMobile = window.matchMedia('(max-width: 960px)').matches;
        this.loader = $('#page-loader');
        this.minDisplay = 0; // на десктопе убираем по факту загрузки, без таймеров
        this.isHidden = false;
        this.startTime = performance.now();

        // На мобильных: никакого прелоадера
        if (this.isMobile) {
            if (this.loader) {
                this.loader.remove();
                this.loader = null;
            }
            document.body.classList.remove('is-loading');
            return;
        }

        this.ensureLoader();

        // Десктоп: включаем лоадер и ждём полной загрузки страницы
        document.body.classList.add('is-loading');

        this.loader.setAttribute('aria-hidden', 'false');
        // Скрываем только после события полной загрузки окна
        window.addEventListener('load', () => this.handleLoaded());

        if (document.readyState === 'complete') {
            this.handleLoaded();
        }
    }

    ensureLoader() {
        if (this.loader) {
            return;
        }

        const loader = document.createElement('div');
        loader.className = 'page-loader';
        loader.id = 'page-loader';
        loader.setAttribute('role', 'status');
        loader.setAttribute('aria-live', 'polite');

        const inner = document.createElement('div');
        inner.className = 'page-loader__inner';

        const logo = document.createElement('div');
        logo.className = 'loader-logo';
        logo.setAttribute('aria-label', 'AEROTECH');

        const logoText = document.createElement('span');
        logoText.className = 'loader-logo__text';
        logoText.textContent = 'AEROTECH';

        const logoCaption = document.createElement('span');
        logoCaption.className = 'loader-logo__caption';
        logoCaption.textContent = 'Является частью концерна ARLIST TECH';

        const ring = document.createElement('div');
        ring.className = 'loader-ring';
        ring.setAttribute('aria-hidden', 'true');

        const status = document.createElement('p');
        status.className = 'loader-status';
        status.setAttribute('role', 'presentation');
        status.textContent = 'Загрузка…';

        logo.appendChild(logoText);
        logo.appendChild(logoCaption);

        inner.appendChild(logo);
        inner.appendChild(ring);
        inner.appendChild(status);
        loader.appendChild(inner);

        document.body.prepend(loader);
        this.loader = loader;
    }

    handleLoaded() {
        // Сразу скрываем после полной загрузки окна (без ожидания по времени)
        this.hide();
    }

    hide(immediate = false) {
        if (this.isHidden) return;
        this.isHidden = true;

        document.body.classList.remove('is-loading');

        if (this.loader) {
            this.loader.setAttribute('aria-hidden', 'true');
            if (immediate) {
                this.loader.remove();
                this.loader = null;
                return;
            }
            this.loader.classList.add('page-loader--hidden');

            const cleanup = () => {
                if (this.loader) {
                    this.loader.remove();
                    this.loader = null;
                }
            };

            this.loader.addEventListener('transitionend', cleanup, { once: true });
            setTimeout(cleanup, 800);
        }
    }
}

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
        // Скрытие/показ навигации при скролле
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            if (document.body.classList.contains('nav-open')) return;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > lastScrollTop && scrollTop > 150) {
                this.nav.style.transform = 'translateY(-100%)';
            } else {
                this.nav.style.transform = 'translateY(0)';
            }

            lastScrollTop = scrollTop;
        });

        // Активная ссылка при скролле
    const sections = $$('section[id]');
    const navLinks = $$('.nav-menu a[href^="#"]');

        window.addEventListener('scroll', () => {
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
        });

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

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
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
    const animatedElements = $$('.feature-highlight, .contact-item, .team-card, .gallery-item, .tech-item, .faq-item, .project-item, .synergia-card, .synergia-card-compact, .arlist-panel, .arlist-focus-card, .arlist-highlight-card, .arlist-synergy-step, .arlist-contact-card, .advantage-card');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 1s ease, transform 1s ease';
            observer.observe(element);
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

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Применяем фичефлаги до инициализации UI
    applyFeatureFlags();
    // Прелоадер
    new PageLoader();

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

    // Sticky CTA наблюдатель
    new StickyObserver();

    // Лайтбокс для галереи
    new Lightbox();

    // Форма обратной связи
    new ContactForm();
});
