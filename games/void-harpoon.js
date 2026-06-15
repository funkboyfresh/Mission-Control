/**
 * VOID-HARPOON.JS [ B-TIER MODULE ]
 * Vertical Magnetic Claw Core Extraction Simulator.
 * Controls: Tap left/right viewport columns to toggle hook steering line vectors.
 */

const voidHarpoon = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    harpoon: { x: 0, y: 120, vx: 0 },
    targets: [],
    debris: []
};

voidHarpoon.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'ABYSSAL', color: '#0066ff' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    
    this.resizeCanvas();
    this.harpoon.x = this.canvas.width / 2;
    this.harpoon.vx = 0;
    this.targets = [];
    this.debris = [];
    
    this._downRef = (e) => {
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const half = window.innerWidth / 2;
        // Adjust horizontal movement vector snappy offsets
        this.harpoon.vx = clientX < half ? -5 : 5;
    };
    
    this.canvas.addEventListener('mousedown', this._downRef);
    this.canvas.addEventListener('touchstart', this._downRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

voidHarpoon.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

voidHarpoon.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

voidHarpoon.updatePhysics = function() {
    this.harpoon.x += this.harpoon.vx;
    this.harpoon.vx *= 0.92; // Friction dampening vector bounds
    
    // Bounds boundaries constraint checking
    if (this.harpoon.x < 20) this.harpoon.x = 20;
    if (this.harpoon.x > this.canvas.width - 20) this.harpoon.x = this.canvas.width - 20;
    
    // Generate upward rising deep ocean mineral anomalies
    if (Math.random() < 0.04) {
        this.targets.push({ x: Math.random() * this.canvas.width, y: this.canvas.height + 20, radius: 8, speed: 3 });
    }
    if (Math.random() < 0.03) {
        this.debris.push({ x: Math.random() * this.canvas.width, y: this.canvas.height + 20, size: 24, speed: 4 });
    }
    
    // Resolve claw collisions paths
    for (let i = this.targets.length - 1; i >= 0; i--) {
        let t = this.targets[i];
        t.y -= t.speed;
        
        let dist = Math.hypot(this.harpoon.x - t.x, this.harpoon.y - t.y);
        if (dist < t.radius + 10) {
            let value = this.isApexEvent ? 40 : 20;
            this.bonusScrapEarned += value;
            const hudScrap = document.getElementById('game-hud-scrap');
            if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            this.targets.splice(i, 1);
            continue;
        }
        if (t.y < -20) this.targets.splice(i, 1);
    }
    
    for (let i = this.debris.length - 1; i >= 0; i--) {
        let d = this.debris[i];
        d.y -= d.speed;
        
        let dist = Math.hypot(this.harpoon.x - d.x, this.harpoon.y - d.y);
        if (dist < d.size/2 + 10) {
            // Impact spends shield fuel matrix values
            if (this.ammoPool > 10) {
                this.ammoPool -= 10;
                const hudAmmo = document.getElementById('game-hud-ammo');
                if (hudAmmo) hudAmmo.innerText = this.ammoPool;
            }
            this.debris.splice(i, 1);
            continue;
        }
        if (d.y < -20) this.debris.splice(i, 1);
    }
};

voidHarpoon.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Cable Winch Core Line
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(this.canvas.width/2, 0); ctx.lineTo(this.harpoon.x, this.harpoon.y); ctx.stroke();
    
    // Draw Claw Grabber Tip
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10; ctx.shadowColor = this.biome.color;
    ctx.beginPath(); ctx.arc(this.harpoon.x, this.harpoon.y, 10, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    
    // Draw Targets
    ctx.fillStyle = '#00ff88';
    this.targets.forEach(t => {
        ctx.beginPath(); ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2); ctx.fill();
    });
    
    // Draw Hazards Blocks
    ctx.fillStyle = this.biome.color;
    this.debris.forEach(d => {
        ctx.fillRect(d.x - d.size/2, d.y - d.size/2, d.size, d.size);
    });
};

voidHarpoon.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
    }
};
