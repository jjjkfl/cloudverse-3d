/* ==========================================
   Cloudverse — Cinematic Main Script
   GSAP ScrollTrigger powered scroll effects
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initAtomAnimation();
    initHexagonAnimation();
    initParticleCanvas();
    initHexagonTrigger();
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initScrollProgress();

    // Initialize GSAP-powered effects when available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initGSAPScrollEffects();
    } else {
        // Fallback: basic intersection observer reveals
        initBasicScrollReveal();
        initGradientScrollText();
    }

    // Initialize carousel if elements exist
    if (document.getElementById('archStage')) {
        initProductCarousel();
    }
});

// ---- Custom Cursor Effect ----
document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
    document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
});

// ---- Scroll Progress Bar ----
function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = (scrollTop / docHeight) * 100;
                bar.style.width = progress + '%';
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ---- Lottie Atom Animation ----
function initAtomAnimation() {
    const container = document.getElementById('atomAnim');
    if (!container || typeof lottie === 'undefined') return;

    lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'atom.json'
    });
}

// ---- Lottie Hexagon Animation ----
function initHexagonAnimation() {
    const container = document.getElementById('lottieHexagon');
    if (!container || typeof lottie === 'undefined') return;

    lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'hexagon.json'
    });
}

// ---- Reactive Particle Canvas ----
function initParticleCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let dots = [];
    const spacing = 35;
    const mouse = { x: -1000, y: -1000 };

    function resize() {
        const section = canvas.parentElement;
        canvas.width = section.offsetWidth;
        canvas.height = section.offsetHeight;
        dots = [];
        for (let x = 0; x < canvas.width; x += spacing) {
            for (let y = 0; y < canvas.height; y += spacing) {
                dots.push({ x, y, baseX: x, baseY: y });
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dots.forEach(dot => {
            const dx = mouse.x - dot.x;
            const dy = mouse.y - dot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 200;
            const force = Math.max(0, (maxDist - dist) / maxDist);

            const targetX = dot.baseX - dx * force * 0.2;
            const targetY = dot.baseY - dy * force * 0.2;
            dot.x += (targetX - dot.x) * 0.1;
            dot.y += (targetY - dot.y) * 0.1;

            const opacity = 0.1 + force * 0.3;

            ctx.fillStyle = `rgba(1, 184, 253, ${opacity})`;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }

    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
        dots.forEach(dot => {
            dot.x = dot.baseX;
            dot.y = dot.baseY;
        });
    });

    window.addEventListener('resize', resize);
    resize();
    draw();
}

// ---- Hexagon Button → Form Reveal ----
function initHexagonTrigger() {
    const trigger = document.getElementById('hexagonTrigger');
    const wrapper = document.getElementById('ctaWrapper');
    const backBtn = document.getElementById('formBack');

    if (trigger && wrapper) {
        trigger.addEventListener('click', () => {
            wrapper.classList.add('scrolled');
            window.scrollTo({
                top: document.querySelector('.cta-section').offsetTop,
                behavior: 'smooth'
            });
        });
    }

    if (backBtn && wrapper) {
        backBtn.addEventListener('click', () => {
            wrapper.classList.remove('scrolled');
        });
    }
}

// ---- Smooth Scroll ----
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }
        });
    });
}

// ========================================
// GSAP CINEMATIC SCROLL EFFECTS
// ========================================
function initGSAPScrollEffects() {
    // Set defaults
    gsap.defaults({ ease: 'power3.out' });

    // ----- Hero Section: Parallax Depth -----
    const heroGlows = document.querySelectorAll('.hero-glow');
    heroGlows.forEach((glow, i) => {
        gsap.to(glow, {
            y: 200 + i * 60,
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5
            }
        });
    });

    // Hero content fade up on page load & parallax on scroll
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        gsap.to(heroContent, {
            y: -80,
            opacity: 0.3,
            scale: 0.95,
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            }
        });
    }

    // Hero atom parallax
    const atomWrapper = document.querySelector('.hero-atom-wrapper');
    if (atomWrapper) {
        gsap.to(atomWrapper, {
            y: -120,
            rotation: 10,
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5
            }
        });
    }

    // ----- Approach Section: Text Reveal -----
    const gradientText = document.getElementById('gradientScrollText');
    if (gradientText) {
        const words = gradientText.querySelectorAll('span');

        gsap.fromTo(words, {
            color: 'rgba(255, 255, 255, 0.1)',
            textShadow: 'none'
        }, {
            color: 'rgba(255, 255, 255, 0.95)',
            textShadow: '0 0 15px rgba(1, 184, 253, 0.4)',
            stagger: 0.03,
            scrollTrigger: {
                trigger: gradientText,
                start: 'top 80%',
                end: 'bottom 40%',
                scrub: 1
            }
        });
    }

    // Approach section title slide in
    const approachTitle = document.querySelector('.approach-section .split-left');
    if (approachTitle) {
        gsap.from(approachTitle, {
            x: -100,
            opacity: 0,
            duration: 1.2,
            scrollTrigger: {
                trigger: '.approach-section',
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    // ----- Pillar Cards: 3D Stagger Reveal -----
    const pillarCards = document.querySelectorAll('.pillar-card');
    if (pillarCards.length) {
        gsap.from(pillarCards, {
            y: 100,
            opacity: 0,
            scale: 0.85,
            rotateX: 15,
            filter: 'blur(8px)',
            stagger: 0.12,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.pillars-section',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    // ----- Service Feature Blocks: Cinematic Alternating Slide -----
    const featureBlocks = document.querySelectorAll('.feature-block');
    featureBlocks.forEach((block, i) => {
        const isReverse = block.classList.contains('feature-block-reverse');
        const content = block.querySelector('.feature-content');
        const visual = block.querySelector('.feature-visual');
        const number = block.querySelector('.feature-number');

        // Fade in the number
        if (number) {
            gsap.from(number, {
                scale: 0.5,
                opacity: 0,
                duration: 1.2,
                scrollTrigger: {
                    trigger: block,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        }

        // Content slides in from the side
        if (content) {
            gsap.from(content, {
                x: isReverse ? 120 : -120,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: block,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            });
        }

        // Visual slides in from the opposite side with slight rotation
        if (visual) {
            gsap.from(visual, {
                x: isReverse ? -120 : 120,
                opacity: 0,
                rotateY: isReverse ? 10 : -10,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: block,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
    });

    // ----- Section Headers: Scale-up reveal -----
    document.querySelectorAll('.section-header').forEach(header => {
        gsap.from(header, {
            y: 60,
            opacity: 0,
            scale: 0.92,
            filter: 'blur(6px)',
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: header,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // ----- Products Section: Entrance -----
    const productsSection = document.querySelector('#products');
    if (productsSection) {
        const archScene = productsSection.querySelector('.arch-scene');
        if (archScene) {
            gsap.from(archScene, {
                y: 80,
                opacity: 0,
                scale: 0.9,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: productsSection,
                    start: 'top 70%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
    }

    // ----- Process Timeline: Sequential Draw-in -----
    const processSteps = document.querySelectorAll('.process-step');
    if (processSteps.length) {
        processSteps.forEach((step, i) => {
            const number = step.querySelector('.process-number');
            const content = step.querySelector('.process-content');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: step,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });

            tl.from(number, {
                x: -30,
                opacity: 0,
                scale: 1.5,
                duration: 0.6,
                ease: 'back.out(2)'
            });

            tl.from(content, {
                x: 40,
                opacity: 0,
                duration: 0.7,
                ease: 'power3.out'
            }, '-=0.3');
        });
    }

    // ----- CTA Section: Dramatic entrance -----
    const ctaTitle = document.querySelector('.cta-title');
    const ctaSubtitle = document.querySelector('.cta-subtitle');
    const hexagonBtn = document.querySelector('.hexagon-btn');

    if (ctaTitle) {
        gsap.from(ctaTitle, {
            y: 80,
            opacity: 0,
            scale: 0.85,
            filter: 'blur(10px)',
            duration: 1.2,
            scrollTrigger: {
                trigger: '.cta-section',
                start: 'top 60%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    if (ctaSubtitle) {
        gsap.from(ctaSubtitle, {
            y: 50,
            opacity: 0,
            duration: 1,
            delay: 0.2,
            scrollTrigger: {
                trigger: '.cta-section',
                start: 'top 60%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    if (hexagonBtn) {
        gsap.from(hexagonBtn, {
            scale: 0.3,
            opacity: 0,
            rotation: -30,
            duration: 1.5,
            ease: 'elastic.out(1, 0.5)',
            delay: 0.4,
            scrollTrigger: {
                trigger: '.cta-section',
                start: 'top 60%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    // ----- Footer: Slide up -----
    const footer = document.querySelector('.footer');
    if (footer) {
        gsap.from(footer.querySelector('.footer-grid'), {
            y: 60,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: footer,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    // ----- Section Glow Parallax -----
    document.querySelectorAll('.section-glow').forEach(glow => {
        gsap.to(glow, {
            y: -100,
            scale: 1.3,
            scrollTrigger: {
                trigger: glow.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 2
            }
        });
    });

    // ----- Mouse-based 3D tilt on pillar cards -----
    initMouseParallax();
}

// ---- Fallback: Basic Scroll Reveal ----
function initBasicScrollReveal() {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// ---- Gradient Scroll Text (fallback without GSAP) ----
function initGradientScrollText() {
    const container = document.getElementById('gradientScrollText');
    if (!container) return;

    const words = container.querySelectorAll('span');
    if (!words.length) return;

    function updateWords() {
        const rect = container.getBoundingClientRect();
        const windowH = window.innerHeight;
        const startTrigger = windowH * 0.8;
        const endTrigger = windowH * 0.2;

        const progress = Math.min(1, Math.max(0,
            (startTrigger - rect.top) / (startTrigger - endTrigger)
        ));

        const totalWords = words.length;
        const litCount = Math.floor(progress * totalWords);

        words.forEach((word, i) => {
            if (i < litCount) {
                word.classList.add('lit');
            } else {
                word.classList.remove('lit');
            }
        });
    }

    window.addEventListener('scroll', updateWords, { passive: true });
    window.addEventListener('resize', updateWords);
    updateWords();
}

// ---- Mouse-based 3D Parallax ----
function initMouseParallax() {
    const cards = document.querySelectorAll('.pillar-card, .feature-graphic');

    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;

            const distance = Math.sqrt(
                Math.pow(e.clientX - cardCenterX, 2) +
                Math.pow(e.clientY - cardCenterY, 2)
            );

            if (distance < 400) {
                const intensity = 1 - distance / 400;
                const rotateX = mouseY * 8 * intensity;
                const rotateY = mouseX * -8 * intensity;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
                card.style.transition = 'transform 0.1s ease';
            } else {
                card.style.transform = '';
                card.style.transition = 'transform 0.5s ease';
            }
        });
    });

    document.addEventListener('mouseleave', () => {
        cards.forEach(card => {
            card.style.transform = '';
        });
    });
}

// ---- Navbar Hide/Show ----
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScrollY = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;

        requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            if (currentScrollY > 100 && currentScrollY > lastScrollY) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }

            lastScrollY = currentScrollY;
            ticking = false;
        });
    });
}

// ---- Mobile Menu ----
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
        const isActive = links.classList.toggle('active');
        toggle.classList.toggle('active');
        toggle.setAttribute('aria-expanded', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    });

    links.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
}

/* ==========================================
   PRODUCT CAROUSEL
   ========================================== */

function initProductCarousel() {
    // Product data
    const PRODUCTS = [
        {
            icon: '💻', name: 'Software Development',
            desc: 'Custom enterprise software tailored to your exact workflows.',
            color: '#01b8fd',
            full: 'We build bespoke software that integrates seamlessly with your operations. Every line of code is crafted for performance, security and infinite scalability.',
            stats: ['50+', '99.9%', '24/7'], statLabels: ['Projects Delivered', 'Uptime SLA', 'Support'],
            features: [
                { e: '🏗', t: 'Custom ERP & CRM', d: 'Tailored to your exact business logic' },
                { e: '🔌', t: 'API Design', d: 'RESTful & GraphQL with full documentation' },
                { e: '☁️', t: 'Cloud-Native', d: 'AWS, GCP, Azure from day one' },
                { e: '🔒', t: 'Security', d: 'SOC2 compliant architecture' },
            ],
            tags: ['Node.js', 'Python', 'Go', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
            ctaText: 'Ready to build something powerful?'
        },
        {
            icon: '🌐', name: 'Web Development',
            desc: 'High-performance web apps with cutting-edge stacks.',
            color: '#01b8fd',
            full: 'React, Next.js, Node.js — blazing-fast, SEO-optimized accessible web experiences that delight users and convert visitors.',
            stats: ['<100ms', '98/100', '∞'], statLabels: ['Load Time', 'Lighthouse Score', 'Scalability'],
            features: [
                { e: '⚛️', t: 'React & Next.js', d: 'SSR, SSG and ISR rendering patterns' },
                { e: '🎨', t: 'UI/UX Design', d: 'Pixel-perfect Figma to production' },
                { e: '🔍', t: 'SEO', d: 'Technical and content SEO strategy' },
                { e: '📈', t: 'Analytics', d: 'GA4, Mixpanel, Amplitude' },
            ],
            tags: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'MongoDB', 'Vercel'],
            ctaText: 'Launch your next web experience.'
        },
        {
            icon: '📱', name: 'Mobile Apps',
            desc: 'Native iOS, Android and cross-platform Flutter apps.',
            color: '#01b8fd',
            full: 'Your app on every device. We design and develop mobile-first experiences users love, backed by robust backends and real-time analytics.',
            stats: ['5M+', '4.9★', '8 Wks'], statLabels: ['Downloads', 'App Store Rating', 'Avg Launch'],
            features: [
                { e: '🍎', t: 'iOS (Swift)', d: 'Native performance and gestures' },
                { e: '🤖', t: 'Android (Kotlin)', d: 'Material 3 design system' },
                { e: '💙', t: 'Flutter', d: 'One codebase, all platforms' },
                { e: '🔔', t: 'Push & Real-time', d: 'Firebase, OneSignal' },
            ],
            tags: ['Flutter', 'Swift', 'Kotlin', 'Firebase', 'Dart', 'Fastlane'],
            ctaText: 'Your app idea deserves to ship.'
        },
        {
            icon: '🧠', name: 'AI & Machine Learning',
            desc: 'Data-driven intelligence that automates and personalizes.',
            color: '#01b8fd',
            full: 'From NLP chatbots to predictive analytics and computer vision, we integrate AI to create intelligent, self-improving systems.',
            stats: ['95%', '3x', '<50ms'], statLabels: ['Model Accuracy', 'Revenue Uplift', 'Inference'],
            features: [
                { e: '💬', t: 'NLP & Chatbots', d: 'GPT-powered conversational AI' },
                { e: '📊', t: 'Predictive Analytics', d: 'Forecast demand and churn' },
                { e: '👁️', t: 'Computer Vision', d: 'Object detection and OCR' },
                { e: '🎯', t: 'Personalization', d: 'ML-driven recommendations' },
            ],
            tags: ['Python', 'TensorFlow', 'PyTorch', 'LangChain', 'OpenAI', 'FastAPI'],
            ctaText: 'Make your product intelligently adaptive.'
        },
        {
            icon: '📊', name: 'Digital Marketing',
            desc: 'SEO, paid ads and social media to drive measurable growth.',
            color: '#01b8fd',
            full: 'Full-funnel strategies from organic search dominance to precision paid campaigns on Google, Meta and Instagram that drive real ROI.',
            stats: ['300%', '12x', '48hr'], statLabels: ['Avg ROI', 'ROAS', 'Campaign Setup'],
            features: [
                { e: '🔍', t: 'SEO Strategy', d: 'Technical, on-page and link building' },
                { e: '💰', t: 'Google Ads', d: 'Search, Display and Shopping' },
                { e: '📘', t: 'Meta Ads', d: 'Facebook and Instagram funnels' },
                { e: '📱', t: 'Social Media', d: 'Content strategy and scheduling' },
            ],
            tags: ['Google Ads', 'Meta Ads', 'SEMrush', 'Ahrefs', 'HubSpot', 'GA4'],
            ctaText: 'Start growing your digital presence.'
        },
        {
            icon: '⚙️', name: 'DevOps & CI/CD',
            desc: 'Automated pipelines, cloud infra, zero-downtime deploys.',
            color: '#01b8fd',
            full: 'We set up and maintain the infrastructure backbone of your application — reliability, security and blazing-fast delivery cycles.',
            stats: ['99.99%', '0 min', '<5min'], statLabels: ['Uptime', 'Downtime/Deploy', 'Deploy Time'],
            features: [
                { e: '🐳', t: 'Docker & Kubernetes', d: 'Containerized microservices' },
                { e: '🔄', t: 'CI/CD Pipelines', d: 'GitHub Actions, GitLab CI/CD' },
                { e: '📡', t: 'Monitoring', d: 'Grafana, Prometheus, PagerDuty' },
                { e: '🔐', t: 'Security Scanning', d: 'SAST, DAST and Vault secrets' },
            ],
            tags: ['Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Prometheus', 'AWS'],
            ctaText: 'Build infrastructure that never sleeps.'
        },
        {
            icon: '🔄', name: 'Build Operate Transfer',
            desc: 'We build your team, operate it, and hand it over fully.',
            color: '#01b8fd',
            full: 'A complete outsourcing model — we set up your dedicated tech team, operate it to maturity, then seamlessly transfer full ownership to you.',
            stats: ['100%', '12mo', '0%'], statLabels: ['Knowledge Transfer', 'Timeline', 'Handover Risk'],
            features: [
                { e: '👥', t: 'Team Setup & Hiring', d: 'Recruit, train and onboard talent' },
                { e: '🏃', t: 'Day-to-Day Ops', d: 'Management, KPIs and reporting' },
                { e: '📚', t: 'Documentation', d: 'Technical and process knowledge base' },
                { e: '🤝', t: 'Smooth Handover', d: 'Transition training and support' },
            ],
            tags: ['Agile', 'Scrum', 'JIRA', 'Confluence', 'Slack', 'OKRs', 'ISO 27001'],
            ctaText: 'Own your technology team, risk-free.'
        }
    ];

    const ARC_RADIUS = 480;
    const ARC_DEGREES = 22;

    let currentIdx = 3;
    const stage = document.getElementById('archStage');
    const dotsEl = document.getElementById('archDots');

    if (!stage || !dotsEl) return;

    function buildCarousel() {
        stage.innerHTML = '';
        dotsEl.innerHTML = '';

        PRODUCTS.forEach((p, i) => {
            const card = document.createElement('div');
            card.className = 'pc' + (i === currentIdx ? ' active' : '');
            card.dataset.idx = i;
            card.setAttribute('data-idx', i);
            card.innerHTML =
                '<div class="pi">' +
                '<div class="p-shine"></div>' +
                '<div class="p-icon">' + p.icon + '</div>' +
                '<div class="p-name">' + p.name + '</div>' +
                '<div class="p-desc">' + p.desc + '</div>' +
                '<div class="p-cta">Tap to explore →</div>' +
                '</div>';

            card.addEventListener('click', function (e) {
                e.stopPropagation();
                const idx = parseInt(this.dataset.idx);
                if (idx === currentIdx) {
                    openProduct(this, idx, PRODUCTS);
                } else {
                    setActive(idx);
                }
            });

            stage.appendChild(card);

            const dot = document.createElement('div');
            dot.className = 'ad' + (i === currentIdx ? ' active' : '');
            dot.addEventListener('click', function (e) {
                e.stopPropagation();
                setActive(i);
            });
            dotsEl.appendChild(dot);
        });

        positionCards(false);
    }

    function positionCards(animated) {
        const cards = stage.querySelectorAll('.pc');
        if (!cards.length) return;

        cards.forEach((card, i) => {
            const offset = i - currentIdx;
            const rad = offset * ARC_DEGREES * Math.PI / 180;

            const x = Math.sin(rad) * ARC_RADIUS;
            const y = ARC_RADIUS * (1 - Math.cos(rad));

            const scale = Math.max(0.42, 1 - Math.abs(offset) * 0.10);
            const opacity = Math.max(0.12, 1 - Math.abs(offset) * 0.16);
            const rotY = -offset * 12;
            const blur = Math.abs(offset) > 2 ? (Math.abs(offset) - 2) * 2 : 0;
            const duration = animated ? '0.72s cubic-bezier(0.16, 1, 0.3, 1)' : '0s';

            card.style.transform = `translateX(${x}px) translateY(${y}px) scale(${scale}) rotateY(${rotY}deg)`;
            card.style.opacity = opacity;
            card.style.zIndex = 100 - Math.abs(offset);
            card.style.filter = `blur(${blur}px)`;
            card.style.transition = `transform ${duration}, opacity ${duration}, filter ${duration}`;
            card.className = 'pc' + (i === currentIdx ? ' active' : '');
        });

        const dots = dotsEl.querySelectorAll('.ad');
        dots.forEach((dot, i) => {
            dot.className = 'ad' + (i === currentIdx ? ' active' : '');
        });
    }

    function setActive(idx) {
        currentIdx = ((idx % PRODUCTS.length) + PRODUCTS.length) % PRODUCTS.length;
        positionCards(true);
    }

    // Build carousel
    buildCarousel();

    // Button listeners
    const prevBtn = document.getElementById('archPrev');
    const nextBtn = document.getElementById('archNext');

    if (prevBtn) {
        prevBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            setActive(currentIdx - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            setActive(currentIdx + 1);
        });
    }

    // Handle window resize
    window.addEventListener('resize', function () {
        positionCards(false);
    });

    // Product detail page functions
    function buildProductPage(p) {
        const c = p.color;
        return (
            '<div class="pp-hero" style="background:radial-gradient(ellipse 80% 60% at 50% 45%,' + c + '1a,transparent 65%),#000">' +
            '<div class="pp-orb" style="width:500px;height:500px;top:0;right:-100px;background:' + c + '15;filter:blur(80px)"></div>' +
            '<div class="pp-orb" style="width:300px;height:300px;bottom:0;left:-50px;background:' + c + '0d;filter:blur(60px)"></div>' +
            '<div class="pp-icon-wrap">' +
            '<div class="pp-ring pp-r1" style="border-color:' + c + '30"></div>' +
            '<div class="pp-ring pp-r2" style="border-color:' + c + '20"></div>' +
            '<div class="pp-ring pp-r3" style="border-color:' + c + '12"></div>' +
            '<span class="pp-big-icon">' + p.icon + '</span>' +
            '</div>' +
            '<h1 class="pp-title">' + p.name + '</h1>' +
            '<p class="pp-sub">' + p.full + '</p>' +
            '<div class="pp-hero-actions">' +
            '<button class="btn-primary" style="background:' + c + ';box-shadow:0 0 40px ' + c + '66" onclick="window.closePP ? window.closePP() : closePP()">Start Project</button>' +
            '<button class="btn-ghost" onclick="window.closePP ? window.closePP() : closePP()">Back to Services</button>' +
            '</div>' +
            '<div class="pp-stats">' +
            p.stats.map((s, i) =>
                '<div class="pp-stat">' +
                '<div class="pp-stat-n">' + s + '</div>' +
                '<div class="pp-stat-l">' + p.statLabels[i] + '</div>' +
                '</div>'
            ).join('') +
            '</div>' +
            '</div>' +

            '<div class="pp-content">' +
            '<div class="pp-grid">' +
            '<div>' +
            '<div class="pp-section-label">What We Deliver</div>' +
            '<h2 class="pp-h2">Built for scale.<br>Designed to last.</h2>' +
            '<p class="pp-p">' + p.full + '</p>' +
            '<ul class="pp-feat-list">' +
            p.features.map(f =>
                '<li><span>' + f.e + '</span>' +
                '<div><strong>' + f.t + '</strong><br>' +
                '<span style="color:var(--cv-muted);font-size:13px;line-height:1.5">' + f.d + '</span></div></li>'
            ).join('') +
            '</ul>' +
            '</div>' +
            '<div class="pp-visual">' +
            '<div class="pp-orb" style="width:300px;height:300px;background:' + c + '1a;top:50%;left:50%;transform:translate(-50%,-50%);filter:blur(50px)"></div>' +
            '<div class="pp-3d-card" style="border-color:' + c + '40;background:linear-gradient(135deg,' + c + '18,' + c + '06)">' +
            '<div style="font-size:76px">' + p.icon + '</div>' +
            '<h3 style="text-align:center;font-size:20px">' + p.name + '</h3>' +
            '<p style="text-align:center;color:var(--cv-muted);font-size:13px;line-height:1.6">' + p.desc + '</p>' +
            '</div>' +
            '</div>' +
            '</div>' +

            '<div>' +
            '<div class="pp-section-label">Technology Stack</div>' +
            '<h2 class="pp-h2" style="margin-bottom:28px">Tools we master.</h2>' +
            '<div class="pp-tech-tags">' +
            p.tags.map(t => '<div class="pp-tag" style="border-color:' + c + '22">' + t + '</div>').join('') +
            '</div>' +
            '</div>' +

            '<div class="pp-cta-strip" style="background:linear-gradient(135deg,' + c + '14,' + c + '06);border-color:' + c + '28">' +
            '<h3>' + p.ctaText + '</h3>' +
            '<p>Let us discuss your project and chart a clear path to success.</p>' +
            '<button class="btn-primary" style="font-size:17px;padding:16px 44px;background:' + c + ';box-shadow:0 0 40px ' + c + '55" onclick="window.closePP ? window.closePP() : closePP()">Schedule a Call</button>' +
            '</div>' +
            '</div>'
        );
    }

    function addTilt(sel, factor = 16) {
        document.querySelectorAll(sel).forEach(el => {
            el.addEventListener('mousemove', e => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                el.style.transform = 'perspective(900px) rotateY(' + (x * factor) + 'deg) rotateX(' + (-y * factor) + 'deg) translateZ(14px) scale(1.02)';
            });
            el.addEventListener('mouseleave', () => el.style.transform = '');
        });
    }

    let ppOpen = false, ppFromCard = null;

    function openProduct(cardEl, idx, products) {
        if (ppOpen) return;
        ppOpen = true;

        const p = products[idx];
        const pp = document.getElementById('ppage');
        const content = document.getElementById('ppContent');

        content.innerHTML = buildProductPage(p);
        if (window.gsap) {
            window.gsap.set(content, { opacity: 0, y: 50, scale: 0.97 });
        }
        pp.scrollTop = 0;

        const pi = cardEl.querySelector('.pi');
        const r = pi.getBoundingClientRect();
        const vw = window.innerWidth, vh = window.innerHeight;
        const ct = (r.top / vh * 100).toFixed(2) + '%';
        const cr = ((1 - r.right / vw) * 100).toFixed(2) + '%';
        const cb = ((1 - r.bottom / vh) * 100).toFixed(2) + '%';
        const cl = (r.left / vw * 100).toFixed(2) + '%';
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;

        const rip = document.createElement('div');
        rip.className = 'pp-transition-ripple';
        Object.assign(rip.style, {
            left: cx + 'px', top: cy + 'px',
            width: '8px', height: '8px',
            marginLeft: '-4px', marginTop: '-4px',
            background: 'radial-gradient(circle,rgba(0,220,255,.95),rgba(1,184,253,.6) 40%,transparent 70%)',
            boxShadow: '0 0 36px 16px rgba(1,184,253,.6)',
            transform: 'scale(1)'
        });
        document.body.appendChild(rip);

        if (window.gsap) {
            window.gsap.to(pi, {
                boxShadow: '0 0 0 2px rgba(1,184,253,.7), 0 0 90px rgba(1,184,253,.45)',
                duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1
            });

            window.gsap.set(pp, { opacity: 1, clipPath: 'inset(' + ct + ' ' + cr + ' ' + cb + ' ' + cl + ' round 24px)' });
        } else {
            pp.style.opacity = '1';
            pp.style.clipPath = 'inset(' + ct + ' ' + cr + ' ' + cb + ' ' + cl + ' round 24px)';
        }

        pp.style.pointerEvents = 'all';
        document.body.style.overflow = 'hidden';

        if (window.gsap) {
            const tl = window.gsap.timeline();
            tl.to(rip, { scale: 500, opacity: 0, duration: 0.85, ease: 'power3.in' }, 0);
            tl.to(pp, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.8, ease: 'expo.inOut' }, 0.08);
            tl.add(() => {
                pp.classList.add('open');
                document.body.style.overflow = '';
                rip.remove();
                window.gsap.to(content, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out' });
                setTimeout(() => {
                    addTilt('.pp-3d-card', 18);
                    addTilt('.pp-stat', 12);
                    addTilt('.pp-tag', 8);
                    addTilt('.pp-feat-list li', 10);
                }, 120);
            }, 0.82);
        } else {
            setTimeout(() => {
                pp.classList.add('open');
                document.body.style.overflow = '';
                rip.remove();
                content.style.opacity = '1';
                content.style.transform = 'translateY(0) scale(1)';
                setTimeout(() => {
                    addTilt('.pp-3d-card', 18);
                    addTilt('.pp-stat', 12);
                    addTilt('.pp-tag', 8);
                    addTilt('.pp-feat-list li', 10);
                }, 120);
            }, 800);
        }

        ppFromCard = cardEl;
    }

    window.closePP = function () {
        if (!ppOpen) return;
        const pp = document.getElementById('ppage');
        const content = document.getElementById('ppContent');
        document.body.style.overflow = 'hidden';

        let ct = '40%', cr = '40%', cb = '40%', cl = '40%';
        let cx = window.innerWidth / 2, cy = window.innerHeight / 2;

        if (ppFromCard) {
            const r = ppFromCard.querySelector('.pi').getBoundingClientRect();
            const vw = window.innerWidth, vh = window.innerHeight;
            ct = (r.top / vh * 100).toFixed(2) + '%';
            cr = ((1 - r.right / vw) * 100).toFixed(2) + '%';
            cb = ((1 - r.bottom / vh) * 100).toFixed(2) + '%';
            cl = (r.left / vw * 100).toFixed(2) + '%';
            cx = r.left + r.width / 2;
            cy = r.top + r.height / 2;
        }

        const rip = document.createElement('div');
        rip.className = 'pp-transition-ripple';
        Object.assign(rip.style, {
            left: cx + 'px', top: cy + 'px',
            width: '8px', height: '8px',
            marginLeft: '-4px', marginTop: '-4px',
            background: 'radial-gradient(circle,rgba(1,184,253,.9),rgba(1,184,253,.5) 40%,transparent 70%)',
            transform: 'scale(500)',
            opacity: '0',
            zIndex: '8600'
        });
        document.body.appendChild(rip);

        if (window.gsap) {
            const tl = window.gsap.timeline({
                onComplete() {
                    window.gsap.set(pp, { opacity: 0 });
                    pp.style.pointerEvents = 'none';
                    pp.classList.remove('open');
                    document.body.style.overflow = '';
                    ppOpen = false;
                    ppFromCard = null;
                    rip.remove();
                }
            });
            tl.to(content, { opacity: 0, y: -30, scale: 0.97, duration: 0.22, ease: 'power2.in' }, 0);
            tl.to(rip, { scale: 1, opacity: 0.8, duration: 0.45, ease: 'expo.in' }, 0.15);
            tl.to(rip, { opacity: 0, duration: 0.2, ease: 'power2.out' }, 0.55);
            tl.to(pp, { clipPath: 'inset(' + ct + ' ' + cr + ' ' + cb + ' ' + cl + ' round 24px)', duration: 0.78, ease: 'expo.inOut' }, 0.18);
        } else {
            pp.style.clipPath = 'inset(' + ct + ' ' + cr + ' ' + cb + ' ' + cl + ' round 24px)';
            setTimeout(() => {
                pp.style.opacity = '0';
                pp.style.pointerEvents = 'none';
                pp.classList.remove('open');
                document.body.style.overflow = '';
                ppOpen = false;
                ppFromCard = null;
                rip.remove();
            }, 800);
        }
    };

    // Wire up back button
    const backBtn = document.getElementById('ppBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', window.closePP);
    }

    // Contact button
    const contactBtn = document.getElementById('ppContactBtn');
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            window.closePP();
            setTimeout(() => document.querySelector('#cta')?.scrollIntoView({ behavior: 'smooth' }), 400);
        });
    }
}