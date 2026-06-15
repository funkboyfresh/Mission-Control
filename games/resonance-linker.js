/**
 * RESONANCE-LINKER.JS [ S-TIER PREPARATION MODULE ]
 * Rotational Radar Radial Vector Connection Matrix.
 * Controls: Tap anywhere to lock connection node when sweeping ray overlaps target dots.
 */

const resonanceLinker = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    sweepAngle: 0,
    nodes: [],
    connectedCount: 0
};

resonanceLinker.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'PLASMA', color: '#7700ff' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.connectedCount = 0;
    this.sweepAngle = 0;
    
    this.nodes = [];
    this.resizeCanvas();
    
    // Spawn floating terminal receptor nodes in circular vector radius layers
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const count = 5;
    for (let i = 0; i < count; i++) {
        let ang = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
        this.nodes.push({
            angle: ang,
            radius: 95,
            x: cx + Math.cos(ang) * 95,
            y: cy + Math.sin(ang) * 95,
            linked: false
        });
    }
    
    this._pingRef = (e) => {
        e.preventDefault();
        this.attemptLinkConnection();
    };
    
    this.canvas.addEventListener('mousedown', this._pingRef);
    this.canvas.addEventListener('touchstart', this._pingRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

resonanceLinker.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

resonanceLinker.attemptLinkConnection = function() {
    let wrappedSweep = this.sweepAngle % (Math.PI * 2);
    let targetNode = null;
    
    for (let i = 0; i < this.nodes.length; i++) {
        let n = this.nodes[i];
        if (n.linked) continue;
        
        let diff = Math.abs(wrappedSweep - n.angle);
        while (diff > Math.PI) diff -= Math.PI * 2;
        diff = Math.abs(diff);
        
        if (diff < 0.18) { targetNode = n; break; }
    }
    
    if (targetNode) {
        targetNode.linked = true;
        this.connectedCount++;
        let prize = this.isApexEvent ? 32 : 16;
        this.bonusScrapEarned += prize;
        
        const hudScrap = document.getElementById('game-hud-scrap');
        if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
    } else {
        if (this.ammoPool > 6) this.ammoPool -= 6;
        const hudAmmo = document.getElementById('game-hud-ammo');
        if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    }
};

resonanceLinker.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

resonanceLinker.updatePhysics = function() {
    // Advance radial radar arm angle signature sweep
    this.sweepAngle += this.isApexEvent ? 0.045 : 0.03;
    if (this.sweepAngle > Math.PI * 20) this.sweepAngle = 0;
};

resonanceLinker.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Draw Concentric Structural Guide ring loops
    ctx.strokeStyle = '#222222'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 95, 0, Math.PI * 2); ctx.stroke();
    
    // Draw Sweeping Radar Laser Probe Ray line
    ctx.save();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
    ctx.shadowBlur = 15; ctx.shadowColor = this.biome.color;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(this.sweepAngle) * 130, cy + Math.sin(this.sweepAngle) * 130);
    ctx.stroke();
    ctx.restore();
    
    // Draw Node Clusters pins
    this.nodes.forEach(n => {
        ctx.save();
        ctx.fillStyle = n.linked ? '#00ffaa' : this.biome.color;
        ctx.shadowBlur = n.linked ? 15 : 4; ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath(); ctx.arc(n.x, n.y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
};

resonanceLinker.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._pingRef);
        this.canvas.removeEventListener('touchstart', this._pingRef);
    }
};
