/**
 * SLIPSTREAM-RUN.JS [ A-TIER MODULE ]
 * Pseudodynamic pseudo-3D Lane-Shifting Tunnel Dashboard.
 * Controls: Tap left/right third of the viewport screen to jump corridors dynamically.
 */

const slipstreamRun = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    currentLane: 1, // 0: Left, 1: Center, 2: Right
    targetX: 0,
    playerX: 0,
    hazards: [],
    particles: [],
    floatingTexts: []
};

slipstreamRun.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'CHRONOS', color: '#ffe55c' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.currentLane = 1;
    this.hazards = [];
    this.particles = [];
    this.floatingTexts = [];
    
    this.resizeCanvas();
    this.playerX = this.canvas.width / 2;
    this.targetX = this.playerX;
    
    // 3-Column Touch Target Splitting
    this._downRef = (e) => {
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const third = window.innerWidth / 3;
        
        if (clientX < third) {
            if (this.currentLane > 0) this.currentLane--;
        } else if (clientX > third * 2) {
            if (this.currentLane < 2) this.currentLane++;
        } else {
            // Center click activates Magnetized Shield Core
            if (this.ammoPool > 10) {
                this.ammoPool -= 10;
                const hudAmmo = document.getElementById('game-hud-ammo');
                if (hudAmmo) hudAmmo.innerText = this.ammoPool;
                this.bonusScrapEarned += 20;
                this.floatingTexts.push({ x: this.canvas.width/2, y: this.canvas.height - 150, text: "MAGNET COLLECT! +20", color: '#00ffbb', alpha: 1 });
                
                const hudScrap = document.getElementById('game-hud-scrap');
                if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            }
        }
    };
    this._resizeRef = () => this.resizeCanvas();
    
    this.canvas.addEventListener('mousedown', this._downRef);
    this.canvas.addEventListener('touchstart', this._downRef, { passive: false });
    window.addEventListener('resize', this._resizeRef);
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

slipstreamRun.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

slipstreamRun.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

slipstreamRun.updatePhysics = function() {
    const laneWidth = this.canvas.width / 4;
    const destinations = [
        this.canvas.width / 2 - laneWidth,
        this.canvas.width / 2,
        this.canvas.width / 2 + laneWidth
    ];
    
    // Smooth lane hopping interpolation
    this.playerX += (destinations[this.currentLane] - this.playerX) * 0.25;
    
    // Spawn 3D Perspective Obstacles sliding downward
    if (this.frameCount % (this.isApexEvent ? 20 : 35) === 0) {
        this.hazards.push({
            lane: Math.floor(Math.random() * 3),
            z: 0, // Depth scale factor (0 background to 1 foreground)
            speed: this.isApexEvent ? 0.035 : 0.025
        });
    }
    
    // Update obstacle scale values
    for (let i = this.hazards.length - 1; i >= 0; i--) {
        let h = this.hazards[i];
        h.z += h.speed;
        
        // Collsion check triggers as depth hits foreground viewport threshold (z >= 0.95)
        if (h.z >= 0.95) {
            if (h.lane === this.currentLane) {
                // Collide
                this.floatingTexts.push({ x: this.playerX, y: this.canvas.height - 120, text: "IMPACT CUT", color: '#ff0055', alpha: 1 });
            } else {
                // Safely passed
                let points = this.isApexEvent ? 30 : 15;
                this.bonusScrapEarned += points;
                const hudScrap = document.getElementById('game-hud-scrap');
                if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            }
            this.hazards.splice(i, 1);
        }
    }
    
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        let t = this.floatingTexts[i];
        t.alpha -= 0.02;
        if (t.alpha <= 0) this.floatingTexts.splice(i, 1);
    }
};

slipstreamRun.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const h2 = this.canvas.height;
    const w2 = this.canvas.width;
    
    // Draw 3D Tunnel Grid Perspective paths
    ctx.strokeStyle = this.biome.color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.2;
    
    const laneWidth = w2 / 4;
    const vanishingX = w2 / 2;
    const vanishingY = h2 * 0.2;
    
    const lines = [vanishingX - laneWidth * 1.5, vanishingX - laneWidth * 0.5, vanishingX + laneWidth * 0.5, vanishingX + laneWidth * 1.5];
    lines.forEach(lx => {
        ctx.beginPath();
        ctx.moveTo(vanishingX, vanishingY);
        ctx.lineTo(lx, h2);
        ctx.stroke();
    });
    
    // Draw sliding threat vectors
    this.hazards.forEach(h => {
        ctx.save();
        ctx.globalAlpha = h.z;
        ctx.fillStyle = this.biome.color;
        ctx.shadowBlur = 15 * h.z; ctx.shadowColor = this.biome.color;
        
        const currentTargetX = vanishingX + (h.lane - 1) * laneWidth * h.z;
        const currentTargetY = vanishingY + (h2 - vanishingY) * h.z;
        const size = 50 * h.z;
        
        ctx.fillRect(currentTargetX - size/2, currentTargetY - size/2, size, size);
        ctx.restore();
    });
    
    // Draw Cockpit Target Plane
    ctx.save();
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 20; ctx.shadowColor = this.biome.color;
    ctx.beginPath();
    ctx.arc(this.playerX, h2 - 80, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Render text metrics
    this.floatingTexts.forEach(t => {
        ctx.save(); ctx.globalAlpha = t.alpha;
        ctx.fillStyle = t.color;
        ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    });
};

slipstreamRun.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
    }
    window.removeEventListener('resize', this._resizeRef);
};
