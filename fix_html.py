"""Fix the corrupted index.html"""

with open('index.html', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# The corruption starts at the footer-bottom-links area where Privacy Policy is
# Find the copyright line which is the last good part before the broken links
marker = 'The New Standard in Software Design.</p>'
idx = content.find(marker)
if idx == -1:
    print("ERROR: Could not find marker")
    exit(1)

# Keep everything up to and including that line
good_content = content[:idx + len(marker)]

# Now append the corrected footer ending + scripts
corrected_ending = """
                <div class="footer-bottom-links">
                    <a href="privacy-policy.html">Privacy Policy</a>
                    <a href="terms.html">Terms of Service</a>
                    <a href="imprint.html">Imprint</a>
                </div>
            </div>
        </div>
    </footer>

    <script src="carousel.js"></script>
    <script>
        /* ══════════════════════════════════════
           INIT CATALOGUE
        ══════════════════════════════════════ */
        const stage = document.getElementById('stage');
        if (stage && typeof draw === 'function') {
            draw(0);
            gsap.set('.ppbar', { translateY: '-100%', opacity: 0 });
            if (typeof startAuto === 'function') startAuto();
        }

        /* ══════════════════════════════════════
           PAGE UTILITIES (preserved)
        ══════════════════════════════════════ */

        // Scroll Progress
        window.addEventListener('scroll', function () {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            document.getElementById('scrollProgress').style.width = scrolled + '%';
        });

        // Navbar scroll effect
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                document.getElementById('navbar').classList.add('scrolled');
            } else {
                document.getElementById('navbar').classList.remove('scrolled');
            }
        });

        // Reveal on scroll
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });
        revealElements.forEach(el => observer.observe(el));

        // CTA interactive grid + hexagon navigation
        (function () {
            const section = document.getElementById('cta');
            const gridCvs = document.getElementById('ctaGridCanvas');
            const wrapper = document.getElementById('ctaPageWrapper');
            const hexBtn = document.getElementById('hexagonTrigger');
            const backBtn = document.getElementById('formBack');
            if (!gridCvs || !section) return;

            const gCtx = gridCvs.getContext('2d');
            let gDots = [];
            const gMouse = { x: -9999, y: -9999 };
            const GAP = 38;

            function initGrid() {
                gridCvs.width = section.offsetWidth;
                gridCvs.height = section.offsetHeight;
                gDots = [];
                for (let x = 0; x < gridCvs.width; x += GAP) {
                    for (let y = 0; y < gridCvs.height; y += GAP) {
                        gDots.push({ x, y });
                    }
                }
            }

            function drawGrid() {
                gCtx.clearRect(0, 0, gridCvs.width, gridCvs.height);
                const rect = section.getBoundingClientRect();
                const relX = gMouse.x - rect.left;
                const relY = gMouse.y - rect.top;

                gDots.forEach(dot => {
                    const dx = relX - dot.x;
                    const dy = relY - dot.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const maxD = 180;
                    let sz = 1.1;
                    let op = 0.1;
                    if (dist < maxD) {
                        const f = (maxD - dist) / maxD;
                        sz = 1.1 + f * 3;
                        op = 0.1 + f * 0.55;
                        const r = Math.round(1 + f * 0);
                        const g = Math.round(184 * f);
                        const b = Math.round(253 * f);
                        gCtx.fillStyle = `rgba(${r},${g},${b},${op})`;
                    } else {
                        gCtx.fillStyle = `rgba(255,255,255,${op})`;
                    }
                    gCtx.beginPath();
                    gCtx.arc(dot.x, dot.y, sz, 0, Math.PI * 2);
                    gCtx.fill();
                });
                requestAnimationFrame(drawGrid);
            }

            window.addEventListener('mousemove', e => {
                gMouse.x = e.clientX;
                gMouse.y = e.clientY;
            });

            window.addEventListener('resize', initGrid);

            if (hexBtn && wrapper) {
                hexBtn.addEventListener('click', () => wrapper.classList.add('cta-show-form'));
                hexBtn.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') wrapper.classList.add('cta-show-form');
                });
            }
            if (backBtn && wrapper) {
                backBtn.addEventListener('click', () => wrapper.classList.remove('cta-show-form'));
            }

            initGrid();
            drawGrid();
        })();
    </script>

    <!-- Client logo hover effect -->
    <style>
        .clients-grid img:hover {
            opacity: 1;
            filter: grayscale(0);
            transform: scale(1.1);
            transition: all 0.3s ease;
        }
    </style>

    <!-- ATOM CANVAS ANIMATION -->
    <script>
        (function () {
            const atomContainer = document.getElementById('atomContainer');
            const atomCvs = document.getElementById('atomCvs');
            const heroCloud = document.getElementById('heroCloud');
            if (!atomContainer || !atomCvs) return;

            const ctx = atomCvs.getContext('2d');
            let W, H, CX, CY, SR;

            function resize() {
                W = atomCvs.width = atomContainer.offsetWidth;
                H = atomCvs.height = atomContainer.offsetHeight;
                CX = W / 2;
                CY = H / 2;
                SR = W / 2;
            }
            resize();
            window.addEventListener('resize', resize);

            const ringDefs = [
                { radius: 0.35, tiltX: 0, tiltY: 0, count: 3, speed: 0.005, hue: 196 },
                { radius: 0.55, tiltX: 60 * Math.PI / 180, tiltY: 10 * Math.PI / 180, count: 5, speed: 0.0035, hue: 200 },
                { radius: 0.75, tiltX: 30 * Math.PI / 180, tiltY: 30 * Math.PI / 180, count: 7, speed: 0.0025, hue: 280 },
                { radius: 0.92, tiltX: 45 * Math.PI / 180, tiltY: -15 * Math.PI / 180, count: 9, speed: 0.002, hue: 210 },
            ];

            const particles = [];
            ringDefs.forEach((rd, ri) => {
                for (let i = 0; i < rd.count; i++) {
                    particles.push({
                        rFrac: rd.radius, tiltX: rd.tiltX, tiltY: rd.tiltY,
                        angle: (i / rd.count) * Math.PI * 2,
                        speed: rd.speed * (0.9 + i * 0.05),
                        x: 0, y: 0, z: 0,
                        size: 2.2 - ri * 0.25, opacity: 0.6 - ri * 0.08,
                        hue: rd.hue + i * 2, trail: [], trailLen: 6 - ri
                    });
                }
            });

            function rotX(x, y, z, a) {
                const c = Math.cos(a), s = Math.sin(a);
                return { x, y: y * c - z * s, z: y * s + z * c };
            }
            function rotY(x, y, z, a) {
                const c = Math.cos(a), s = Math.sin(a);
                return { x: x * c + z * s, y, z: -x * s + z * c };
            }

            function update() {
                const r = SR;
                particles.forEach(p => {
                    p.angle += p.speed;
                    const radius = p.rFrac * r;
                    let x = radius * Math.cos(p.angle);
                    let y = radius * Math.sin(p.angle);
                    let z = 0;
                    if (p.tiltY) { const rv = rotY(x, y, z, p.tiltY); x = rv.x; y = rv.y; z = rv.z; }
                    if (p.tiltX) { const rv = rotX(x, y, z, p.tiltX); x = rv.x; y = rv.y; z = rv.z; }
                    p.x = x; p.y = y; p.z = z;
                    p.trail.unshift({ x, y, z });
                    if (p.trail.length > p.trailLen) p.trail.pop();
                });
            }

            function draw() {
                if (!CX) return;
                ctx.clearRect(0, 0, W, H);
                const sorted = [...particles].sort((a, b) => a.z - b.z);
                sorted.forEach(p => {
                    const radius = p.rFrac * SR;
                    const px = CX + p.x;
                    const py = CY + p.y * 0.8;
                    const depthF = 0.7 + (p.z / radius) * 0.3;
                    const zOp = p.opacity * (0.6 + Math.abs(p.z / radius) * 0.4);

                    p.trail.forEach((t, idx) => {
                        if (idx === 0) return;
                        const tx = CX + t.x;
                        const ty = CY + t.y * 0.8;
                        const tOp = zOp * 0.15 * (1 - idx / p.trail.length) * (0.7 + (t.z / radius) * 0.3);
                        const tSz = p.size * 0.6 * (1 - idx / p.trail.length * 0.3);
                        ctx.beginPath();
                        ctx.arc(tx, ty, Math.max(tSz, 0.5), 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${p.hue},80%,70%,${tOp})`;
                        ctx.fill();
                    });

                    const glow = ctx.createRadialGradient(px, py, 0, px, py, p.size * 6);
                    glow.addColorStop(0, `hsla(${p.hue},80%,80%,${zOp * 0.2})`);
                    glow.addColorStop(1, 'transparent');
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(px, py, p.size * 6, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(px, py, p.size * depthF * 0.8, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${p.hue},85%,85%,${zOp})`;
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(px, py, p.size * 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${p.hue},90%,95%,${zOp})`;
                    ctx.fill();
                });

                if (heroCloud) {
                    heroCloud.style.filter = 'drop-shadow(0 0 12px rgba(1,184,253,0.4)) drop-shadow(0 0 28px rgba(1,184,253,0.15))';
                }
            }

            function loop() { update(); draw(); requestAnimationFrame(loop); }
            loop();
        })();
    </script>
</body>

</html>
"""

# Write the fixed file
fixed_content = good_content + '\n' + corrected_ending

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(fixed_content)

print(f"Fixed! New file size: {len(fixed_content)} chars")
# Count lines
print(f"New line count: {fixed_content.count(chr(10))}")
