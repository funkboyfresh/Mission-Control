/**
 * CORE-CHARGER.JS [ S-TIER PREPARATION MODULE ]
 * Singularity Containment Compression Shell Calibration Valve.
 * Controls: Tap screen exactly when expanding wave fits inside target perimeter limits.
 */

const coreCharger = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    pulseRadius: 10,
    targetRadius: 75,
    growthSpeed: 2
};

coreCharger.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'PLASMA', color: '#7700ff' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    
    this.pulseRadius = 10;
    this.growthSpeed = this.isApexEvent ? 3.2 : 2.2;
    this.resizeCanvas();
    
    this._pressRef = (e) => {
        e.preventDefault();
        this.dischargeCalibrationValve();
    };
    
    this.canvas.addEventListener('mousedown', this._pressRef);
    this.canvas.addEventListener('touchstart', this._pressRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

coreCharger.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

coreCharger.dischargeCalibrationValve = function() {
    let diff = Math.abs(this.pulseRadius - this.targetRadius);
    
    if (diff < 12) {
        let gain = this.isApexEvent ? 32 : 16;
        this.bonusScrapEarned += gain;
        const hudScrap = document.getElementById('game-hud-scrap');
        if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
    } else {
        if (this.ammoPool > 5) this.ammoPool -= 5;
        const hudAmmo = document.getElementById('game-hud-ammo');
        if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    }
    
    this.pulseRadius = 10; // Reset loop sequence immediately on touch execution
};

coreCharger.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

coreCharger.updatePhysics = function() {
    this.pulseRadius += this.growthSpeed;
    
    // Auto collapse fallback cycle if player misses the drop timing frame bounds
    if (this.pulseRadius > this.targetRadius + 30) {
        this.pulseRadius = 10;
    }
};

coreCharger.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Draw Perimeter Containment Boundary Target ring lines
    ctx.save();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
    ctx.shadowBlur = 20; ctx.shadowColor = this.biome.color;
    ctx.beginPath(); ctx.arc(cx, cy, this.targetRadius, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    
    // Draw Expanding Shell Wavelength Node Ring
    ctx.save();
    ctx.strokeStyle = this.biome.color;
    ctx.lineWidth = Math.abs(this.pulseRadius - this.targetRadius) < 12 ? 4 : 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, this.pulseRadius, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
};

coreCharger.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._pressRef);
        this.canvas.removeEventListener('touchstart', this._pressRef);
    }
};
