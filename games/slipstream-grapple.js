/**
 * SLIPSTREAM-GRAPPLE.JS [ S-TIER MODULE ]
 * Kinetic Slingshot Grapple Hook Orbital Endless Runner.
 * Controls: Touch and Hold to engage magnetic grapple beam to the nearest anchor nodes.
 */

const slipstreamGrapple = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    player: { x: 150, y: 300, vy: 0, radius: 12 },
    anchors: [],
    scrap: [],
    connectedAnchor: null,
    isHolding: false
};

slipstreamGrapple.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'VOID', color: '#a200ff' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.anchors = [];
    this.scrap = [];
    this.connectedAnchor = null;
    this.isHolding = false;
    this.resizeCanvas();
    
    this.player.y = this.canvas.height / 2;
    this.player.vy = 0;
    
    // Spawn an initial set of grappling anchors drifting in space
    for (let i = 0; i < 4; i++) {
        this.anchors.push({ x: 300 + i * 250, y: Math.random() * (this.canvas.height - 200) + 100 });
    }
    
    this._downRef = (e) => {
        e.preventDefault();
        this.isHolding = true;
        // Lock onto the closest forward anchor node
        let closest = null; let minDist = 99999;
        this.anchors.forEach(a => {
            let dist = Math.hypot(this.player.x - a.x, this.player.y - a.y);
            if (dist < minDist && a.x > this.player.x - 20) { closest = a; minDist = dist; }
        });
        if (closest && minDist < 300) this.connectedAnchor = closest;
    };
    
    this._upRef = () => {
        this.isHolding = false;
        this.connectedAnchor = null;
    };
    
    this.canvas.addEventListener('mousedown', this._downRef);
    this.canvas.addEventListener('touchstart', this._downRef, { passive: false });
    window.addEventListener('mouseup', this._upRef);
    window.addEventListener('touchend', this._upRef);
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

slipstreamGrapple.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

slipstreamGrapple.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

slipstreamGrapple.updatePhysics = function() {
    const scrollSpeed = 5;
    
    if (this.connectedAnchor) {
        // Spend energy while tether beam is engaged
        if (this.frameCount % 8 === 0 && this.ammoPool > 0) {
            this.ammoPool--;
            const hudAmmo = document.getElementById('game-hud-ammo');
            if (hudAmmo) hudAmmo.innerText = this.ammoPool;
        }
        
        // Calculate physics swing forces toward the connection node
        const ang = Math.atan2(this.player.y - this.connectedAnchor.y, this.player.x - this.connectedAnchor.x);
        this.player.vy += Math.sin(ang) * -0.6; // Centripetal pull simulation
    } else {
        // Natural falling space trajectory gravity
        this.player.vy += 0.25;
    }
    
    this.player.y += this.player.vy;
    this.player.vy *= 0.98; // Drag friction resistance
    
    // Bounds boundaries constraint check
    if (this.player.y < 20) { this.player.y = 20; this.player.vy = 0; }
    if (this.player.y > this.canvas.height - 20) { this.player.y = this.canvas.height - 20; this.player.vy = 0; }
    
    // Scroll environment structures leftward
    this.anchors.forEach(a => a.x -= scrollSpeed);
    this.scrap.forEach(s => s.x -= scrollSpeed);
    
    // Clean up past anchors and generate new nodes ahead
    if (this.anchors[0] && this.anchors[0].x < -50) {
        this.anchors.shift();
        let lastX = this.anchors[this.anchors.length - 1].x;
        this.anchors.push({ x: lastX + 250, y: Math.random() * (this.canvas.height - 200) + 100 });
        
        // Throw a piece of floating resource scrap adjacent to it
        if (Math.random() > 0.4) {
            this.scrap.push({ x: lastX + 375, y: Math.random() * (this.canvas.height - 100) + 50, collected: false });
        }
    }
    
    // Check scrap intersection vectors
    for (let i = this.scrap.length - 1; i >= 0; i--) {
        let s = this.scrap[i];
        if (Math.hypot(this.player.x - s.x, this.player.y - s.y) < 25) {
            let gain = this.isApexEvent ? 20 : 10;
            this.bonusScrapEarned += gain;
            const hudScrap = document.getElementById('game-hud-scrap');
            if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            this.scrap.splice(i, 1);
        }
    }
};

slipstreamGrapple.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Grapple Slingshot Ray Laser Beam line
    if (this.connectedAnchor) {
        ctx.save();
        ctx.strokeStyle = '#00ffaa'; ctx.lineWidth = 3;
        ctx.shadowBlur = 15; ctx.shadowColor = '#00ffaa';
        ctx.beginPath(); ctx.moveTo(this.player.x, this.player.y); ctx.lineTo(this.connectedAnchor.x, this.connectedAnchor.y); ctx.stroke();
        ctx.restore();
    }
    
    // Draw Anchors Grid
    this.anchors.forEach(a => {
        ctx.save();
        ctx.fillStyle = this.biome.color;
        ctx.shadowBlur = 10; ctx.shadowColor = this.biome.color;
        ctx.fillRect(a.x - 6, a.y - 6, 12, 12);
        ctx.restore();
    });
    
    // Draw Float Resource Shards
    ctx.fillStyle = '#00ffaa';
    this.scrap.forEach(s => {
        ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI * 2); ctx.fill();
    });
    
    // Draw Player Vessel
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 12; ctx.shadowColor = '#ffffff';
    ctx.beginPath(); ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
};

slipstreamGrapple.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
    }
    window.removeEventListener('mouseup', this._upRef);
    window.removeEventListener('touchend', this._upRef);
};
