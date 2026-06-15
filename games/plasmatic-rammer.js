/**
 * PLASMATIC-RAMMER.JS [ S-TIER MODULE ]
 * High-Mass Kinetic Wedge Shield Demolition Suite.
 * Controls: Hold down to flare plasma shield and smash directly into structures.
 */

const plasmaticRammer = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    player: { x: 100, y: 200, radius: 15 },
    walls: [],
    isHolding: false
};

plasmaticRammer.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'TOXIC', color: '#ccff00' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.walls = [];
    this.isHolding = false;
    this.player.y = this.canvas ? this.canvas.height / 2 : 200;
    
    this.resizeCanvas();
    
    this._downRef = (e) => { e.preventDefault(); this.isHolding = true; };
    this._upRef = () => { this.isHolding = false; };
    this._moveRef = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        this.player.y = clientY - rect.top;
    };
    
    this.canvas.addEventListener('mousedown', this._downRef);
    this.canvas.addEventListener('touchstart', this._downRef, { passive: false });
    this.canvas.addEventListener('mousemove', this._moveRef);
    this.canvas.addEventListener('touchmove', this._moveRef, { passive: true });
    window.addEventListener('mouseup', this._upRef);
    window.addEventListener('touchend', this._upRef);
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

plasmaticRammer.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

plasmaticRammer.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

plasmaticRammer.updatePhysics = function() {
    const scrollSpeed = this.isApexEvent ? 8 : 6;
    
    // Spend energy while heavy shields are flared open
    if (this.isHolding && this.frameCount % 6 === 0 && this.ammoPool > 0) {
        this.ammoPool--;
        const hudAmmo = document.getElementById('game-hud-ammo');
        if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    }
    
    // Spawn floating defense block obstructions ahead
    if (this.frameCount % (this.isApexEvent ? 20 : 35) === 0) {
        this.walls.push({
            x: this.canvas.width + 40,
            y: Math.random() * (this.canvas.height - 100) + 50,
            width: 30,
            height: 60 + Math.random() * 40
        });
    }
    
    // Move barriers and parse smash/crash values
    for (let i = this.walls.length - 1; i >= 0; i--) {
        let w = this.walls[i];
        w.x -= scrollSpeed;
        
        // Accurate bounding box proximity intersection checks
        let boxCollide = (this.player.x + 25 > w.x && this.player.x - 15 < w.x + w.width &&
                          this.player.y + 25 > w.y && this.player.y - 25 < w.y + w.height);
                          
        if (boxCollide) {
            if (this.isHolding) {
                // Shield open -> BASH SUCCESS! Convert structure to scrap currency
                let payload = this.isApexEvent ? 30 : 15;
                this.bonusScrapEarned += payload;
                const hudScrap = document.getElementById('game-hud-scrap');
                if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            } else {
                // Shield closed -> Hull impact breach. Deduct safety volts
                if (this.ammoPool > 15) this.ammoPool -= 15;
                const hudAmmo = document.getElementById('game-hud-ammo');
                if (hudAmmo) hudAmmo.innerText = this.ammoPool;
            }
            this.walls.splice(i, 1);
            continue;
        }
        if (w.x < -60) this.walls.splice(i, 1);
    }
};

plasmaticRammer.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Inbound Structures
    ctx.fillStyle = '#444444';
    this.walls.forEach(w => {
        ctx.fillRect(w.x, w.y, w.width, w.height);
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 1;
        ctx.strokeRect(w.x, w.y, w.width, w.height);
    });
    
    // Draw Flared Wedge Deflector Shield Node
    if (this.isHolding) {
        ctx.save();
        ctx.strokeStyle = this.biome.color;
        ctx.lineWidth = 5;
        ctx.shadowBlur = 20; ctx.shadowColor = this.biome.color;
        ctx.beginPath();
        ctx.moveTo(this.player.x + 10, this.player.y - 35);
        ctx.lineTo(this.player.x + 35, this.player.y);
        ctx.lineTo(this.player.x + 10, this.player.y + 35);
        ctx.stroke();
        ctx.restore();
    }
    
    // Draw Player Ship Core
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(this.player.x + 15, this.player.y);
    ctx.lineTo(this.player.x - 15, this.player.y - 12);
    ctx.lineTo(this.player.x - 15, this.player.y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
};

plasmaticRammer.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
        this.canvas.removeEventListener('mousemove', this._moveRef);
        this.canvas.removeEventListener('touchmove', this._moveRef);
    }
    window.removeEventListener('mouseup', this._upRef);
    window.removeEventListener('touchend', this._upRef);
};
