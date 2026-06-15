/**
 * FUSION-CASCADE.JS [ S-TIER MODULE ]
 * Chained Domino Shockwave Energy Dispersal Simulation.
 * Controls: Tap once per sequence to deploy a static cascade detonation point.
 */

const fusionCascade = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    nodes: [],
    explosions: [],
    seedPlaced: false
};

fusionCascade.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'PLASMA', color: '#7700ff' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.nodes = [];
    this.explosions = [];
    this.seedPlaced = false;
    
    this.resizeCanvas();
    
    // Spawn floating volatile drone matrices moving erratically
    const count = this.isApexEvent ? 45 : 25;
    for (let i = 0; i < count; i++) {
        this.nodes.push({
            x: Math.random() * (this.canvas.width - 60) + 30,
            y: Math.random() * (this.canvas.height - 120) + 60,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            radius: 6
        });
    }
    
    this._clickRef = (e) => {
        e.preventDefault();
        if (this.seedPlaced || this.ammoPool < 15) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        this.ammoPool -= 15;
        const hudAmmo = document.getElementById('game-hud-ammo');
        if (hudAmmo) hudAmmo.innerText = this.ammoPool;
        
        this.seedPlaced = true;
        // Ignite original shockwave point
        this.explosions.push({
            x: clientX - rect.left,
            y: clientY - rect.top,
            radius: 2,
            maxRadius: 65,
            age: 1.0
        });
    };
    
    this.canvas.addEventListener('mousedown', this._clickRef);
    this.canvas.addEventListener('touchstart', this._clickRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

fusionCascade.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

fusionCascade.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

fusionCascade.updatePhysics = function() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Move ambient drift nodes mapping paths
    this.nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 10 || n.x > w - 10) n.vx *= -1;
        if (n.y < 10 || n.y > h - 10) n.vy *= -1;
    });
    
    // Expand exploding blast shockwave bounds
    for (let i = this.explosions.length - 1; i >= 0; i--) {
        let exp = this.explosions[i];
        exp.radius += 2.2;
        exp.age -= 0.015;
        
        // Scan floating grid node elements touched by this ring envelope
        for (let j = this.nodes.length - 1; j >= 0; j--) {
            let n = this.nodes[j];
            let dist = Math.hypot(n.x - exp.x, n.y - exp.y);
            
            if (dist < exp.radius + n.radius) {
                // CHAIN BREAKOUT TRIGGERED! Chain secondary domino ring bubble
                this.explosions.push({
                    x: n.x, y: n.y,
                    radius: 4, maxRadius: 60, age: 1.0
                });
                
                let pay = this.isApexEvent ? 20 : 10;
                this.bonusScrapEarned += pay;
                const hudScrap = document.getElementById('game-hud-scrap');
                if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
                
                this.nodes.splice(j, 1);
            }
        }
        
        if (exp.age <= 0 || exp.radius >= exp.maxRadius) {
            this.explosions.splice(i, 1);
        }
    }
};

fusionCascade.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Intact Drift Targets
    ctx.fillStyle = '#ffffff';
    this.nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2); ctx.fill();
    });
    
    // Draw Chaining Shockwave Vectors
    this.explosions.forEach(exp => {
        ctx.save();
        ctx.globalAlpha = exp.age;
        ctx.strokeStyle = this.biome.color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15; ctx.shadowColor = this.biome.color;
        ctx.beginPath(); ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    });
    
    // Guide reminder if seed hasn't dropped yet
    if (!this.seedPlaced) {
        ctx.save();
        ctx.fillStyle = '#666666'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
        ctx.fillText("TAP SCREEN TARGETING AXIS TO RE-ROUTE CASCADE IGNITION", this.canvas.width/2, 45);
        ctx.restore();
    }
};

fusionCascade.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._clickRef);
        this.canvas.removeEventListener('touchstart', this._clickRef);
    }
};
