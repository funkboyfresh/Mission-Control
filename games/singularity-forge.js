/**
 * SINGULARITY-FORGE.JS [ A-TIER MODULE ]
 * Concentric Audio-Pulse Rhythm Calibration Matrix.
 * Controls: Tap screen exactly when incoming rings intersect the static core vector.
 */

const singularityForge = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    coreRadius: 40,
    pulses: [],
    floatingTexts: []
};

singularityForge.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'PLASMA', color: '#7700ff' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.pulses = [];
    this.floatingTexts = [];
    
    this.resizeCanvas();
    
    // Rhythm alignment interaction check
    this._downRef = (e) => {
        e.preventDefault();
        
        if (this.pulses.length === 0) return;
        
        // Check closest ring threshold against target matrix bounds
        let p = this.pulses[0];
        let diff = Math.abs(p.radius - this.coreRadius);
        
        if (diff < 12) {
            // PERFECT SYNCHRONIZATION
            let bonus = this.isApexEvent ? 40 : 25;
            this.bonusScrapEarned += bonus;
            this.floatingTexts.push({ text: "PERFECT MATCH!", color: '#00ff88' });
            this.pulses.shift(); // Consume ring node
        } else if (diff < 28) {
            // GOOD TIMING
            let bonus = this.isApexEvent ? 15 : 10;
            this.bonusScrapEarned += bonus;
            this.floatingTexts.push({ text: "STABLE TIMING", color: '#ffaa00' });
            this.pulses.shift();
        } else {
            // MISALIGNED CALIBRATION
            this.floatingTexts.push({ text: "CALIBRATION MISMATCH", color: '#ff0033' });
            
            // Spend Energy failsafe adjustment to clear mismatched loop
            if (this.ammoPool > 5) {
                this.ammoPool -= 5;
                const hudAmmo = document.getElementById('game-hud-ammo');
                if (hudAmmo) hudAmmo.innerText = this.ammoPool;
            }
        }
        
        const hudScrap = document.getElementById('game-hud-scrap');
        if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
    };
    this._resizeRef = () => this.resizeCanvas();
    
    this.canvas.addEventListener('mousedown', this._downRef);
    this.canvas.addEventListener('touchstart', this._downRef, { passive: false });
    window.addEventListener('resize', this._resizeRef);
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

singularityForge.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

singularityForge.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

singularityForge.updatePhysics = function() {
    // Generate concentric calibration nodes to a baseline frequency beat
    if (this.frameCount % (this.isApexEvent ? 35 : 55) === 0) {
        this.pulses.push({
            radius: Math.max(this.canvas.width, this.canvas.height) / 2,
            speed: this.isApexEvent ? 6 : 4
        });
    }
    
    // Shrink wave pulses toward baseline anchor
    for (let i = this.pulses.length - 1; i >= 0; i--) {
        let p = this.pulses[i];
        p.radius -= p.speed;
        
        // Erase dead notes passing internal core barrier threshold
        if (p.radius < this.coreRadius - 10) {
            this.pulses.splice(i, 1);
            this.floatingTexts.push({ text: "BEAT FORFEIT", color: '#444444' });
        }
    }
    
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        let t = this.floatingTexts[i];
        t.alpha = t.alpha ? t.alpha - 0.03 : 0.97;
        if (t.alpha <= 0) this.floatingTexts.splice(i, 1);
    }
};

singularityForge.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Render Static Calibration Core Target ring zone
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20; ctx.shadowColor = this.biome.color;
    ctx.beginPath(); ctx.arc(cx, cy, this.coreRadius, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    
    // Render Collapsing Pulse Rings
    this.pulses.forEach(p => {
        ctx.save();
        ctx.strokeStyle = this.biome.color;
        ctx.lineWidth = Math.abs(p.radius - this.coreRadius) < 15 ? 4 : 2;
        ctx.beginPath(); ctx.arc(cx, cy, p.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    });
    
    // Render text output
    ctx.save();
    ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
    if (this.floatingTexts.length > 0) {
        let activeText = this.floatingTexts[this.floatingTexts.length - 1];
        ctx.fillStyle = activeText.color;
        ctx.fillText(activeText.text, cx, cy + this.coreRadius + 40);
    }
    ctx.restore();
};

singularityForge.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
    }
    window.removeEventListener('resize', this._resizeRef);
};
