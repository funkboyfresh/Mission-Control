/**
 * ANCHOR-CALIBRATOR.JS [ S-TIER PREPARATION MODULE ]
 * Sonar Pendulum Frequency Gauge Alignment Meter.
 * Controls: Tap anywhere to freeze marker bar directly on center target bounds.
 */

const anchorCalibrator = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    pointerX: 50,
    pointerDir: 1,
    calibrationsSecured: 0
};

anchorCalibrator.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'CHRONOS', color: '#ffe55c' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.calibrationsSecured = 0;
    this.pointerX = 50;
    this.pointerDir = 1;
    
    this.resizeCanvas();
    
    this._freezeRef = (e) => {
        e.preventDefault();
        this.assessMeterLock();
    };
    
    this.canvas.addEventListener('mousedown', this._freezeRef);
    this.canvas.addEventListener('touchstart', this._freezeRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

anchorCalibrator.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

anchorCalibrator.assessMeterLock = function() {
    const cx = this.canvas.width / 2;
    const errorMargin = Math.abs(this.pointerX - cx);
    
    if (errorMargin < 20) {
        // EXCELLENT LOCK: Calibration parameter synchronized cleanly
        this.calibrationsSecured++;
        let bounty = this.isApexEvent ? 36 : 18;
        this.bonusScrapEarned += bounty;
        
        const hudScrap = document.getElementById('game-hud-scrap');
        if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
    } else {
        if (this.ammoPool > 5) this.ammoPool -= 5;
        const hudAmmo = document.getElementById('game-hud-ammo');
        if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    }
};

anchorCalibrator.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

anchorCalibrator.updatePhysics = function() {
    const meterSpeed = this.isApexEvent ? 9 : 6;
    this.pointerX += meterSpeed * this.pointerDir;
    
    if (this.pointerX < 40 || this.pointerX > this.canvas.width - 40) {
        this.pointerDir *= -1;
    }
};

anchorCalibrator.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Draw Outer Calibration Chamber Layout Bracket
    ctx.strokeStyle = '#333333'; ctx.lineWidth = 2;
    ctx.strokeRect(30, cy - 30, this.canvas.width - 60, 60);
    
    // Draw Center Target Alignment Threshold Zone
    ctx.fillStyle = `${this.biome.color}33`;
    ctx.fillRect(cx - 20, cy - 30, 40, 60);
    ctx.strokeStyle = this.biome.color; ctx.lineWidth = 1;
    ctx.strokeRect(cx - 20, cy - 30, 40, 60);
    
    // Draw Sweeping Indicator Pendulum Bar line
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 12; ctx.shadowColor = '#ffffff';
    ctx.fillRect(this.pointerX - 3, cy - 40, 6, 80);
    ctx.restore();
    
    // Counter tracking readout
    ctx.fillStyle = '#888888'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`SYNCHRONIZED CODES DETECTED: ${this.calibrationsSecured}`, cx, cy + 85);
};

anchorCalibrator.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._freezeRef);
        this.canvas.removeEventListener('touchstart', this._freezeRef);
    }
};
