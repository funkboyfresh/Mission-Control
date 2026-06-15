/**
 * SINGULARITY-TETHER.JS [ S-TIER MODULE ]
 * Weightless Falling Orbit-Assistant Momentum Slingshot.
 * Controls: Press and Hold to drop singularity wells and warp trajectory paths.
 */

const singularityTether = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    player: { x: 100, y: 200, vx: 4, vy: 0, radius: 10 },
    gravityWell: null,
    gates: [],
    isHolding: false
};

singularityTether.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'CHRONOS', color: '#ffe55c' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.gates = [];
    this.gravityWell = null;
    this.isHolding = false;
    
    this.player.x = 100;
    this.player.y = 200;
    this.player.vx = 4;
    this.player.vy = 0;
    
    this.resizeCanvas();
    
    const trackInput = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        this.gravityWell = { x: clientX - rect.left, y: clientY - rect.top };
        this.isHolding = true;
    };
    
    this._downRef = (e) => { e.preventDefault(); trackInput(e); };
    this._upRef = () => { this.isHolding = false; this.gravityWell = null; };
    
    this.canvas.addEventListener('mousedown', this._downRef);
    this.canvas.addEventListener('touchstart', this._downRef, { passive: false });
    window.addEventListener('mouseup', this._upRef);
    window.addEventListener('touchend', this._upRef);
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

singularityTether.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

singularityTether.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

singularityTether.updatePhysics = function() {
    // Generate passing horizontal clearance rings obstacles
    if (this.frameCount % 50 === 0) {
        let gapY = Math.random() * (this.canvas.height - 240) + 120;
        this.gates.push({ x: this.canvas.width + 40, gapY: gapY, gapSize: 130, passed: false });
    }
    
    if (this.isHolding && this.gravityWell) {
        // Calculate gravitational centripetal orbital pull velocity forces
        let ang = Math.atan2(this.gravityWell.y - this.player.y, this.gravityWell.x - this.player.x);
        this.player.vx += Math.cos(ang) * 0.75;
        this.player.vy += Math.sin(ang) * 0.75;
        
        if (this.frameCount % 8 === 0 && this.ammoPool > 0) {
            this.ammoPool--;
            const hudAmmo = document.getElementById('game-hud-ammo');
            if (hudAmmo) hudAmmo.innerText = this.ammoPool;
        }
    } else {
        // Flat systemic inertia stabilization dampeners
        this.player.vy += 0.08;
    }
    
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;
    
    // Stabilize speed ceilings
    let speed = Math.hypot(this.player.vx, this.player.vy);
    if (speed > 11) { this.player.vx = (this.player.vx / speed) * 11; this.player.vy = (this.player.vy / speed) * 11; }
    
    // Standard screen edge reflections
    if (this.player.y < 15) { this.player.y = 15; this.player.vy *= -0.7; }
    if (this.player.y > this.canvas.height - 15) { this.player.y = this.canvas.height - 15; this.player.vy *= -0.7; }
    
    // Constant relative environment scroll back tracking
    const worldScroll = 4.5;
    this.player.x -= worldScroll;
    
    this.gates.forEach(g => {
        g.x -= worldScroll;
        
        // Assess gap clearance paths metrics
        if (!g.passed && g.x < this.player.x) {
            g.passed = true;
            let withinGap = (this.player.y > g.gapY && this.player.y < g.gapY + g.gapSize);
            if (withinGap) {
                let reward = this.isApexEvent ? 40 : 20;
                this.bonusScrapEarned += reward;
                const hudScrap = document.getElementById('game-hud-scrap');
                if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            } else {
                if (this.ammoPool > 15) this.ammoPool -= 15;
                const hudAmmo = document.getElementById('game-hud-ammo');
                if (hudAmmo) hudAmmo.innerText = this.ammoPool;
            }
        }
    });
    
    for (let i = this.gates.length - 1; i >= 0; i--) {
        if (this.gates[i].x < -60) this.gates.splice(i, 1);
    }
};

singularityTether.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Clearance Barriers
    ctx.fillStyle = this.biome.color;
    ctx.globalAlpha = 0.4;
    this.gates.forEach(g => {
        // Top Wall panel block
        ctx.fillRect(g.x - 15, 0, 30, g.gapY);
        // Bottom Wall panel block
        ctx.fillRect(g.x - 15, g.gapY + g.gapSize, 30, this.canvas.height);
    });
    ctx.globalAlpha = 1.0;
    
    // Draw Tether Singular Anchor Node
    if (this.isHolding && this.gravityWell) {
        ctx.save();
        ctx.strokeStyle = '#00ffaa'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(this.player.x, this.player.y); ctx.lineTo(this.gravityWell.x, this.gravityWell.y); ctx.stroke();
        
        ctx.fillStyle = '#00ffaa'; ctx.shadowBlur = 15; ctx.shadowColor = '#00ffaa';
        ctx.beginPath(); ctx.arc(this.gravityWell.x, this.gravityWell.y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    
    // Draw Player Kinetic Core Node
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10; ctx.shadowColor = '#ffffff';
    ctx.beginPath(); ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
};

singularityTether.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
    }
    window.removeEventListener('mouseup', this._upRef);
    window.removeEventListener('touchend', this._upRef);
};
