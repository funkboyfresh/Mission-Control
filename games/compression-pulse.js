/**
 * COMPRESSION-PULSE.JS [ S-TIER MODULE ]
 * Radial 360 Containment Gravity Singularity Shockwave.
 * Controls: Press/Hold down to charge vortex, Release to trigger a shockwave blast pulse.
 */

const compressionPulse = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    player: { x: 0, y: 0, radius: 14 },
    enemies: [],
    blastRadius: 0,
    maxBlast: 160,
    isHolding: false
};

compressionPulse.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'VOID', color: '#a200ff' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.enemies = [];
    this.blastRadius = 0;
    this.isHolding = false;
    
    this.resizeCanvas();
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height / 2;
    
    this._downRef = (e) => { e.preventDefault(); this.isHolding = true; };
    this._upRef = () => { if (this.isHolding) { this.isHolding = false; this.detonateCompressionWave(); } };
    
    this.canvas.addEventListener('mousedown', this._downRef);
    this.canvas.addEventListener('touchstart', this._downRef, { passive: false });
    window.addEventListener('mouseup', this._upRef);
    window.addEventListener('touchend', this._upRef);
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

compressionPulse.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

compressionPulse.detonateCompressionWave = function() {
    if (this.ammoPool < 10) return;
    
    this.ammoPool -= 10;
    const hudAmmo = document.getElementById('game-hud-ammo');
    if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    
    this.blastRadius = 15; // Ignition frame radius
};

compressionPulse.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

compressionPulse.updatePhysics = function() {
    const cx = this.player.x;
    const cy = this.player.y;
    
    // Spawn outer drone points rolling inward
    if (this.frameCount % (this.isApexEvent ? 18 : 35) === 0) {
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.max(this.canvas.width, this.canvas.height) * 0.55;
        this.enemies.push({
            x: cx + Math.cos(ang) * dist,
            y: cy + Math.sin(ang) * dist,
            speed: this.isApexEvent ? 3.5 : 2.0
        });
    }
    
    // Process expansion of blast radius shockwave lines
    if (this.blastRadius > 0) {
        this.blastRadius += 8;
        
        // Wipe enemies within wave envelope footprint boundaries
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let e = this.enemies[i];
            let d = Math.hypot(e.x - cx, e.y - cy);
            if (d < this.blastRadius && d > this.blastRadius - 30) {
                let prize = this.isApexEvent ? 24 : 12;
                this.bonusScrapEarned += prize;
                this.enemies.splice(i, 1);
            }
        }
        
        if (this.blastRadius > this.maxBlast) this.blastRadius = 0; // Terminate wave loop
    }
    
    // Process moving elements inward
    for (let i = this.enemies.length - 1; i >= 0; i--) {
        let e = this.enemies[i];
        let ang = Math.atan2(cy - e.y, cx - e.x);
        
        if (this.isHolding) {
            // Singularity pull: drag them in much faster toward the hull center core
            e.x += Math.cos(ang) * (e.speed * 2.5);
            e.y += Math.sin(ang) * (e.speed * 2.5);
        } else {
            e.x += Math.cos(ang) * e.speed;
            e.y += Math.sin(ang) * e.speed;
        }
        
        // Core impact tracking spend values on penetration
        if (Math.hypot(cx - e.x, cy - e.y) < this.player.radius) {
            if (this.ammoPool > 12) this.ammoPool -= 12;
            const hudAmmo = document.getElementById('game-hud-ammo');
            if (hudAmmo) hudAmmo.innerText = this.ammoPool;
            this.enemies.splice(i, 1);
        }
    }
};

compressionPulse.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const cx = this.player.x;
    const cy = this.player.y;
    
    // Draw Expanding Kinetic Pulse Ring field lines
    if (this.blastRadius > 0) {
        ctx.save();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4;
        ctx.shadowBlur = 25; ctx.shadowColor = this.biome.color;
        ctx.beginPath(); ctx.arc(cx, cy, this.blastRadius, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    }
    
    // Draw Inward Collapsing Threat Particles
    ctx.fillStyle = '#ff3366';
    this.enemies.forEach(e => {
        ctx.beginPath(); ctx.arc(e.x, e.y, 5, 0, Math.PI * 2); ctx.fill();
    });
    
    // Draw Gravity Singularity Pilot Core platform
    ctx.save();
    ctx.fillStyle = this.isHolding ? `${this.biome.color}55` : '#ffffff';
    ctx.strokeStyle = this.biome.color; ctx.lineWidth = 2;
    ctx.shadowBlur = 15; ctx.shadowColor = this.biome.color;
    ctx.beginPath(); ctx.arc(cx, cy, this.isHolding ? 45 : this.player.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
};

compressionPulse.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
    }
    window.removeEventListener('mouseup', this._upRef);
    window.removeEventListener('touchend', this._upRef);
};
