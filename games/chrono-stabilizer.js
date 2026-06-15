/**
 * CHRONO-STABILIZER.JS [ S-TIER BESPOKE PREPARATION MODULE ]
 * Rotational Clock-Face Temporal Alignment Engine.
 * Controls: Tap anywhere to stabilize timeline fractures when the sweep hand aligns.
 */

const chronoStabilizer = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    dialAngle: 0,
    fracture: null,
    timelinesRepaired: 0
};

chronoStabilizer.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'CHRONOS', color: '#ffe55c' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.timelinesRepaired = 0;
    this.dialAngle = 0;
    
    this.resizeCanvas();
    this.spawnTimelineFracture();
    
    this._tapRef = (e) => {
        e.preventDefault();
        this.weldTimelineFracture();
    };
    
    this.canvas.addEventListener('mousedown', this._tapRef);
    this.canvas.addEventListener('touchstart', this._tapRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

chronoStabilizer.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

chronoStabilizer.spawnTimelineFracture = function() {
    // Distribute fracture arcs across randomized clock-face positions
    const targetAngle = Math.random() * Math.PI * 2;
    this.fracture = {
        angle: targetAngle,
        width: this.isApexEvent ? 0.28 : 0.40 // Narrower windows during Apex runs
    };
};

chronoStabilizer.weldTimelineFracture = function() {
    if (!this.fracture) return;
    
    // Normalize angular alignment fields
    let currentNorm = this.dialAngle % (Math.PI * 2);
    let targetNorm = this.fracture.angle;
    
    let delta = Math.abs(currentNorm - targetNorm);
    while (delta > Math.PI) delta = Math.PI * 2 - delta;
    
    if (delta < this.fracture.width / 2) {
        // SUCCESSFUL TIMELINE FIX: Secure jump trajectory tracking points
        this.timelinesRepaired++;
        let yieldPay = this.isApexEvent ? 32 : 16;
        this.bonusScrapEarned += yieldPay;
        
        const hudScrap = document.getElementById('game-hud-scrap');
        if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
        
        this.spawnTimelineFracture(); // Re-roll subsequent rift instantly
    } else {
        // Mismatch cost saps entry voltage pools
        if (this.ammoPool > 6) this.ammoPool -= 6;
        const hudAmmo = document.getElementById('game-hud-ammo');
        if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    }
};

chronoStabilizer.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

chronoStabilizer.updatePhysics = function() {
    // Advance clock hand rotation velocity profile
    const baseSpeed = this.isApexEvent ? 0.055 : 0.038;
    this.dialAngle += baseSpeed;
};

chronoStabilizer.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const radius = 90;
    
    // Draw Static Outer Gauge Circle Backing
    ctx.strokeStyle = '#1f1f1f'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
    
    // Draw Unstable Timeline Fracture Arcs Segment
    if (this.fracture) {
        ctx.save();
        ctx.strokeStyle = '#ff3366'; ctx.lineWidth = 6;
        ctx.shadowBlur = 15; ctx.shadowColor = '#ff3366';
        ctx.beginPath();
        ctx.arc(
            cx, cy, radius, 
            this.fracture.angle - this.fracture.width / 2, 
            this.fracture.angle + this.fracture.width / 2
        );
        ctx.stroke();
        ctx.restore();
    }
    
    // Draw Sweeping Chrono Ticking Alignment Hand
    ctx.save();
    ctx.strokeStyle = this.biome.color; ctx.lineWidth = 3;
    ctx.shadowBlur = 12; ctx.shadowColor = this.biome.color;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(this.dialAngle) * (radius - 5), cy + Math.sin(this.dialAngle) * (radius - 5));
    ctx.stroke();
    
    // Draw Center Pivot Point Cap
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    
    // Counter display logs
    ctx.fillStyle = '#888888'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`TIMELINE ANCHORS LOCKED: ${this.timelinesRepaired}`, cx, cy + radius + 45);
};

chronoStabilizer.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._tapRef);
        this.canvas.removeEventListener('touchstart', this._tapRef);
    }
};
