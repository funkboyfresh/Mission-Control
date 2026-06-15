/**
 * MAGNETIC-COUPLER.JS [ S-TIER PREPARATION MODULE ]
 * Rotational Axis Link Interlocking Calibration Matrix.
 * Controls: Tap screen exactly when rotating links match the alignment index lines.
 */

const magneticCoupler = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    ringAngle: 0,
    targetAngle: Math.PI / 2, // Vertical center anchor
    linksCoupled: 0
};

magneticCoupler.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'ABYSSAL', color: '#0066ff' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.linksCoupled = 0;
    this.ringAngle = 0;
    
    this.resizeCanvas();
    
    this._snapRef = (e) => {
        e.preventDefault();
        this.calibrateCouplingLink();
    };
    
    this.canvas.addEventListener('mousedown', this._snapRef);
    this.canvas.addEventListener('touchstart', this._snapRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

magneticCoupler.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

magneticCoupler.calibrateCouplingLink = function() {
    // Isolate standard angle wrapping limits
    let normalized = this.ringAngle % (Math.PI * 2);
    let diff = Math.abs(normalized - this.targetAngle);
    
    if (diff < 0.22) {
        // SUCCESSFUL CHAIN SNAP! Accumulate heavy kinetic mass parameters
        this.linksCoupled++;
        let prize = this.isApexEvent ? 36 : 18;
        this.bonusScrapEarned += prize;
        
        const hudScrap = document.getElementById('game-hud-scrap');
        if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
        this.ringAngle += 0.5; // Bump rotation to skip immediately into next sector arc
    } else {
        if (this.ammoPool > 6) this.ammoPool -= 6;
        const hudAmmo = document.getElementById('game-hud-ammo');
        if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    }
};

magneticCoupler.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

magneticCoupler.updatePhysics = function() {
    // Spin coupling links smoothly
    this.ringAngle += this.isApexEvent ? 0.045 : 0.03;
};

magneticCoupler.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Draw Static Vertical Target Overlay Line Axis
    ctx.strokeStyle = '#444444'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy - 140); ctx.lineTo(cx, cy + 140); ctx.stroke();
    
    // Draw Stationary Anchor Peg Hub
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(cx, cy, 15, 0, Math.PI * 2); ctx.fill();
    
    // Draw Rotating Coupler Socket Node Ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.ringAngle);
    
    ctx.strokeStyle = this.biome.color; ctx.lineWidth = 4;
    ctx.shadowBlur = 15; ctx.shadowColor = this.biome.color;
    ctx.beginPath(); ctx.arc(0, 0, 80, 0, Math.PI * 2); ctx.stroke();
    
    // Draw the active coupling contact node tooth piece
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, -88, 16, 16);
    ctx.restore();
    
    // Draw scoreboard link tally icons
    ctx.fillStyle = '#00ffaa'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`KINETIC COUPLINGS SECURED: ${this.linksCoupled}`, cx, cy + 130);
};

magneticCoupler.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._snapRef);
        this.canvas.removeEventListener('touchstart', this._snapRef);
    }
};
