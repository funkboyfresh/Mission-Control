/**
 * SHIELD-FORGE.JS [ S-TIER PREPARATION MODULE ]
 * Methodical Wedge Armor Plating Stacking Simulator.
 * Controls: Tap anywhere to drop the moving component squarely onto the target layer.
 */

const shieldForge = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    block: { x: 50, y: 60, width: 140, speed: 4, dir: 1 },
    layers: [],
    maxLayers: 5
};

shieldForge.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'TOXIC', color: '#ccff00' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.layers = [];
    this.block.x = 50;
    this.block.width = 140;
    this.block.speed = this.isApexEvent ? 6 : 4;
    this.block.dir = 1;
    
    this.resizeCanvas();
    
    this._dropRef = (e) => {
        e.preventDefault();
        this.dropPlatingLayer();
    };
    
    this.canvas.addEventListener('mousedown', this._dropRef);
    this.canvas.addEventListener('touchstart', this._dropRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

shieldForge.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.block.y = 60;
};

shieldForge.dropPlatingLayer = function() {
    if (this.layers.length >= this.maxLayers) return;
    
    const h = this.canvas.height;
    const targetY = h - 100 - (this.layers.length * 35);
    
    // Check intersection with previous baseline layer width bounds
    let baseLeft = 0;
    let baseRight = this.canvas.width;
    
    if (this.layers.length > 0) {
        let prev = this.layers[this.layers.length - 1];
        baseLeft = prev.x;
        baseRight = prev.x + prev.width;
    }
    
    let blockLeft = this.block.x;
    let blockRight = this.block.x + this.block.width;
    
    // Calculate overlapping alignment boundaries
    let overlapLeft = Math.max(baseLeft, blockLeft);
    let overlapRight = Math.min(baseRight, blockRight);
    let overlapWidth = overlapRight - overlapLeft;
    
    if (overlapWidth > 15) {
        // SUCCESS: Secure weld locked onto grid
        this.layers.push({
            x: overlapLeft,
            y: targetY,
            width: overlapWidth
        });
        
        let reward = this.isApexEvent ? 30 : 15;
        this.bonusScrapEarned += reward;
        
        // Dynamic trimming: adjust following block size down to the new locked dimension
        this.block.width = overlapWidth;
        
        const hudScrap = document.getElementById('game-hud-scrap');
        if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
    } else {
        // Misalignment penalty drains ammunition core points
        if (this.ammoPool > 10) this.ammoPool -= 10;
        const hudAmmo = document.getElementById('game-hud-ammo');
        if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    }
};

shieldForge.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

shieldForge.updatePhysics = function() {
    // Slide dropping tiles across horizontal tracking paths
    this.block.x += this.block.speed * this.block.dir;
    if (this.block.x < 20 || this.block.x + this.block.width > this.canvas.width - 20) {
        this.block.dir *= -1;
    }
};

shieldForge.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Stationary Anchor Foundation Deck line
    ctx.strokeStyle = '#333333'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, this.canvas.height - 95); ctx.lineTo(this.canvas.width, this.canvas.height - 95); ctx.stroke();
    
    // Draw Completed Shield Layers
    ctx.fillStyle = this.biome.color;
    this.layers.forEach(l => {
        ctx.fillRect(l.x, l.y, l.width, 30);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.strokeRect(l.x, l.y, l.width, 30);
    });
    
    // Draw Sweeping Plating Component
    if (this.layers.length < this.maxLayers) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12; ctx.shadowColor = this.biome.color;
        ctx.fillRect(this.block.x, this.block.y, this.block.width, 30);
        ctx.restore();
    } else {
        ctx.save();
        ctx.fillStyle = '#00ffaa'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
        ctx.fillText("SHIELD ARMOR FORGE COMPLETE", this.canvas.width/2, 45);
        ctx.restore();
    }
};

shieldForge.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._dropRef);
        this.canvas.removeEventListener('touchstart', this._dropRef);
    }
};
