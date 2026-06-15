/**
 * SWARM-ANALYZER.JS [ S-TIER PREPARATION MODULE ]
 * Horizontal Waveform Frequency Spike Intercept.
 * Controls: Tap screen to capture signals precisely as they cross the center zone bounds.
 */

const swarmAnalyzer = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    signals: []
};

swarmAnalyzer.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'VOID', color: '#a200ff' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.signals = [];
    this.resizeCanvas();
    
    this._captureRef = (e) => {
        e.preventDefault();
        this.captureWaveformSpike();
    };
    
    this.canvas.addEventListener('mousedown', this._captureRef);
    this.canvas.addEventListener('touchstart', this._captureRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

swarmAnalyzer.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

swarmAnalyzer.captureWaveformSpike = function() {
    const cx = this.canvas.width / 2;
    let successfulHit = false;
    
    for (let i = 0; i < this.signals.length; i++) {
        let s = this.signals[i];
        if (Math.abs(s.x - cx) < 25) {
            successfulHit = true;
            let gain = this.isApexEvent ? 24 : 12;
            this.bonusScrapEarned += gain;
            this.signals.splice(i, 1);
            break;
        }
    }
    
    if (successfulHit) {
        const hudScrap = document.getElementById('game-hud-scrap');
        if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
    } else {
        if (this.ammoPool > 5) this.ammoPool -= 5;
        const hudAmmo = document.getElementById('game-hud-ammo');
        if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    }
};

swarmAnalyzer.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

swarmAnalyzer.updatePhysics = function() {
    const scrollSpeed = this.isApexEvent ? 6 : 4;
    
    // Spawn advanced telemetry streams rolling leftward
    if (this.frameCount % 45 === 0) {
        this.signals.push({ x: this.canvas.width + 20 });
    }
    
    this.signals.forEach(s => s.x -= scrollSpeed);
    for (let i = this.signals.length - 1; i >= 0; i--) {
        if (this.signals[i].x < -20) this.signals.splice(i, 1);
    }
};

swarmAnalyzer.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Draw Stationary Data Extraction Target Reticle
    ctx.save();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
    ctx.strokeRect(cx - 20, cy - 40, 40, 80);
    ctx.restore();
    
    // Draw Moving Frequency Signals
    ctx.fillStyle = this.biome.color;
    this.signals.forEach(s => {
        let pulseHeight = 35 + Math.sin(this.frameCount * 0.15) * 15;
        ctx.fillRect(s.x - 3, cy - pulseHeight/2, 6, pulseHeight);
    });
};

swarmAnalyzer.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._captureRef);
        this.canvas.removeEventListener('touchstart', this._captureRef);
    }
};
