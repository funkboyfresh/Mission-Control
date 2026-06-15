/**
 * TRACK-WELDER.JS [ S-TIER PREPARATION MODULE ]
 * Rail Line Structural Laser Patch Welding Interface.
 * Controls: Press and Hold to fire welder beam strictly while fractured nodes cross center.
 */

const trackWelder = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    fractures: [],
    isHolding: false
};

trackWelder.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'CYBER', color: '#00ff88' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.fractures = [];
    this.isHolding = false;
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

trackWelder.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

trackWelder.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

trackWelder.updatePhysics = function() {
    const scrollSpeed = 5;
    const cx = this.canvas.width / 2;
    
    // Spawn broken track joints scrolling across horizontally
    if (this.frameCount % 45 === 0) {
        this.fractures.push({ x: this.canvas.width + 20, patched: false });
    }
    
    // Track movement and check patch points bounds
    for (let i = this.fractures.length - 1; i >= 0; i--) {
        let f = this.fractures[i];
        f.x -= scrollSpeed;
        
        // Evaluate active weld intersection coordinates inside the alignment bracket window
        if (Math.abs(f.x - cx) < 25) {
            if (this.isHolding && !f.patched) {
                f.patched = true;
                let payload = this.isApexEvent ? 24 : 12;
                this.bonusScrapEarned += payload;
                const hudScrap = document.getElementById('game-hud-scrap');
                if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            }
        }
        
        // Penalize missing broken joints with no shield patch coverage
        if (f.x < cx - 30 && !g.patched && this.isHolding) {
            // Welding open air wastes engine fuel amplitude properties
            if (this.frameCount % 10 === 0 && this.ammoPool > 0) this.ammoPool--;
            const hudAmmo = document.getElementById('game-hud-ammo');
            if (hudAmmo) hudAmmo.innerText = this.ammoPool;
        }
        
        if (f.x < -20) this.fractures.splice(i, 1);
    }
};

trackWelder.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Draw Master Rail Path Core Line
    ctx.strokeStyle = '#222222'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(this.canvas.width, cy); ctx.stroke();
    
    // Draw Advancing Fracture Gaps
    this.fractures.forEach(f => {
        ctx.fillStyle = f.patched ? '#00ffaa' : this.biome.color;
        ctx.fillRect(f.x - 8, cy - 10, 16, 20);
    });
    
    // Draw Stationary Crosshair Target Bracket Scope Frame
    ctx.save();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
    ctx.strokeRect(cx - 20, cy - 25, 40, 50);
    ctx.restore();
    
    // Draw Active Welder Plasma Burn Ray line
    if (this.isHolding) {
        ctx.save();
        ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 15; ctx.shadowColor = '#00ffaa';
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
};

trackWelder.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
    }
    window.removeEventListener('mouseup', this._upRef);
    window.removeEventListener('touchend', this._upRef);
};
