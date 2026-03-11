/* ============================================
   CAROUSEL DATA & LOGIC — "Engineering the Future"
   ============================================ */
const SVC = [
    {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>', 
        name: 'Software Development',
        tag: 'Enterprise software built for performance & infinite scale.',
        color: '#3a7bd5', glow: 'rgba(58,123,213,',
        bg: 'linear-gradient(175deg,#0d1b4b 0%,#1a3a8a 50%,#0a1230 100%)',
        full: 'We engineer bespoke software integrating seamlessly with your operations — every line of code crafted for performance, security and infinite scalability.',
        stats: ['50+', '99.9%', '24/7'], statL: ['Projects', 'Uptime SLA', 'Support'],
        feats: [{ e: '🏗', t: 'Custom ERP & CRM', d: 'Tailored to your exact business logic' }, { e: '🔌', t: 'API Design', d: 'RESTful & GraphQL, fully documented' }, { e: '☁️', t: 'Cloud-Native', d: 'AWS, GCP, Azure from day one' }, { e: '🔒', t: 'Security', d: 'SOC2 compliant architecture' }],
        tags: ['Node.js', 'Python', 'Go', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
        cta: 'Ready to build something powerful?'
    },
    {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>', 
        name: 'Web Development',
        tag: 'Blazing-fast, SEO-optimized web experiences.',
        color: '#5b8dee', glow: 'rgba(91,141,238,',
        bg: 'linear-gradient(175deg,#061840 0%,#0d3080 50%,#040e25 100%)',
        full: 'React, Next.js, Node.js — blazing-fast, accessible web experiences that delight users and convert visitors into loyal customers.',
        stats: ['<100ms', '98/100', '∞'], statL: ['Load Time', 'Lighthouse', 'Scalability'],
        feats: [{ e: '⚛️', t: 'React & Next.js', d: 'SSR, SSG and ISR patterns' }, { e: '🎨', t: 'UI/UX Design', d: 'Pixel-perfect Figma to production' }, { e: '🔍', t: 'SEO', d: 'Technical and content strategy' }, { e: '📈', t: 'Analytics', d: 'GA4, Mixpanel, Amplitude' }],
        tags: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'MongoDB', 'Vercel'],
        cta: 'Launch your next web experience.'
    },
    {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>', 
        name: 'Mobile Apps',
        tag: 'Native iOS, Android & Flutter apps users love.',
        color: '#e83e8c', glow: 'rgba(232,62,140,',
        bg: 'linear-gradient(175deg,#3d0020 0%,#8a0040 50%,#280015 100%)',
        full: 'Your app on every device — mobile-first experiences backed by robust backends and real-time analytics, shipped in weeks not months.',
        stats: ['5M+', '4.9★', '8wks'], statL: ['Downloads', 'App Rating', 'Avg Launch'],
        feats: [{ e: '🍎', t: 'iOS Swift', d: 'Native performance & gestures' }, { e: '🤖', t: 'Android Kotlin', d: 'Material 3 design system' }, { e: '💙', t: 'Flutter', d: 'One codebase, all platforms' }, { e: '🔔', t: 'Real-time', d: 'Firebase, OneSignal, WebSockets' }],
        tags: ['Flutter', 'Swift', 'Kotlin', 'Firebase', 'Dart', 'Fastlane'],
        cta: 'Your app idea deserves to ship.'
    },
    {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>', 
        name: 'AI & Machine Learning',
        tag: 'Intelligent systems that automate & self-improve.',
        color: '#9b59b6', glow: 'rgba(155,89,182,',
        bg: 'linear-gradient(175deg,#1a0033 0%,#4a0080 50%,#110022 100%)',
        full: 'From NLP chatbots to predictive analytics and computer vision — intelligent, self-improving systems that drive measurable revenue uplift.',
        stats: ['95%', '3×', '<50ms'], statL: ['Accuracy', 'Revenue Uplift', 'Inference'],
        feats: [{ e: '💬', t: 'NLP & Chatbots', d: 'GPT-powered conversational AI' }, { e: '📊', t: 'Predictive Analytics', d: 'Forecast demand and churn' }, { e: '👁️', t: 'Computer Vision', d: 'Object detection and OCR' }, { e: '🎯', t: 'Personalization', d: 'ML-driven recommendations' }],
        tags: ['Python', 'TensorFlow', 'PyTorch', 'LangChain', 'OpenAI', 'FastAPI'],
        cta: 'Make your product intelligently adaptive.'
    },
    {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>', 
        name: 'Digital Marketing',
        tag: 'Full-funnel growth that drives measurable ROI.',
        color: '#e67e22', glow: 'rgba(230,126,34,',
        bg: 'linear-gradient(175deg,#3d1500 0%,#8a3000 50%,#270e00 100%)',
        full: 'Full-funnel strategies from organic search dominance to precision paid campaigns on Google, Meta and Instagram that drive real, attributable ROI.',
        stats: ['300%', '12×', '48hr'], statL: ['Avg ROI', 'ROAS', 'Campaign Setup'],
        feats: [{ e: '🔍', t: 'SEO Strategy', d: 'Technical, on-page and link building' }, { e: '💰', t: 'Google Ads', d: 'Search, Display and Shopping' }, { e: '📘', t: 'Meta Ads', d: 'Facebook and Instagram funnels' }, { e: '📱', t: 'Social Media', d: 'Content strategy and scheduling' }],
        tags: ['Google Ads', 'Meta Ads', 'SEMrush', 'Ahrefs', 'HubSpot', 'GA4'],
        cta: 'Start growing your digital presence.'
    },
    {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12c0 6-8 6-8 0a4 4 0 1 0-8 0c0 6 8 6 8 0"></path></svg>', 
        name: 'DevOps & CI/CD',
        tag: 'Automated pipelines & zero-downtime deploys.',
        color: '#27ae60', glow: 'rgba(39,174,96,',
        bg: 'linear-gradient(175deg,#001a0d 0%,#004d22 50%,#00100a 100%)',
        full: 'We set up and maintain your infrastructure backbone — reliability, security and blazing-fast delivery cycles with automated testing.',
        stats: ['99.99%', '0min', '<5min'], statL: ['Uptime', 'Downtime/Deploy', 'Deploy Time'],
        feats: [{ e: '🐳', t: 'Docker & Kubernetes', d: 'Containerized microservices' }, { e: '🔄', t: 'CI/CD Pipelines', d: 'GitHub Actions, GitLab CI/CD' }, { e: '📡', t: 'Monitoring', d: 'Grafana, Prometheus, PagerDuty' }, { e: '🔐', t: 'Security', d: 'SAST, DAST and Vault secrets' }],
        tags: ['Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Prometheus', 'AWS'],
        cta: 'Build infrastructure that never sleeps.'
    },
    {
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"></path><path d="M8 21H3v-5"></path><path d="M21 3 3 21"></path></svg>', 
        name: 'Build Operate Transfer',
        tag: 'We build your team, operate it, then hand it over.',
        color: '#f39c12', glow: 'rgba(243,156,18,',
        bg: 'linear-gradient(175deg,#2a1800 0%,#7a4400 50%,#1a0f00 100%)',
        full: 'A complete outsourcing model — set up your dedicated tech team, operate it to maturity, then seamlessly transfer ownership to you, risk-free.',
        stats: ['100%', '12mo', '0%'], statL: ['Knowledge Transfer', 'Timeline', 'Handover Risk'],
        feats: [{ e: '👥', t: 'Team Setup', d: 'Recruit, train and onboard talent' }, { e: '🏃', t: 'Day-to-Day Ops', d: 'Management, KPIs and reporting' }, { e: '📚', t: 'Documentation', d: 'Technical and process knowledge base' }, { e: '🤝', t: 'Handover', d: 'Transition training and support' }],
        tags: ['Agile', 'Scrum', 'JIRA', 'Confluence', 'Slack', 'OKRs', 'ISO 27001'],
        cta: 'Own your technology team, risk-free.'
    }
];

const N = SVC.length;
const SPREAD = 200;
const ROT_PER = 18;
const SC_STEP = 0.12;
const OP_STEP = 0.16;
const MAX_VIS = 3;

let pos = 3;
let busy = false;
let autoT = null;

function initCarousel() {
    const stageEl = document.getElementById('stage');
    const dotsEl = document.getElementById('dots');
    if (!stageEl || !dotsEl) return;

    const cards = SVC.map((s, i) => {
        const el = document.createElement('div');
        el.className = 'card';
        el.innerHTML =
            '<div class="face" style="background:' + s.bg + '">' +
            '<div class="shimmer"></div>' +
            '<div class="notch"></div>' +
            '<div class="icon">' + s.icon + '</div>' +
            '<div class="cname">' + s.name + '</div>' +
            '<button class="card-btn">Explore</button>' +
            '</div>';

        el.addEventListener('click', () => {
            const ci = ((Math.round(pos) % N) + N) % N;
            if (i === ci) openPP(i);
            else {
                let d = i - ci;
                if (d > N / 2) d -= N;
                if (d < -N / 2) d += N;
                animTo(pos + d);
            }
        });
        stageEl.appendChild(el);
        return el;
    });

    const dotEls = SVC.map((_, i) => {
        const d = document.createElement('div');
        d.className = 'cat-dot';
        d.addEventListener('click', () => {
            const ci = ((Math.round(pos) % N) + N) % N;
            let d2 = i - ci;
            if (d2 > N / 2) d2 -= N;
            if (d2 < -N / 2) d2 += N;
            animTo(pos + d2);
        });
        dotsEl.appendChild(d);
        return d;
    });

    let lastCI = -1;

    function draw(p) {
        const ci = ((Math.round(p) % N) + N) % N;
        cards.forEach((el, i) => {
            let off = i - p;
            off = ((off % N) + N + N / 2) % N - N / 2;
            const abs = Math.abs(off);
            if (abs > MAX_VIS + 0.7) {
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
                return;
            }
            const isCenter = (i === ci);
            const x = off * SPREAD;
            const rotY = Math.max(-72, Math.min(72, off * ROT_PER));
            const sc = Math.max(0.48, 1 - abs * SC_STEP);
            const op = Math.max(0.18, 1 - abs * OP_STEP);
            const yNudge = abs * abs * 5;
            const zi = Math.round(100 - abs * 15);
            const bl = abs > 2.2 ? (abs - 2.2) * 2.8 : 0;
            el.style.cssText = `position:absolute;width:185px;height:290px;bottom:0;left:calc(50% - 92px);border-radius:20px;overflow:hidden;cursor:pointer;user-select:none;transform-style:preserve-3d;will-change:transform,opacity,filter;transform-origin:50% 100%;transform:translateX(${x.toFixed(1)}px) translateY(${-yNudge.toFixed(1)}px) rotateY(${rotY.toFixed(1)}deg) scale(${sc.toFixed(3)});opacity:${op.toFixed(3)};z-index:${zi};filter:blur(${bl.toFixed(1)}px);pointer-events:${abs < MAX_VIS ? 'all' : 'none'};`;
            el.classList.toggle('is-center', isCenter);
        });
        dotEls.forEach((d, i) => d.classList.toggle('on', i === ci));
        if (ci !== lastCI) { lastCI = ci; updateScene(ci, dotEls); }
    }

    function updateScene(idx, dotEls) {
        const s = SVC[idx];
        document.getElementById('bg-blob').style.background = `radial-gradient(circle, ${s.glow}0.55) 0%, transparent 65%)`;
        dotEls.forEach(d => {
            if (d.classList.contains('on')) d.style.background = s.color;
            else d.style.background = '';
        });
        const cta = document.getElementById('mainCta');
        cta.style.background = s.color;
        cta.style.boxShadow = `0 0 24px ${s.glow}0.45)`;
        const nameEl = document.getElementById('active-name');
        const tagEl = document.getElementById('active-tag');
        gsap.to([nameEl, tagEl], {
            opacity: 0, y: -7, duration: .16, ease: 'power2.in', onComplete() {
                nameEl.textContent = s.name;
                tagEl.textContent = s.tag;
                gsap.to([nameEl, tagEl], { opacity: 1, y: 0, duration: .28, stagger: .05, ease: 'power2.out' });
            }
        });
    }

    function animTo(target) {
        stopAuto(); busy = true;
        const obj = { v: pos };
        gsap.to(obj, {
            v: target, duration: .68, ease: 'power3.out',
            onUpdate() { pos = obj.v; draw(pos); },
            onComplete() { pos = target; busy = false; startAuto(); }
        });
    }

    function startAuto() {
        clearTimeout(autoT);
        autoT = setTimeout(() => {
            if (!busy) {
                busy = true;
                const obj = { v: pos };
                gsap.to(obj, {
                    v: pos + 1, duration: .85, ease: 'power2.inOut',
                    onUpdate() { pos = obj.v; draw(pos); },
                    onComplete() { pos = obj.v; busy = false; startAuto(); }
                });
            }
        }, 3000);
    }

    function stopAuto() { clearTimeout(autoT); busy = false; }

    document.getElementById('prev').addEventListener('click', () => animTo(pos - 1));
    document.getElementById('next').addEventListener('click', () => animTo(pos + 1));
    document.getElementById('mainCta').addEventListener('click', () => openPP(((Math.round(pos) % N) + N) % N));

    draw(pos);
    startAuto();
}

function buildPP(s) {
    const c = s.color, g = s.glow;
    return (
        `<div class="pphero" style="background:radial-gradient(ellipse 75% 55% at 50% 42%,${g}0.18),transparent 60%),#080810">
            <div class="orb" style="width:500px;height:500px;top:-70px;right:-90px;background:${g}0.1);filter:blur(90px)"></div>
            <div class="orb" style="width:300px;height:300px;bottom:-40px;left:-60px;background:${g}0.07);filter:blur(75px)"></div>
            <span class="bigicon">${s.icon}</span>
            <h1 class="pptitle">${s.name}</h1>
            <p class="ppsub">${s.full}</p>
            <div class="ppbtns">
                <button class="bpa" style="background:${c};box-shadow:0 0 30px ${g}0.48)" onclick="closePP()">Start a Project</button>
                <button class="bpb" onclick="closePP()">Back to Services</button>
            </div>
            <div class="ppstats">
                ${s.stats.map((v, i) => `<div class="pstat"><div class="psn" style="background:linear-gradient(120deg,#fff,${c});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${v}</div><div class="psl">${s.statL[i]}</div></div>`).join('')}
            </div>
        </div>
        <div class="ppbody">
            <div class="pp2col" style="display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center;">
                <div>
                    <h2 class="pph2">Built for scale.<br>Designed to last.</h2>
                    <p class="ppp">${s.full}</p>
                </div>
                <div class="ppvis">
                    <div class="orb" style="width:280px;height:280px;background:${g}0.18);top:50%;left:50%;transform:translate(-50%,-50%);filter:blur(65px)"></div>
                    <div class="pp3d" style="background:${s.bg}; border:1px solid ${g}0.35); border-radius: 20px; padding: 40px; text-align: center; color: white;">
                        <div style="font-size:70px">${s.icon}</div>
                        <div style="font-size:20px; font-weight:700; margin-top:20px">${s.name}</div>
                    </div>
                </div>
            </div>
        </div>`
    );
}

let ppOpen = false, ppActiveIdx = -1;

function openPP(idx) {
    if (ppOpen) return;
    ppOpen = true;
    ppActiveIdx = idx;
    const s = SVC[idx];
    const pp = document.getElementById('pp');
    const ct = document.getElementById('ppcontent');
    const shell = document.getElementById('morph-shell');
    const emoji = document.getElementById('morph-emoji');

    ct.innerHTML = buildPP(s);
    pp.scrollTop = 0;

    emoji.textContent = '';
    emoji.innerHTML = s.icon;
    shell.style.background = s.bg;
    shell.style.display = 'block';
    shell.style.opacity = '1';

    gsap.to(shell, { top: 0, left: 0, width: '100vw', height: '100vh', borderRadius: 0, duration: .68, ease: 'expo.inOut' });
    gsap.to(emoji, { fontSize: '110px', duration: .68, ease: 'expo.inOut' });

    setTimeout(() => {
        pp.classList.add('pp-live');
        gsap.to('.ppbar', { translateY: 0, opacity: 1, duration: .52, ease: 'power3.out' });
        gsap.to(shell, { opacity: 0, duration: .32, onComplete() { shell.style.display = 'none'; } });
    }, 600);
}

function closePP() {
    if (!ppOpen) return;
    const pp = document.getElementById('pp');
    pp.classList.remove('pp-live');
    ppOpen = false;
    gsap.set('.ppbar', { translateY: '-100%', opacity: 0 });
}

document.addEventListener('DOMContentLoaded', initCarousel);
