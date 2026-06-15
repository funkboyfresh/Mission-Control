/**
 * ORBITAL-FLAIL.JS [ S-TIER MODULE ]
 * Centrifugal Centrifugal Physics Wrecking Tether.
 * Controls: Press and hold down to anchor ship position and whip tether sphere out.
 */

const orbitalFlail = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    player: { x: 180, y: 250 },
    flail: { angle: 0, length: 70, radius: 14, speed: 0.05 },
    enemies: [],
    isHolding: false
};

orbitalFlail.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'ABYSSAL', color: '#0066ff' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.enemies = [];
    this.isHolding = false;
    this.flail.angle = 0;
    this.flail.length = 70;
    
    this.resizeCanvas();
    this.player.x = 180;
    this.player.y = this.canvas.height / 2;
    
    this._downRef = (e) => { e.preventDefault(); this.isHolding = true; };
    this._upRef = () => { this.isHolding = false; };
    
    this.canvas.addEventListener('mousedown', this._downRef);
    this.canvas.addEventListener('touchstart', this._downRef, { passive: false });
    window.addEventListener('mouseup', this._upRef);
    window.addEventListener('touchend', this._upRef);
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

orbitalFlail.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

orbitalFlail.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

orbitalFlail.updatePhysics = function() {
    // Increase rotational speed if anchor lock is engaged
    if (this.isHolding) {
        this.flail.speed = 0.16; // Rapid centrifugal rotation matrix speed
        this.flail.length = 110;  // Extend cable loop outwards
        if (this.frameCount % 8 === 0 && this.ammoPool > 0) {
            this.ammoPool--;
            const hudAmmo = document.getElementById('game-hud-ammo');
            if (hudAmmo) hudAmmo.innerText = this.ammoPool;
        }
    } else {
        this.flail.speed = 0.05; // Resting recovery speed
        this.flail.length = 65;
    }
    
    this.flail.angle += this.flail.speed;
    
    // Calculate precise tip coordinate coordinates for ball destruction loop
    this.flailX = this.player.x + Math.cos(this.flail.angle) * this.flail.length;
    this.flailY = this.player.y + Math.sin(this.flail.angle) * this.flail.length;
    
    // Spawn threat arrays sweeping leftward from right edge
    if (this.frameCount % (this.isApexEvent ? 25 : 45) === 0) {
        this.enemies.push({
            x: this.canvas.width + 30,
            y: Math.random() * (this.canvas.height - 160) + 80,
            speed: 4
        });
    }
    
    // Check flail head smashing collisions bounds
    for (let i = this.enemies.length - 1; i >= 0; i--) {
        let e = this.enemies[i];
        e.x -= e.speed;
        
        let targetDist = Math.hypot(this.flailX - e.x, this.flailY - e.y);
        if (targetDist < this.flail.radius + 12) {
            let gain = this.isApexEvent ? 26 : 13;
            this.bonusScrapEarned += gain;
            const hudScrap = document.getElementById('game-hud-scrap');
            if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            this.enemies.splice(i, 1);
            continue;
        }
        
        // Pass clear safety buffer or delete framing checks
        if (e.x < -30) this.enemies.splice(i, 1);
    }
};

orbitalFlail.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Luminous Magnetic Connection Tether
    ctx.save();
    ctx.strokeStyle = this.isHolding ? '#00ffaa' : this.biome.color;
    ctx.lineWidth = this.isHolding ? 3 : 1;
    ctx.beginPath(); ctx.moveTo(this.player.x, this.player.y); ctx.lineTo(this.flailX, this.flailY); ctx.stroke();
    ctx.restore();
    
    // Draw Centrifugal Heavy Ore Head ball
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = this.isHolding ? 20 : 8; ctx.shadowColor = this.biome.color;
    ctx.beginPath(); ctx.arc(this.flailX, this.flailY, this.flail.radius, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    
    // Draw Incoming Ships Swarm
    ctx.fillStyle = '#ff4444';
    this.enemies.forEach(e => {
        ctx.fillRect(e.x - 8, e.y - 8, 16, 16);
    });
    
    // Draw Stationary Anchor Core Vessel
    ctx.save();
    ctx.fillStyle = this.isHolding ? '#00ffaa' : '#ffffff';
    ctx.beginPath(); ctx.arc(this.player.x, this.player.y, 10, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
};

orbitalFlail.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
    }
    window.removeEventListener('mouseup', this._upRef);
    window.removeEventListener('touchend', this._upRef);
};
