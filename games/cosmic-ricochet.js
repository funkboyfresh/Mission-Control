/**
 * COSMIC-RICOCHET.JS [ S-TIER MODULE ]
 * Hyper-Velocity Magnetic Space Pinball Simulator.
 * Controls: Tap anywhere to create a shockwave pulse pushing your ship sphere.
 */

const cosmicRicochet = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    player: { x: 200, y: 200, vx: 5, vy: -5, radius: 14 },
    bumpers: [],
    particles: []
};

cosmicRicochet.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'FERROUS', color: '#cc5500' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.bumpers = [];
    this.particles = [];
    this.resizeCanvas();
    
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height / 3;
    this.player.vx = 6;
    this.player.vy = -4;
    
    // Spawn static circular spatial score bumpers
    const count = 6;
    for (let i = 0; i < count; i++) {
        this.bumpers.push({
            x: (this.canvas.width / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 40,
            y: this.canvas.height / 2 + (Math.random() - 0.5) * 160,
            radius: 25,
            pulseGlow: 0
        });
    }
    
    this._pulseRef = (e) => {
        e.preventDefault();
        if (this.ammoPool < 5) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const mx = clientX - rect.left;
        const my = clientY - rect.top;
        
        // Push player directly away from the touch/click blast vector point
        const ang = Math.atan2(this.player.y - my, this.player.x - mx);
        this.player.vx = Math.cos(ang) * 14;
        this.player.vy = Math.sin(ang) * 14;
        
        this.ammoPool -= 5;
        const hudAmmo = document.getElementById('game-hud-ammo');
        if (hudAmmo) hudAmmo.innerText = this.ammoPool;
        this.triggerImpactSparks(mx, my, '#ffffff');
    };
    
    this.canvas.addEventListener('mousedown', this._pulseRef);
    this.canvas.addEventListener('touchstart', this._pulseRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

cosmicRicochet.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

cosmicRicochet.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

cosmicRicochet.updatePhysics = function() {
    // Apply minor constant space drift gravity downward
    this.player.vy += 0.15;
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;
    
    // Friction dampening
    this.player.vx *= 0.995;
    this.player.vy *= 0.995;
    
    const r = this.player.radius;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Reflect off screen border lines
    if (this.player.x < r) { this.player.x = r; this.player.vx *= -1; }
    if (this.player.x > w - r) { this.player.x = w - r; this.player.vx *= -1; }
    if (this.player.y < r) { this.player.y = r; this.player.vy *= -1; }
    if (this.player.y > h - r) { this.player.y = h - r; this.player.vy *= -0.8; }
    
    // Check circular bumper impact nodes
    this.bumpers.forEach(b => {
        if (b.pulseGlow > 0) b.pulseGlow -= 0.05;
        
        let dist = Math.hypot(this.player.x - b.x, this.player.y - b.y);
        if (dist < b.radius + r) {
            // Elastic collision bouncing vector math
            const ang = Math.atan2(this.player.y - b.y, this.player.x - b.x);
            this.player.vx = Math.cos(ang) * 12;
            this.player.vy = Math.sin(ang) * 12;
            b.pulseGlow = 1.0;
            
            let payout = this.isApexEvent ? 30 : 15;
            this.bonusScrapEarned += payout;
            const hudScrap = document.getElementById('game-hud-scrap');
            if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            this.triggerImpactSparks(b.x, b.y, this.biome.color);
        }
    });
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
        let p = this.particles[i];
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.04;
        if (p.alpha <= 0) this.particles.splice(i, 1);
    }
};

cosmicRicochet.triggerImpactSparks = function(x, y, color) {
    for (let i = 0; i < 8; i++) {
        let a = Math.random() * Math.PI * 2;
        let s = Math.random() * 4 + 2;
        this.particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, alpha: 1, color: color });
    }
};

cosmicRicochet.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Pinball Bumpers
    this.bumpers.forEach(b => {
        ctx.save();
        ctx.strokeStyle = this.biome.color;
        ctx.lineWidth = b.pulseGlow > 0 ? 4 : 2;
        ctx.fillStyle = b.pulseGlow > 0 ? `${this.biome.color}33` : 'transparent';
        ctx.shadowBlur = b.pulseGlow * 20; ctx.shadowColor = this.biome.color;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
    });
    
    // Draw Particles
    this.particles.forEach(p => {
        ctx.save(); ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3); ctx.restore();
    });
    
    // Draw Pinball Sphere Core
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 15; ctx.shadowColor = this.biome.color;
    ctx.beginPath(); ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
};

cosmicRicochet.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._pulseRef);
        this.canvas.removeEventListener('touchstart', this._pulseRef);
    }
};
