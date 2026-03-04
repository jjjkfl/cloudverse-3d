/* ============================================
   PRODUCT PAGE — Enhanced Cinematic JS
   3D entrance, parallax, smooth navigation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initProductEntrance();
    initProductScrollReveals();
    initProduct3DParallax();
    initBackNavigation();
    initProductNavbar();
    initProductMouseEffects();
});

/* ---- Navbar with scrolled state ---- */
function initProductNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* ---- 3D Entrance Animation from Homepage ---- */
function initProductEntrance() {
    const origin = sessionStorage.getItem('transitionOrigin');
    const page = document.querySelector('.product-page');
    if (!page) return;

    // Enhanced entrance with perspective
    page.style.animation = 'none';
    page.style.opacity = '0';
    page.style.transform = 'perspective(1500px) rotateY(-8deg) rotateX(3deg) scale(0.9) translateZ(-200px)';
    page.style.filter = 'blur(10px)';

    requestAnimationFrame(() => {
        page.style.transition = 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
        page.style.opacity = '1';
        page.style.transform = 'perspective(1500px) rotateY(0) rotateX(0) scale(1) translateZ(0)';
        page.style.filter = 'blur(0)';
    });

    // Clear stored data
    setTimeout(() => {
        sessionStorage.removeItem('transitionOrigin');
    }, 1500);
}

/* ---- Scroll Reveals with Staggered Timing ---- */
function initProductScrollReveals() {
    const elements = document.querySelectorAll('.feature-card, .tech-pill, .section-tag, .section-title, .section-desc');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');

                    // Add scale effect for tech pills
                    if (entry.target.classList.contains('tech-pill')) {
                        entry.target.style.transform = 'scale(1) translateY(0)';
                    }
                }, index * 100);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

/* ---- 3D Parallax on Mouse Move ---- */
function initProduct3DParallax() {
    const scene = document.querySelector('.product-3d-scene');
    if (!scene) return;

    const hero = document.querySelector('.product-hero');

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        // Smooth parallax with multiple layers
        const cards = scene.querySelectorAll('.product-3d-card');
        cards.forEach((card, index) => {
            const depth = index === 0 ? 1 : index === 1 ? 1.5 : 2;
            const moveX = x * 30 * depth;
            const moveY = y * -20 * depth;
            const rotateY = x * 15 * depth;
            const rotateX = y * -10 * depth;

            card.style.transform = `translateX(${moveX}px) translateY(${moveY}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
            card.style.transition = 'transform 0.1s ease-out';
        });
    });

    hero.addEventListener('mouseleave', () => {
        const cards = scene.querySelectorAll('.product-3d-card');
        cards.forEach((card, index) => {
            const transforms = [
                'translateZ(0) rotateY(-5deg)',
                'translateZ(40px) rotateY(-5deg)',
                'translateZ(60px) rotateY(5deg)',
                'translateZ(80px) rotateX(5deg)'
            ];

            card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.transform = index === 0 ? transforms[0] : transforms[index];

            setTimeout(() => {
                card.style.transition = '';
            }, 600);
        });
    });
}

/* ---- Mouse glow effect on cards ---- */
function initProductMouseEffects() {
    const cards = document.querySelectorAll('.feature-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

/* ---- Back Navigation with Reverse 3D Transition ---- */
function initBackNavigation() {
    const backBtns = document.querySelectorAll('.product-back-btn');

    backBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            const page = document.querySelector('.product-page, .contact-page');
            const href = btn.getAttribute('onclick') ?
                btn.getAttribute('onclick').match(/'([^']+)'/)?.[1] :
                'index.html#products';

            if (page) {
                // Reverse transition
                page.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                page.style.opacity = '0';
                page.style.transform = 'perspective(1500px) rotateY(8deg) rotateX(-3deg) scale(0.9) translateZ(-200px)';
                page.style.filter = 'blur(10px)';

                setTimeout(() => {
                    window.location.href = href;
                }, 700);
            } else {
                window.location.href = href;
            }
        });
    });
}