// ═══════════════════════════════════════════════════════
// FLAMES '26 — INFERNO PARTICLE ENGINE v2.0
// ═══════════════════════════════════════════════════════

const canvas = document.getElementById("particles-engine");
if (canvas) {
    const ctx = canvas.getContext("2d");
    let w, h;
    let embers = [];
    let sparks = [];
    let smokeParticles = [];
    let time = 0;

    function setSize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', setSize);
    setSize();

    // ── EMBER (rising fire particle) ──────────────────────
    class Ember {
        constructor(options = {}) {
            this.reset(options);
        }
        reset(options = {}) {
            // Cluster near bottom or spread across
            const cluster = Math.random() < 0.6;
            if (cluster) {
                // Dense bottom emitters
                const cx = w * (0.15 + Math.random() * 0.7);
                this.x = cx + (Math.random() - 0.5) * 80;
                this.y = h + Math.random() * 60;
            } else {
                this.x = Math.random() * w;
                this.y = h + Math.random() * 120;
            }
            this.vx = (Math.random() - 0.5) * 0.9;
            this.vy = -(Math.random() * 2.8 + 0.8);
            this.size = Math.random() * 3.2 + 0.3;
            this.maxSize = this.size;
            this.opacity = Math.random() * 0.7 + 0.2;
            // Color from white-hot → orange → red → deep red
            this.hue = Math.random() * 35;        // 0=red, 30=orange
            this.sat = 95 + Math.random() * 5;
            this.lit = 50 + Math.random() * 30;   // some near-white
            this.life = 1;
            this.decay = Math.random() * 0.006 + 0.002;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = (Math.random() - 0.5) * 0.06;
            this.flicker = Math.random() < 0.3;
        }
        update() {
            this.life -= this.decay;
            this.wobble += this.wobbleSpeed;
            this.x += this.vx + Math.sin(this.wobble) * 0.4;
            this.y += this.vy;
            this.vy -= 0.008; // buoyancy
            this.size = this.maxSize * this.life;
            this.opacity = this.life * (this.flicker ? (0.6 + Math.sin(time * 0.3 + this.wobble) * 0.4) : 1);
            if (this.life <= 0 || this.y < -30) this.reset();
        }
        draw() {
            if (this.size < 0.1) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity * 0.8));
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
            grad.addColorStop(0, `hsl(${this.hue + 10}, ${this.sat}%, ${Math.min(98, this.lit + 20)}%)`);
            grad.addColorStop(0.4, `hsl(${this.hue}, ${this.sat}%, ${this.lit}%)`);
            grad.addColorStop(1, `hsla(${this.hue - 5}, ${this.sat}%, ${this.lit - 20}%, 0)`);
            ctx.fillStyle = grad;
            ctx.shadowColor = `hsl(${this.hue}, 100%, 60%)`;
            ctx.shadowBlur = this.size * 6;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ── SPARK (bright fast flash) ─────────────────────────
    class Spark {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = w * (0.1 + Math.random() * 0.8);
            this.y = h * (0.5 + Math.random() * 0.5);
            const angle = -(Math.random() * Math.PI * 0.8 + Math.PI * 0.1);
            const speed = Math.random() * 5 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = Math.random() * 1.5 + 0.5;
            this.life = 1;
            this.decay = Math.random() * 0.04 + 0.025;
            this.hue = Math.random() * 30;
            this.trail = [];
        }
        update() {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 8) this.trail.shift();
            this.life -= this.decay;
            this.vx *= 0.97;
            this.vy += 0.12; // gravity
            this.x += this.vx;
            this.y += this.vy;
            if (this.life <= 0 || this.y > h + 20) this.reset();
        }
        draw() {
            if (this.trail.length < 2) return;
            ctx.save();
            ctx.globalAlpha = this.life * 0.9;
            ctx.strokeStyle = `hsl(${this.hue + 15}, 100%, 75%)`;
            ctx.lineWidth = this.size * this.life;
            ctx.shadowColor = `hsl(${this.hue}, 100%, 60%)`;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
            ctx.restore();
        }
    }

    // ── HEAT SMOKE ────────────────────────────────────────
    class Smoke {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = w * (0.2 + Math.random() * 0.6);
            this.y = h * 0.4 + Math.random() * h * 0.3;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = -(Math.random() * 0.4 + 0.1);
            this.size = Math.random() * 60 + 20;
            this.life = 1;
            this.decay = Math.random() * 0.002 + 0.001;
            this.opacity = Math.random() * 0.04 + 0.01;
        }
        update() {
            this.life -= this.decay;
            this.x += this.vx;
            this.y += this.vy;
            this.size += 0.5;
            if (this.life <= 0 || this.y < -100) this.reset();
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity * this.life;
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            grad.addColorStop(0, 'rgba(80,30,0,0.8)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ── GROUND GLOW POOLS ─────────────────────────────────
    function drawGroundFire() {
        const numPools = 5;
        for (let i = 0; i < numPools; i++) {
            const cx = w * (0.1 + i * 0.2);
            const cy = h;
            const radius = 80 + Math.sin(time * 0.02 + i) * 20;
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            const flicker = 0.08 + Math.sin(time * 0.05 + i * 1.3) * 0.04;
            grad.addColorStop(0, `rgba(255, 60, 0, ${flicker})`);
            grad.addColorStop(0.4, `rgba(255, 40, 0, ${flicker * 0.4})`);
            grad.addColorStop(1, 'transparent');
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ── INIT ──────────────────────────────────────────────
    // Big batch of embers
    for (let i = 0; i < 350; i++) {
        const e = new Ember();
        e.y = Math.random() * h;
        e.life = Math.random();
        embers.push(e);
    }
    // Sparks
    for (let i = 0; i < 40; i++) {
        const s = new Spark();
        s.y = h * (0.4 + Math.random() * 0.6);
        s.life = Math.random();
        sparks.push(s);
    }
    // Smoke
    for (let i = 0; i < 25; i++) {
        const sm = new Smoke();
        sm.life = Math.random();
        smokeParticles.push(sm);
    }

    // ── RENDER LOOP ───────────────────────────────────────
    function loop() {
        time++;
        ctx.clearRect(0, 0, w, h);

        // Draw heat smoke first (background layer)
        smokeParticles.forEach(s => { s.update(); s.draw(); });

        // Ground pools
        drawGroundFire();

        // Embers
        embers.forEach(e => { e.update(); e.draw(); });

        // Sparks on top
        sparks.forEach(s => { s.update(); s.draw(); });

        requestAnimationFrame(loop);
    }
    loop();
}

// ── MOBILE MENU TOGGLE ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }
});
