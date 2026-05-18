
    // =============================================
    // PAGE LOADER
    // =============================================
    const loader = document.getElementById('page-loader');
    const loaderLogo = document.getElementById('loaderDynamicLogo');
    syncLoaderTheme('primary');
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.getElementById('page-loader').classList.add('hidden');
            document.getElementById('mainNav').classList.add('nav-loaded');
            initHeroAnimations();
        }, 2000);
    });

    // =============================================
    // BACKGROUND CANVAS — MULTI PENTAGON HOLOGRAM WORM
    // max 5 snakes, each max 5 pentagon segments
    // when head appears, tail disappears
    // =============================================
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    
    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Draw a pentagon centered at (cx, cy) with given radius and rotation angle
    function drawPentagon(cx, cy, radius, angle, color) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a = angle + (i * 2 * Math.PI / 5) - Math.PI / 2;
            const x = cx + radius * Math.cos(a);
            const y = cy + radius * Math.sin(a);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = color.replace(/[\d.]+\)$/, '0.8)');
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Holographic color palette based on brand colors
    const holoColors = [
        [255, 0, 82],       // primary red
        [0, 236, 166],      // accent green
        [8, 34, 65],        // dark blue
        [255, 120, 0],      // orange warmth
        [120, 0, 255],      // violet contrast
    ];

    class PentaSnake {
        constructor(index) {
            this.index = index;
            this.trail = [];
            this.maxTrail = 8;
            this.radius = 28 + Math.random() * 30; // 28-58px
            this.rotAngle = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.04;
            this.color = holoColors[index % holoColors.length];
            this.speed = 1.5 + Math.random() * 2;
            this.dirAngle = Math.random() * Math.PI * 2; // direction of movement
            this.turnSpeed = (Math.random() - 0.5) * 0.06; // how fast it turns
            this.x = Math.random() * width;
            this.y = Math.random() * height;
        }

        update() {
            // Slowly turn direction
            this.dirAngle += this.turnSpeed + (Math.random() - 0.5) * 0.02;

            // Add random jitter for organic movement
            this.x += Math.cos(this.dirAngle) * this.speed + (Math.random() - 0.5) * 0.5;
            this.y += Math.sin(this.dirAngle) * this.speed + (Math.random() - 0.5) * 0.5;

            // Bounce off edges with some buffer
            const buf = this.radius * 2;
            if (this.x < buf || this.x > width - buf) {
                this.dirAngle = Math.PI - this.dirAngle + (Math.random() - 0.5) * 0.5;
                this.x = Math.max(buf, Math.min(width - buf, this.x));
            }
            if (this.y < buf || this.y > height - buf) {
                this.dirAngle = -this.dirAngle + (Math.random() - 0.5) * 0.5;
                this.y = Math.max(buf, Math.min(height - buf, this.y));
            }

            // Push head position to front of trail
            this.trail.unshift({ x: this.x, y: this.y });
            // Pop tail if over max — head appears, tail disappears
            if (this.trail.length > this.maxTrail) {
                this.trail.pop();
            }

            // Rotate the pentagon shape itself
            this.rotAngle += this.rotSpeed;
        }

        draw() {
            const [r, g, b] = this.color;
            for (let i = this.trail.length - 1; i >= 0; i--) {
                const p = this.trail[i];
                // Opacity: head (i=0) is most opaque, tail fades out
                const t = i / (this.maxTrail - 1 || 1);
                const opacity = (1 - t) * 0.5 + 0.08;
                const segRadius = this.radius * (1 - t * 0.35); // head biggest, tail shrinks
                const segRot = this.rotAngle + i * 0.25; // each segment slightly rotated

                // Holographic iridescent color shift per segment
                const hueShift = i * 15;
                const fillColor = `rgba(${Math.min(255, r + hueShift)}, ${Math.min(255, g + hueShift * 0.3)}, ${Math.min(255, b + hueShift * 0.5)}, ${opacity})`;

                drawPentagon(p.x, p.y, segRadius, segRot, fillColor);

                // Glow on head segment
                if (i === 0) {
                    ctx.save();
                    ctx.shadowBlur = 45;
                    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
                    drawPentagon(p.x, p.y, segRadius * 0.5, segRot, `rgba(${r}, ${g}, ${b}, ${opacity * 0.6})`);
                    ctx.restore();
                }
            }
        }
    }

    window.addEventListener('mousemove', (e)=>{

        snakes.forEach((s)=>{

            const dx = e.clientX - s.x;
            const dy = e.clientY - s.y;

            const dist = Math.sqrt(dx*dx + dy*dy);

            if(dist < 250){

                s.dirAngle += 0.05;
                s.speed = 4;

            }else{

                s.speed = 2;

            }

        });

        });

    // Create exactly 5 snakes
    const NUM_SNAKES = window.innerWidth < 768 ? 4 : 8;
    const snakes = Array.from({ length: NUM_SNAKES }, (_, i) => new PentaSnake(i));

    function animateCanvas() {
        ctx.clearRect(0, 0, width, height);
        snakes.forEach(s => { s.update(); s.draw(); });
        requestAnimationFrame(animateCanvas);
    }
    animateCanvas();

    // =============================================
    // THEME SWITCHER
    // =============================================
    function setTheme(theme) {
        if (theme === 'primary') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        syncLoaderTheme(theme);
        // Burst animation
        triggerThemeBurst();
    }

    function syncLoaderTheme(theme){

        if(theme === 'light'){

            loader.style.background = '#F8F8F8';
            loaderLogo.src = 'assets/logo-light-removebg.png';

        }else if(theme === 'dark'){

            loader.style.background = '#082241';
            loaderLogo.src = 'assets/logo-primary-dark-removebg.png';

        }else{

            loader.style.background = '#FF0052';
            loaderLogo.src = 'assets/logo-primary-dark-removebg.png';

        }

    }

    // =============================================
    // THEME BURST PARTICLES
    // =============================================
    const burstCanvas = document.getElementById('theme-burst-canvas');
    const bctx = burstCanvas.getContext('2d');
    let burstParticles = [];

    function resizeBurstCanvas() {
        burstCanvas.width = window.innerWidth;
        burstCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeBurstCanvas);
    resizeBurstCanvas();

    function triggerThemeBurst() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 8;
            const colors = ['#FF0052', '#00ECA6', '#082241', '#ffffff'];
            burstParticles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 3 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1,
                decay: 0.02 + Math.random() * 0.03
            });
        }
        animateBurst();
    }

    let burstAnimating = false;
    function animateBurst() {
        if (burstAnimating) return;
        burstAnimating = true;
        function loop() {
            bctx.clearRect(0, 0, burstCanvas.width, burstCanvas.height);
            burstParticles = burstParticles.filter(p => p.life > 0);
            burstParticles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.15; // gravity
                p.life -= p.decay;
                bctx.beginPath();
                bctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
                bctx.fillStyle = p.color + Math.round(p.life * 255).toString(16).padStart(2, '0');
                bctx.fill();
            });
            if (burstParticles.length > 0) requestAnimationFrame(loop);
            else burstAnimating = false;
        }
        loop();
    }

    // =============================================
    // SWIPER HERO (Cards Effect + Drop Animation)
    // =============================================
    const swiperHero = new Swiper('.swiper-hero', {
        effect: 'cards',
        grabCursor: true,
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        cardsEffect: {
            perSlideOffset: 8, 
            perSlideRotate: 2, 
            rotate: true, 
            slideShadows: false, 
        },
        on: {
            slideChangeTransitionStart: function () {
                const prevSlide = this.slides[this.previousIndex];
                if (prevSlide) {
                    const img = prevSlide.querySelector('img');
                    gsap.fromTo(img, 
                        { y: 0, scale: 1 }, 
                        { y: 250, scale: 0.7, opacity: 0, duration: 0.5, ease: "power2.in", 
                          onComplete: () => { gsap.set(img, { y: 0, scale: 1, opacity: 1 }); } 
                        }
                    );
                }
                const activeSlide = this.slides[this.activeIndex];
                if (activeSlide) {
                    const img = activeSlide.querySelector('img');
                    gsap.fromTo(img, 
                        { scale: 0.8, y: -50, opacity:0 }, 
                        { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)" }
                    );
                }
            }
        }
    });

    // =============================================
    // SWIPER MASKOT
    // =============================================
    const swiperMaskot = new Swiper('.swiper-maskot', {
        slidesPerView: 'auto',
        centeredSlides: true,
        spaceBetween: 40,
        grabCursor: true,
        loop: false,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: { 768: { spaceBetween: 60 } }
    });

    // =============================================
    // FULL PAGE DETAIL (Disney+ Slide Up)
    // =============================================
    function openFullDetail(title, maskotImage, logoApp, bgColor) {
        document.getElementById('fdTitle').innerText = title;
        document.getElementById('fdCharacter').src = `assets/maskot/${maskotImage}.png`;
        document.getElementById('fdAppLogo').src = `assets/logoaplikasi/${logoApp}.png`;
        document.getElementById('fdLeftColor').style.backgroundColor = bgColor;
        const detailPage = document.getElementById('fullDetail');
        detailPage.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }

    function closeFullDetail() {
        document.getElementById('fullDetail').classList.remove('active');
        document.body.style.overflow = '';
    }

    // =============================================
    // GSAP SCROLL ANIMATIONS (Original + Enhanced)
    // =============================================
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.about-layout', {
        scrollTrigger: { trigger: '#about', start: "top 80%" },
        y: 50, opacity: 0, duration: 1, ease: "power3.out"
    });

    gsap.from('.testi-card', {
        scrollTrigger: { trigger: '#testimonials', start: "top 80%" },
        y: 50, opacity: 0, stagger: 0.2, duration: 0.8, ease: "power2.out"
    });
    
    gsap.from('.pdf-wrapper', {
        scrollTrigger: { trigger: '#pricing', start: "top 80%" },
        y: 50, opacity: 0, duration: 1, ease: "power4.out"
    });

    // Extra GSAP: hero title chars
    gsap.from('.hero-title', {
        scrollTrigger: { trigger: '#hero', start: "top 90%" },
        duration: 1.2, ease: 'power4.out'
    });

    // GSAP: maskot header
    gsap.from('.maskot-header', {
        scrollTrigger: { trigger: '#maskot-gallery', start: 'top 80%' },
        y: 40, opacity: 0, duration: 1, ease: 'power3.out'
    });

    // GSAP: about image parallax
    gsap.to('.inside-out-img', {
        scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: true },
        y: -50
    });

    // =============================================
    // CUSTOM CURSOR
    // =============================================
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';

        // Spotlight in hero
        const heroEl = document.getElementById('hero');
        const spotlight = document.getElementById('hero-spotlight');
        if (heroEl) {
            const rect = heroEl.getBoundingClientRect();
            if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
                spotlight.style.left = (e.clientX - rect.left) + 'px';
                spotlight.style.top = (e.clientY - rect.top) + 'px';
            }
        }
    });

    // Smooth ring follow
    function animateCursorRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        requestAnimationFrame(animateCursorRing);
    }
    animateCursorRing();

    // Hover state on interactive elements
    const hoverEls = document.querySelectorAll('a, button, .maskot-card, .theme-btn, .swiper-button-next, .swiper-button-prev, .fd-close');
    hoverEls.forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });

    // CURSOR TRAIL DOTS
    const trailDots = [];
    const TRAIL_COUNT = 8;
    for (let i = 0; i < TRAIL_COUNT; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail-dot';
        dot.style.width = (5 - i * 0.4) + 'px';
        dot.style.height = (5 - i * 0.4) + 'px';
        dot.style.opacity = (1 - i / TRAIL_COUNT) * 0.35;
        document.body.appendChild(dot);
        trailDots.push({ el: dot, x: 0, y: 0 });
    }
    function animateTrail() {
        let px = mouseX, py = mouseY;
        trailDots.forEach((td, i) => {
            td.x += (px - td.x) * (0.25 - i * 0.02);
            td.y += (py - td.y) * (0.25 - i * 0.02);
            td.el.style.left = td.x + 'px';
            td.el.style.top = td.y + 'px';
            px = td.x; py = td.y;
        });
        requestAnimationFrame(animateTrail);
    }
    animateTrail();

    // CLICK RIPPLE
    document.addEventListener('click', e => {
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });

    // =============================================
    // SCROLL PROGRESS BAR
    // =============================================
    const progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = pct + '%';
    });

    // =============================================
    // SCROLLSPY — Active nav link
    // =============================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.floating-nav a');
    function updateScrollSpy() {
        const scrollY = window.scrollY + window.innerHeight / 3;
        sections.forEach(sec => {
            const top = sec.offsetTop;
            const bottom = top + sec.offsetHeight;
            if (scrollY >= top && scrollY < bottom) {
                navLinks.forEach(a => {
                    a.classList.remove('active');
                    if (a.getAttribute('href') === '#' + sec.id) a.classList.add('active');
                });
            }
        });
    }
    window.addEventListener('scroll', updateScrollSpy);

    // =============================================
    // INTERSECTION OBSERVER — Reveal Animations
    // =============================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Trigger counter if applicable
                const num = entry.target.querySelector ? entry.target.querySelector('[data-target]') : null;
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

    // =============================================
    // ANIMATED COUNTERS
    // =============================================
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                entry.target.dataset.counted = true;
                const target = parseInt(entry.target.dataset.target);
                const suffix = entry.target.dataset.suffix || '';
                let start = 0;
                const duration = 1800;
                const stepTime = 16;
                const steps = duration / stepTime;
                const increment = target / steps;
                const timer = setInterval(() => {
                    start += increment;
                    if (start >= target) {
                        entry.target.textContent = target + suffix + '+';
                        clearInterval(timer);
                    } else {
                        entry.target.textContent = Math.floor(start) + suffix;
                    }
                }, stepTime);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

    // =============================================
    // HERO ANIMATIONS (after loader)
    // =============================================
    function initHeroAnimations() {
        // Split hero title into chars
        const heroTitle = document.getElementById('heroTitle');
        if (heroTitle) {
            const html = heroTitle.innerHTML;
            let newHtml = '';
            let delay = 0;
            for (let i = 0; i < html.length; i++) {
                const ch = html[i];
                if (ch === '<') {
                    // find closing >
                    const end = html.indexOf('>', i);
                    newHtml += html.substring(i, end + 1);
                    i = end;
                } else if (ch === ' ') {
                    newHtml += ' ';
                } else {
                    newHtml += `<span class="split-char" style="animation-delay: ${delay}ms">${ch}</span>`;
                    delay += 40;
                }
            }
            heroTitle.innerHTML = newHtml;
        }

        // Start typewriter after 0.5s
        setTimeout(startTypewriter, 500);

        // Hero particles
        spawnHeroParticles();
    }

    // =============================================
    // TYPEWRITER EFFECT
    // =============================================
    const typewriterPhrases = [
        'Hadiah Paling Unik!',
        'Bikin Orang Kaget!',
        'Aesthetic & Realistis.',
        'Order via WhatsApp.',
        'Special Moment Creator.',
    ];
    let twIndex = 0, twChar = 0, twDeleting = false;
    const twEl = document.getElementById('typewriterText');

    function startTypewriter() {
        function type() {
            if (!twEl) return;
            const current = typewriterPhrases[twIndex];
            if (!twDeleting) {
                twChar++;
                twEl.textContent = current.substring(0, twChar);
                if (twChar === current.length) {
                    twDeleting = true;
                    setTimeout(type, 1800);
                    return;
                }
            } else {
                twChar--;
                twEl.textContent = current.substring(0, twChar);
                if (twChar === 0) {
                    twDeleting = false;
                    twIndex = (twIndex + 1) % typewriterPhrases.length;
                }
            }
            const speed = twDeleting ? 50 : 90;
            setTimeout(type, speed);
        }
        type();
    }

    // =============================================
    // HERO FLOATING PARTICLES
    // =============================================
    function spawnHeroParticles() {
        const container = document.getElementById('hero-particles');
        if (!container) return;
        const colors = ['#FF0052', '#00ECA6', '#082241', 'rgba(255,255,255,0.6)'];
        for (let i = 0; i < 25; i++) {
            const p = document.createElement('div');
            p.className = 'hero-particle';
            const size = 3 + Math.random() * 8;
            p.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                animation-duration: ${6 + Math.random() * 10}s;
                animation-delay: ${Math.random() * 8}s;
            `;
            container.appendChild(p);
        }
    }

    // =============================================
    // MAGNETIC BUTTON EFFECT
    // =============================================
    document.querySelectorAll('.magnetic').forEach(el => {
        el.addEventListener('mousemove', e => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) * 0.25;
            const dy = (e.clientY - cy) * 0.25;
            el.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0,0)';
        });
    });

    // =============================================
    // 3D CARD TILT EFFECT on Maskot Cards
    // =============================================
    // Auto spark setiap 4 detik pada slide aktif (no hover needed)
    setInterval(() => {
        const activeCard = document.querySelector('.swiper-slide-active .maskot-card');
        if (!activeCard) return;
        const sparksContainer = activeCard.querySelector('.card-particles');
        if (!sparksContainer) return;
        for (let i = 0; i < 10; i++) {
            const spark = document.createElement('div');
            spark.className = 'card-spark';
            const angle = Math.random() * 360;
            const dist = 40 + Math.random() * 80;
            spark.style.cssText = `
                left: ${10 + Math.random() * 80}%;
                top: ${10 + Math.random() * 80}%;
                --tx: ${Math.cos(angle * Math.PI / 180) * dist}px;
                --ty: ${Math.sin(angle * Math.PI / 180) * dist}px;
                animation-delay: ${Math.random() * 0.3}s;
            `;
            sparksContainer.appendChild(spark);
            setTimeout(() => spark.remove(), 900);
        }
    }, 4000);
    
    document.querySelectorAll('.maskot-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            const tiltX = dy * 12;  // max 12deg tilt
            const tiltY = -dx * 12;
            card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
            // Highlight shine
            const shine = 100 + dx * 30 + '%';
            card.style.backgroundImage = card.style.backgroundImage || '';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });

        // Spark particles on hover
        card.addEventListener('mouseenter', () => {
            const sparksContainer = card.querySelector('.card-particles');
            for (let i = 0; i < 8; i++) {
                const spark = document.createElement('div');
                spark.className = 'card-spark';
                const angle = Math.random() * 360;
                const dist = 40 + Math.random() * 60;
                spark.style.cssText = `
                    left: ${20 + Math.random() * 60}%;
                    top: ${20 + Math.random() * 60}%;
                    --tx: ${Math.cos(angle * Math.PI / 180) * dist}px;
                    --ty: ${Math.sin(angle * Math.PI / 180) * dist}px;
                    animation-delay: ${Math.random() * 0.2}s;
                `;
                sparksContainer.appendChild(spark);
                setTimeout(() => spark.remove(), 800);
            }
        });
    });

    // =============================================
    // TEXT SCRAMBLE on Section Headers
    // =============================================
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
    function scrambleText(el, originalText) {
        let iteration = 0;
        const maxIter = originalText.length * 3;
        const interval = setInterval(() => {
            el.textContent = originalText
                .split('')
                .map((ch, idx) => {
                    if (ch === ' ') return ' ';
                    if (idx < Math.floor(iteration / 3)) return ch;
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');
            iteration++;
            if (iteration > maxIter) {
                el.textContent = originalText;
                clearInterval(interval);
            }
        }, 30);
    }

    const scrambleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.scrambled) {
                entry.target.dataset.scrambled = true;
                const original = entry.target.dataset.original || entry.target.textContent;
                scrambleText(entry.target, original);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.scramble-text').forEach(el => scrambleObserver.observe(el));

    // =============================================
    // MOUSE PARALLAX on Hero Section
    // =============================================
    document.addEventListener('mousemove', e => {
        const nx = (e.clientX / window.innerWidth - 0.5);
        const ny = (e.clientY / window.innerHeight - 0.5);
        const swiperEl = document.querySelector('.swiper-hero');
        if (swiperEl) {
            swiperEl.style.transform = `translate(${nx * 12}px, ${ny * 8}px)`;
        }
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.style.transform = `translate(${nx * -6}px, ${ny * -4}px)`;
        }
        const statsRow = document.querySelector('.stats-row');
        if (statsRow) {
            statsRow.style.transform = `translate(${nx * 4}px, ${ny * 3}px)`;
        }
    });

    // =============================================
    // SCROLL-TRIGGERED EXTRA GSAP
    // =============================================
    // Section titles animate in
    ['#about', '#maskot-gallery', '#testimonials', '#pricing'].forEach(id => {
        gsap.from(`${id} h2`, {
            scrollTrigger: { trigger: id, start: 'top 85%' },
            y: 40, opacity: 0, duration: 0.9, ease: 'power3.out'
        });
    });

    // PDF wrapper glow pulse
    gsap.to('.pdf-wrapper', {
        scrollTrigger: { trigger: '#pricing', start: 'top 70%' },
        boxShadow: '0 20px 80px rgba(255,0,82,0.2)',
        duration: 1.5, delay: 0.5, ease: 'power2.out'
    });

    // Footer text
    gsap.from('footer p', {
        scrollTrigger: { trigger: 'footer', start: 'top 90%' },
        y: 20, opacity: 0, stagger: 0.2, duration: 0.8
    });

    // =============================================
    // DYNAMIC NAV BORDER GLOW on scroll
    // =============================================
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('mainNav');
        if (window.scrollY > 100) {
            nav.style.boxShadow = '0 10px 40px rgba(255,0,82,0.2)';
        } else {
            nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
        }
    });