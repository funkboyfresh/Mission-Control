/**
 * NODE-COMPILER.JS [ S-TIER PREPARATION MODULE ]
 * Concentric Ring Data Matrix Array Connection Compiler.
 * Controls: Tap anywhere when the closing link line fits flush over node points.
 */

const nodeCompiler = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    ringRadius: 80,
    targetRadius: 15
};

nodeCompiler.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'SPORE', color: '#00ffaa' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    
    this.ringRadius = 80;
    this.resizeCanvas();
    
    this._compileRef = (e) => {
        e.preventDefault();
        this.compileDataLink();
    };
    
    this.canvas.addEventListener('mousedown', this._compileRef);
    this.canvas.addEventListener('touchstart', this._compileRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

nodeCompiler.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

nodeCompiler.compileDataLink = function() {
    let margin = Math.abs(this.ringRadius - this.targetRadius);
    
    if (margin < 10) {
        let value = this.isApexEvent ? 24 : 12;
        this.bonusScrapEarned += value;
        const hudScrap = document.getElementById('game-hud-scrap');
        if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
    } else {
        if (this.ammoPool > 5) this.ammoPool -= 5;
        const hudAmmo = document.getElementById('game-hud-ammo');
        if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    }
    
    this.ringRadius = 80; // Reset loop immediately on touch register
};

nodeCompiler.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

nodeCompiler.updatePhysics = function() {
    this.ringRadius -= this.isApexEvent ? 2.5 : 1.6;
    if (this.ringRadius < 5) this.ringRadius = 80;
};

nodeCompiler.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Draw Core Target Node Point
    ctx.save();
    ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 15; ctx.shadowColor = this.biome.color;
    ctx.beginPath(); ctx.arc(cx, cy, this.targetRadius, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    
    // Draw Contracting Link Framework Ring
    ctx.save();
    ctx.strokeStyle = this.biome.color;
    ctx.lineWidth = Math.abs(this.ringRadius - this.targetRadius) < 10 ? 4 : 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, this.ringRadius, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
};

nodeCompiler.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._compileRef);
        this.canvas.removeEventListener('touchstart', this._compileRef);
    }
};
