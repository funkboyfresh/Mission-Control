/**
 * SOLAR-COLLECTOR.JS [ S-TIER PREPARATION MODULE ]
 * Rhythmic Solar Corona Particle Siphon Matrix.
 * Controls: Tap exactly when the sweeping frequency bar intersects drifting flare nodes.
 */

const solarCollector = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    sweepX: 0,
    sweepDir: 1,
    flares: []
};

solarCollector.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'MAGMA', color: '#ff3366' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.flares = [];
    this.sweepX = 50;
    this.sweepDir = 1;
    this.resizeCanvas();
    
    this._tapRef = (e) => {
        e.preventDefault();
        this.attemptParticleSiphon();
    };
    
    this.canvas.addEventListener('mousedown', this._tapRef);
    this.canvas.addEventListener('touchstart', this._tapRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

solarCollector.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

solarCollector.attemptParticleSiphon = function() {
    if (this.flares.length === 0) return;
    
    let hitIndex = -1;
    for (let i = 0; i < this.flares.length; i++) {
        let f = this.flares[i];
        if (Math.abs(this.sweepX - f.x) < 25) { hitIndex = i; break; }
    }
    
    if (hitIndex !== -1) {
        let gain = this.isApexEvent ? 30 : 15;
        this.bonusScrapEarned += gain;
        this.flares.splice(hitIndex, 1);
        
        const hudScrap = document.getElementById('game-hud-scrap');
        if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
    } else {
        if (this.ammoPool > 5) this.ammoPool -= 5;
        const hudAmmo = document.getElementById('game-hud-ammo');
        if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    }
};

solarCollector.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

solarCollector.updatePhysics = function() {
    // Oscillate frequency scanning laser bar back and forth
    this.sweepX += (this.isApexEvent ? 6 : 4) * this.sweepDir;
    if (this.sweepX > this.canvas.width - 40 || this.sweepX < 40) this.sweepDir *= -1;
    
    // Spawn drifting raw flare ions drifting downward
    if (this.frameCount % 40 === 0 && this.flares.length < 8) {
        this.flares.push({
            x: Math.random() * (this.canvas.width - 120) + 60,
            y: -20,
            speed: Math.random() * 2 + 1
        });
    }
    
    this.flares.forEach(f => f.y += f.speed);
    for (let i = this.flares.length - 1; i >= 0; i--) {
        if (this.flares[i].y > this.canvas.height + 20) this.flares.splice(i, 1);
    }
};

solarCollector.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Sweeping Linear Collector Beam
    ctx.save();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
    ctx.shadowBlur = 15; ctx.shadowColor = this.biome.color;
    ctx.beginPath(); ctx.moveTo(this.sweepX, 0); ctx.lineTo(this.sweepX, this.canvas.height); ctx.stroke();
    ctx.restore();
    
    // Draw Drifting Ion Clusters
    ctx.fillStyle = this.biome.color;
    this.flares.forEach(f => {
        ctx.beginPath(); ctx.arc(f.x, f.y, 8, 0, Math.PI * 2); ctx.fill();
    });
};

solarCollector.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._tapRef);
        this.canvas.removeEventListener('touchstart', this._tapRef);
    }
};
