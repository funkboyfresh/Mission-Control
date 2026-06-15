/**
 * SOLAR-SURF.JS [ S-TIER MODULE ]
 * Wave-Rider Solar Flare Gravity Slingshot Surfer.
 * Controls: Touch/Hold to dive into wave troughs, Release to slingshot into orbit.
 */

const solarSurf = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    player: { x: 120, y: 200, vy: 0, radius: 12 },
    scrap: [],
    particles: [],
    isHolding: false
};

solarSurf.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'MAGMA', color: '#ff3366' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.scrap = [];
    this.particles = [];
    this.isHolding = false;
    this.player.y = 200;
    this.player.vy = 0;
    
    this.resizeCanvas();
    
    this._downRef = (e) => { e.preventDefault(); this.isHolding = true; };
    this._upRef = () => { this.isHolding = false; };
    
    this.canvas.addEventListener('mousedown', this._downRef);
    this.canvas.addEventListener('touchstart', this._downRef, { passive: false });
    window.addEventListener('mouseup', this._upRef);
    window.addEventListener('touchend', this._upRef);
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

solarSurf.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

solarSurf.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

solarSurf.updatePhysics = function() {
    const h = this.canvas.height;
    const waveBaseline = h * 0.7;
    
    // Generate mathematical wave line trajectory point
    const targetWaveY = waveBaseline + Math.sin(this.frameCount * 0.05) * 60;
    
    if (this.isHolding) {
        // Force pull down into wave valley
        this.player.vy += 0.8;
        if (this.frameCount % 10 === 0 && this.ammoPool > 0) {
            this.ammoPool--;
            const hudAmmo = document.getElementById('game-hud-ammo');
            if (hudAmmo) hudAmmo.innerText = this.ammoPool;
        }
    } else {
        // Natural upward buoyancy / stasis drift
        if (this.player.y > targetWaveY - 20) {
            this.player.vy -= 1.4; // Slingshot lift velocity kick out
            this.triggerPlasmaSparks(this.player.x, this.player.y, '#ffffff');
        } else {
            this.player.vy += 0.25; // Standard space weight acceleration falling back
        }
    }
    
    this.player.y += this.player.vy;
    this.player.vy *= 0.96; // Atmospheric friction dampening
    
    // Enforce display layout limits
    if (this.player.y < 20) { this.player.y = 20; this.player.vy = 0; }
    if (this.player.y > h - 40) { this.player.y = h - 40; this.player.vy = 0; }
    
    // Spawn floating high-altitude alloy dust elements
    if (this.frameCount % 20 === 0) {
        this.scrap.push({
            x: this.canvas.width + 30,
            y: Math.random() * (waveBaseline - 180) + 40,
            speed: 5
        });
    }
    
    // Scroll and gather debris targets
    for (let i = this.scrap.length - 1; i >= 0; i--) {
        let s = this.scrap[i];
        s.x -= s.speed;
        
        if (Math.hypot(this.player.x - s.x, this.player.y - s.y) < 22) {
            let gain = this.isApexEvent ? 24 : 12;
            this.bonusScrapEarned += gain;
            const hudScrap = document.getElementById('game-hud-scrap');
            if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            this.triggerPlasmaSparks(s.x, s.y, '#00ffaa');
            this.scrap.splice(i, 1);
            continue;
        }
        if (s.x < -30) this.scrap.splice(i, 1);
    }
    
    // Process trailing spark decay
    for (let i = this.particles.length - 1; i >= 0; i--) {
        let p = this.particles[i];
        p.x -= 3; p.y += p.vy; p.alpha -= 0.05;
        if (p.alpha <= 0) this.particles.splice(i, 1);
    }
};

solarSurf.triggerPlasmaSparks = function(x, y, color) {
    for (let i = 0; i < 4; i++) {
        this.particles.push({
            x: x, y: y,
            vy: (Math.random() - 0.5) * 4,
            alpha: 1.0, color: color
        });
    }
};

solarSurf.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const h = this.canvas.height;
    const w = this.canvas.width;
    const waveBaseline = h * 0.7;
    
    // Render rolling Plasmatic Core Wave surface
    ctx.save();
    ctx.fillStyle = this.biome.color;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) {
        let y = waveBaseline + Math.sin((this.frameCount + x) * 0.05) * 60;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Render Particles
    this.particles.forEach(p => {
        ctx.save(); ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3); ctx.restore();
    });
    
    // Render high-altitude scrap shard chains
    ctx.fillStyle = '#00ffaa';
    this.scrap.forEach(s => {
        ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI * 2); ctx.fill();
    });
    
    // Render Pilot Surfer Vessel
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 15; ctx.shadowColor = this.biome.color;
    ctx.beginPath(); ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
};

solarSurf.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
    }
    window.removeEventListener('mouseup', this._upRef);
    window.removeEventListener('touchend', this._upRef);
};
