/**
 * RAIL-GRIDER.JS [ S-TIER MODULE ]
 * Horizontal Laser Proximity Grinding Rail Multiplier Matrix.
 * Controls: Press and Hold to snap downward onto regional grid rails for multipliers.
 */

const railGrider = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    player: { x: 140, y: 150, radius: 10 },
    rails: [],
    debris: [],
    isHolding: false
};

railGrider.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'CYBER', color: '#00ff88' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.rails = [];
    this.debris = [];
    this.isHolding = false;
    this.player.y = 150;
    
    this.resizeCanvas();
    
    // Construct sequential interlocking track structures layout strings
    const rh = this.canvas.height * 0.65;
    this.rails.push({ x: 0, y: rh, width: this.canvas.width * 1.5 });
    
    this._downRef = (e) => { e.preventDefault(); this.isHolding = true; };
    this._upRef = () => { this.isHolding = false; };
    
    this.canvas.addEventListener('mousedown', this._downRef);
    this.canvas.addEventListener('touchstart', this._downRef, { passive: false });
    window.addEventListener('mouseup', this._upRef);
    window.addEventListener('touchend', this._upRef);
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

railGrider.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

railGrider.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

railGrider.updatePhysics = function() {
    const scrollSpeed = 6;
    const targetRailY = this.canvas.height * 0.65;
    
    if (this.isHolding) {
        // Snap down onto laser grid line path metrics
        this.player.y += (targetRailY - this.player.y) * 0.35;
        
        // Gain reward scrap units for consecutive track riding hold counts
        if (this.frameCount % 15 === 0) {
            let gain = this.isApexEvent ? 20 : 10;
            this.bonusScrapEarned += gain;
            const hudScrap = document.getElementById('game-hud-scrap');
            if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            
            if (this.ammoPool > 0) {
                this.ammoPool--;
                const hudAmmo = document.getElementById('game-hud-ammo');
                if (hudAmmo) hudAmmo.innerText = this.ammoPool;
            }
        }
    } else {
        // Float upwards into anti-gravity airspace
        this.player.y -= 3;
        if (this.player.y < 40) this.player.y = 40;
    }
    
    // Spawn floating asteroid blocks scrolling across screen views lanes
    if (this.frameCount % (this.isApexEvent ? 30 : 55) === 0) {
        this.debris.push({
            x: this.canvas.width + 40,
            y: targetRailY - 55 - (Math.random() * 50),
            size: 30
        });
    }
    
    // Move debris leftward and assess crash metrics
    for (let i = this.debris.length - 1; i >= 0; i--) {
        let d = this.debris[i];
        d.x -= scrollSpeed;
        
        // Grid obstacle crash checks trigger spending fuel blocks
        if (Math.abs(this.player.x - d.x) < 20 && Math.abs(this.player.y - d.y) < 20) {
            if (this.ammoPool > 15) {
                this.ammoPool -= 15;
                const hudAmmo = document.getElementById('game-hud-ammo');
                if (hudAmmo) hudAmmo.innerText = this.ammoPool;
            }
            this.debris.splice(i, 1);
            continue;
        }
        if (d.x < -40) this.debris.splice(i, 1);
    }
};

railGrider.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const targetRailY = this.canvas.height * 0.65;
    
    // Draw Neon Magnet Rail Grid lines paths
    ctx.save();
    ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 4;
    ctx.shadowBlur = 15; ctx.shadowColor = '#00e5ff';
    ctx.beginPath(); ctx.moveTo(0, targetRailY); ctx.lineTo(this.canvas.width, targetRailY); ctx.stroke();
    ctx.restore();
    
    // Draw Obstacles Asteroids blocks
    ctx.fillStyle = this.biome.color;
    this.debris.forEach(d => {
        ctx.fillRect(d.x - d.size/2, d.y - d.size/2, d.size, d.size);
    });
    
    // Draw Surfer Starfighter Vessel
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = this.isHolding ? 20 : 8; ctx.shadowColor = '#00e5ff';
    ctx.beginPath(); ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
};

railGrider.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
    }
    window.removeEventListener('mouseup', this._upRef);
    window.removeEventListener('touchend', this._upRef);
};
