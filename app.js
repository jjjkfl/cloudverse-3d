/* ==========================================
   Cloudverse — Enhanced Cinematic Main Script
   Smooth scroll, parallax, and beautiful transitions
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initAtomAnimation();
    initHexagonAnimation();
    initParticleCanvas();
    initScrollReveal();
    initGradientScrollText();
    initHexagonTrigger();
    initArcProducts();
    initNavbar();
    initMobileMenu();
    initLayeredParallax();
    initMouseParallax();
    initHeroParticles();
    initSmoothScroll();
});

// ---- Custom Cursor Effect ----
document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
    document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
});

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
            
            // Smooth movement with easing
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
        // Smoothly return to base positions
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
            // Smooth scroll to top of form
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

// ---- 3D Semicircle Arc Product Layout ----
function initArcProducts() {
    const ring = document.getElementById('arcRing');
    if (!ring) return;

    const cards = ring.querySelectorAll('.arc-card');
    const total = cards.length;
    const overlay = document.getElementById('pageTransition');

    function positionCards() {
        const stageW = ring.parentElement.offsetWidth;
        const stageH = ring.parentElement.offsetHeight;
        const centerX = stageW / 2;
        const centerY = stageH * 0.85;

        // Responsive radius
        const radiusX = Math.min(stageW * 0.4, 500);
        const radiusY = Math.min(stageH * 0.5, 300);

        const startAngle = Math.PI;
        const endAngle = 0;

        cards.forEach((card, i) => {
            const t = total > 1 ? i / (total - 1) : 0.5;
            const angle = startAngle + t * (endAngle - startAngle);

            const x = centerX + radiusX * Math.cos(angle) - 85;
            const y = centerY - radiusY * Math.sin(angle) - 105;

            const tiltY = (t - 0.5) * -30;
            const tiltX = (1 - Math.sin(angle)) * 10;

            const transformStr = `rotateY(${tiltY}deg) rotateX(${tiltX}deg)`;
            card.style.left = `${x}px`;
            card.style.top = `${y}px`;
            card.style.setProperty('--arc-transform', transformStr);
            card.style.transform = transformStr;
        });
    }

    positionCards();
    window.addEventListener('resize', positionCards);

    // 3D Click → Page Transition
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const href = card.dataset.href;
            if (!href) return;

            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            if (overlay) {
                const glow = overlay.querySelector('.transition-glow');
                if (glow) {
                    glow.style.left = cx + 'px';
                    glow.style.top = cy + 'px';
                }
                overlay.classList.add('active');
            }

            // Store transition origin for product page
            sessionStorage.setItem('transitionOrigin', JSON.stringify({ x: cx, y: cy }));

            card.style.transition = 'transform 0.8s var(--ease-out-expo), opacity 0.5s ease';
            card.style.transform = `translateZ(800px) scale(3)`;
            card.style.opacity = '0';
            card.style.zIndex = '100';

            setTimeout(() => {
                window.location.href = href;
            }, 800);
        });
    });
}

// ---- Enhanced Scroll Reveal with Speed Control ----
function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add speed-based delay
                const speed = entry.target.dataset.speed || 'normal';
                const delay = speed === 'slow' ? 0.2 : speed === 'fast' ? 0 : 0.1;
                
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay * 1000);
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// ---- Apple-style Gradient Scroll Text ----
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

// ---- Layered Parallax Scrolling (Main Effect) ----
function initLayeredParallax() {
    const containers = document.querySelectorAll('.parallax-container');
    if (!containers.length) return;

    let ticking = false;

    function updateParallax() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        containers.forEach(container => {
            const rect = container.getBoundingClientRect();
            const containerTop = rect.top + scrollY;
            const containerCenter = containerTop + rect.height / 2;
            
            // Calculate how far the container is from the center of viewport
            const viewportCenter = scrollY + windowHeight / 2;
            const distanceFromCenter = (containerCenter - viewportCenter) / (windowHeight * 0.5);
            
            // Get all layers in this container
            const layers = container.querySelectorAll('.parallax-layer');
            
            layers.forEach(layer => {
                const speed = parseFloat(layer.dataset.speed) || 0.5;
                
                // Calculate movement based on distance from center
                // Layers move in opposite directions based on depth
                const moveY = distanceFromCenter * 100 * (1 - speed) * (layer.classList.contains('layer-deep') ? -1 : 1);
                const moveX = distanceFromCenter * 50 * (1 - speed) * (layer.classList.contains('layer-deep') ? -1 : 1);
                
                // Apply transform with smooth easing
                layer.style.transform = `translateZ(${layer.classList.contains('layer-deep') ? -200 : 
                    layer.classList.contains('layer-back') ? -100 : 
                    layer.classList.contains('layer-mid') ? 0 : 100}px) 
                    translateY(${moveY}px) 
                    translateX(${moveX}px) 
                    scale(${layer.classList.contains('layer-deep') ? 1.5 : 
                    layer.classList.contains('layer-back') ? 1.2 : 
                    layer.classList.contains('layer-mid') ? 1 : 0.9})`;
                
                // Adjust opacity based on scroll position
                const opacity = 1 - Math.abs(distanceFromCenter) * 0.3;
                layer.style.opacity = Math.max(0.3, Math.min(1, opacity));
            });
        });

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initial update
    updateParallax();
}

// ---- Mouse-based 3D Parallax ----
function initMouseParallax() {
    const cards = document.querySelectorAll('.pillar-card, .feature-card, .arc-card');
    
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
                const rotateX = mouseY * 10 * intensity;
                const rotateY = mouseX * -10 * intensity;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02) translateZ(20px)`;
                card.style.transition = 'transform 0.1s ease';
                
                // Move inner elements for layered effect
                const icon = card.querySelector('.pillar-icon, .big-icon, svg');
                if (icon) {
                    icon.style.transform = `translateX(${rotateY * 2}px) translateY(${-rotateX * 2}px) translateZ(30px)`;
                }
            } else {
                card.style.transform = '';
                card.style.transition = 'transform 0.3s ease';
                
                const icon = card.querySelector('.pillar-icon, .big-icon, svg');
                if (icon) {
                    icon.style.transform = '';
                }
            }
        });
    });
    
    document.addEventListener('mouseleave', () => {
        cards.forEach(card => {
            card.style.transform = '';
            const icon = card.querySelector('.pillar-icon, .big-icon, svg');
            if (icon) {
                icon.style.transform = '';
            }
        });
    });
}

// ---- Smooth Scroll for Anchor Links ----
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

// ---- Hero Particle Animation ----
function initHeroParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const canvas = document.createElement('canvas');
    canvas.classList.add('hero-particles-canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    
    hero.querySelector('.hero-particles')?.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrame;
    
    function resize() {
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
        
        particles = [];
        const particleCount = Math.floor(canvas.width * canvas.height / 10000);
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(1, 184, 253, ${p.opacity * 0.2})`;
            ctx.fill();
        });
        
        animationFrame = requestAnimationFrame(draw);
    }
    
    window.addEventListener('resize', resize);
    resize();
    draw();
    
    return () => {
        cancelAnimationFrame(animationFrame);
        window.removeEventListener('resize', resize);
    };
}

// ---- Navbar Hide/Show on Scroll ----
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
            
            // Add scrolled class for background change
            if (currentScrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            // Hide/show navbar based on scroll direction
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

// ---- Mobile Menu Toggle ----
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