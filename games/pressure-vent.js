/**
 * PRESSURE-VENT.JS [ S-TIER PREPARATION MODULE ]
 * Core Valve Pressure Calibration Meter.
 * Controls: Tap screen to discharge pressure lines while bar aligns in center zone fields.
 */

const pressureVent = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    gaugeY: 200,
    gaugeDir: 1
};

pressureVent.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'ICE', color: '#00e5ff' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    
    this.gaugeY = 200;
    this.gaugeDir = 1;
    this.resizeCanvas();
    
    this._ventRef = (e) => {
        e.preventDefault();
        this.dischargeCryoVent();
    };
    
    this.canvas.addEventListener('mousedown', this._ventRef);
    this.canvas.addEventListener('touchstart', this._ventRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

pressureVent.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

pressureVent.dischargeCryoVent = function() {
    const cy = this.canvas.height / 2;
    let errorMargin = Math.abs(this.gaugeY - cy);
    
    if (errorMargin < 25) {
        let bonus = this.isApexEvent ? 32 : 16;
        this.bonusScrapEarned += bonus;
        const hudScrap = document.getElementById('game-hud-scrap');
        if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
    } else {
        if (this.ammoPool > 6) this.ammoPool -= 6;
        const hudAmmo = document.getElementById('game-hud-ammo');
        if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    }
};

pressureVent.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

pressureVent.updatePhysics = function() {
    const speed = this.isApexEvent ? 8 : 5.5;
    this.gaugeY += speed * this.gaugeDir;
    
    if (this.gaugeY < 40 || this.gaugeY > this.canvas.height - 40) {
        this.gaugeDir *= -1;
    }
};

pressureVent.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Draw Safe Vent Target Perimeter
    ctx.fillStyle = `${this.biome.color}22`;
    ctx.fillRect(cx - 40, cy - 25, 80, 50);
    ctx.strokeStyle = this.biome.color; ctx.lineWidth = 1;
    ctx.strokeRect(cx - 40, cy - 25, 80, 50);
    
    // Draw Oscillating Core Pressure Needle Line
    ctx.save();
    ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 10; ctx.shadowColor = '#ffffff';
    ctx.fillRect(cx - 50, this.gaugeY - 3, 100, 6);
    ctx.restore();
};

pressureVent.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._ventRef);
        this.canvas.removeEventListener('touchstart', this._ventRef);
    }
};
