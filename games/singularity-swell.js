/**
 * SINGULARITY-SWELL.JS
 * HTML5 Canvas Hole.io style event-horizon physics devour engine.
 * Items smaller than the hole are pulled down and consumed to expand mass.
 */

const singularitySwell = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    // Core Parameters
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    // Entity Profiles
    player: { x: 0, y: 0, radius: 24, baseRadius: 24, mass: 0, targetMassNeeded: 100 },
    debris: [],
    particles: [],
    floatingTexts: [],
    mouse: { x: 0, y: 0, isDown: false }
};

singularitySwell.init = function(canvas, ctx, biome, isApex, ammo) {
    try {
        this.canvas = canvas;
        this.ctx = ctx;
        this.biome = biome || { id: 'TOXIC', color: '#ccff00' };
        this.isApexEvent = isApex;
        this.ammoPool = (ammo || 20) * 4; // Calibration overcharge conversion
        this.bonusScrapEarned = 0;
        this.frameCount = 0;
        
        // Reset Player Parameters
        this.player.radius = this.player.baseRadius;
        this.player.mass = 0;
        this.player.targetMassNeeded = 100;
        
        this.debris = [];
        this.particles = [];
        this.floatingTexts = [];
        this.mouse.isDown = false;
        
        this.resizeCanvas();
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        this.mouse.x = this.canvas.width / 2;
        this.mouse.y = this.canvas.height / 2;
        
        // Seed initial space junk matrix configurations (Small, Medium, and Large structures)
        const totalItems = this.isApexEvent ? 45 : 30;
        for (let i = 0; i < totalItems; i++) {
            this.spawnRandomDebris(true);
        }
        
// Mount Operational Scanners
        this._moveRef = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        };
        // --- [ NEW: TOUCH SCREEN TELEMETRY ] ---
        this._touchRef = (e) => {
            if(e.touches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.touches[0].clientX - rect.left;
                this.mouse.y = e.touches[0].clientY - rect.top;
            }
        };
        this._downRef = () => { this.mouse.isDown = true; };
        this._upRef = () => { this.mouse.isDown = false; };
        this._resizeRef = () => this.resizeCanvas();
        
        this.canvas.addEventListener('mousemove', this._moveRef);
        this.canvas.addEventListener('touchmove', this._touchRef, { passive: false });
        this.canvas.addEventListener('mousedown', this._downRef);
        this.canvas.addEventListener('touchstart', this._downRef, { passive: false });
        this.canvas.addEventListener('mouseup', this._upRef);
        this.canvas.addEventListener('touchend', this._upRef);
        window.addEventListener('resize', this._resizeRef);
        
        this.loopActive = true;
        this.executeSimulationLoop();
    } catch (err) {
        alert("CRITICAL SYNC FAILURE DURING SWELL INIT BLOCK:\n" + err.message);
    }
};

singularitySwell.spawnRandomDebris = function(scatteredRandomly) {
    // Categorize item types like Hole.io (Dust particles, Comets, Satellite Arrays)
    const roll = Math.random();
    let type = "DUST";
    let radius = 6;
    let scoreValue = 10;
    let color = "#ffffff";
    
    if (roll > 0.85) {
        type = "FRIGATE_HULL";
        radius = 28;
        scoreValue = 60;
        color = "#ffaa00";
    } else if (roll > 0.55) {
        type = "ASTEROID";
        radius = 15;
        scoreValue = 25;
        color = "#888899";
    }
    
    let sx, sy;
    if (scatteredRandomly) {
        sx = Math.random() * this.canvas.width;
        sy = Math.random() * this.canvas.height;
    } else {
        // Spawn on random edges to replenish consumed map elements safely
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) { sx = Math.random() * this.canvas.width; sy = -40; }
        else if (edge === 1) { sx = this.canvas.width + 40; sy = Math.random() * this.canvas.height; }
        else if (edge === 2) { sx = Math.random() * this.canvas.width; sy = this.canvas.height + 40; }
        else { sx = -40; sy = Math.random() * this.canvas.height; }
    }
    
    this.debris.push({
        x: sx, y: sy,
        radius: radius,
        type: type,
        scoreValue: scoreValue,
        color: color,
        vx: (Math.random() - 0.5) * 0.4, // Gentle celestial drift velocity
        vy: (Math.random() - 0.5) * 0.4
    });
};

singularitySwell.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

singularitySwell.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    try {
        this.frameCount++;
        this.updatePhysics();
        this.drawScene();
        this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
    } catch (frameError) {
        this.loopActive = false;
        alert("CRITICAL RENDER THASH INTERCEPTED INSIDE SWELL STEP:\n" + frameError.message);
    }
};

singularitySwell.updatePhysics = function() {
    // 1. Smoothly glide black hole coordinates toward the mouse position
    let dx = this.mouse.x - this.player.x;
    let dy = this.mouse.y - this.player.y;
    this.player.x += dx * 0.12;
    this.player.y += dy * 0.12;
    
    // 2. Process Energy Overcharge Spending Mechanics
    let currentSuctionRange = this.player.radius * 2.2;
    let suctionForceMultiplier = 1.0;
    let overchargeActive = false;
    
    if (this.mouse.isDown && this.ammoPool > 0) {
        overchargeActive = true;
        currentSuctionRange = this.player.radius * 5.0; // Massive range expansion
        suctionForceMultiplier = 3.2;                  // Violent velocity pull
        
        // Drain ammo over time metrics
        if (this.frameCount % 5 === 0) {
            this.ammoPool--;
            const hudAmmo = document.getElementById('game-hud-ammo');
            if (hudAmmo) hudAmmo.innerText = this.ammoPool;
        }
    }
    
    // 3. Process Hole.io Gravitational Proximity Matrices
    for (let i = this.debris.length - 1; i >= 0; i--) {
        let item = this.debris[i];
        item.x += item.vx; item.y += item.vy; // Apply gentle background drift
        
        let idx = this.player.x - item.x;
        let idy = this.player.y - item.y;
        let idist = Math.sqrt(idx * idx + idy * idy);
        
        // Suction evaluation pass
        if (idist < currentSuctionRange) {
            // Check Scale: Only items physical smaller than the hole get sucked in!
            if (item.radius < this.player.radius) {
                let pullStrength = ((currentSuctionRange - idist) / currentSuctionRange) * 0.28 * suctionForceMultiplier;
                item.x += (idx / idist) * pullStrength * 8;
                item.y += (idy / idist) * pullStrength * 8;
                
                // Devour Condition (Item reaches the core vortex center threshold)
                if (idist < this.player.radius * 0.5) {
                    this.triggerDevourFX(item.x, item.y, item.color);
                    
                    let earnedVal = Math.round(item.scoreValue * (this.isApexEvent ? 2.5 : 1.0));
                    this.bonusScrapEarned += earnedVal;
                    this.player.mass += item.scoreValue;
                    
                    this.floatingTexts.push({ x: item.x, y: item.y - 10, text: `+${earnedVal}`, color: '#00ff88', alpha: 1 });
                    const hudScrap = document.getElementById('game-hud-scrap');
                    if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
                    
                    // Expand Event Horizon Size if mass constraints are cleared
                    if (this.player.mass >= this.player.targetMassNeeded) {
                        this.player.radius = Math.min(this.player.maxRadius || 110, this.player.radius + 8);
                        this.player.mass = 0;
                        this.player.targetMassNeeded = Math.round(this.player.targetMassNeeded * 1.35);
                        this.floatingTexts.push({ x: this.player.x, y: this.player.y - 30, text: "SINGULARITY EXPANDED", color: this.biome.color, alpha: 1 });
                    }
                    
                    this.debris.splice(i, 1);
                    this.spawnRandomDebris(false); // Instantly replenish map item balance
                    continue;
                }
            } else {
                // If the item is larger than your hole, it bounces off the edges or blocks you
                if (idist < this.player.radius + item.radius * 0.4) {
                    let pushBack = (this.player.radius + item.radius * 0.4) - idist;
                    item.x -= (idx / idist) * pushBack * 0.5;
                    item.y -= (idy / idist) * pushBack * 0.5;
                }
            }
        }
    }
    
    // 4. Decay Special Effect Handlers
    for (let i = this.particles.length - 1; i >= 0; i--) {
        let pt = this.particles[i];
        pt.x += pt.vx; pt.y += pt.vy;
        // Gravity pulls fragments straight into the center core hole coordinates
        let cdx = this.player.x - pt.x;
        let cdy = this.player.y - pt.y;
        let cd = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cd > 2) { pt.x += (cdx / cd) * 1.5; pt.y += (cdy / cd) * 1.5; }
        pt.alpha -= 0.03;
        if (pt.alpha <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        let t = this.floatingTexts[i];
        t.y -= 0.6; t.alpha -= 0.02;
        if (t.alpha <= 0) this.floatingTexts.splice(i, 1);
    }
};

singularitySwell.triggerDevourFX = function(x, y, color) {
    for (let i = 0; i < 8; i++) {
        let a = Math.random() * Math.PI * 2;
        let s = Math.random() * 3 + 1;
        this.particles.push({
            x: x, y: y,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            radius: Math.random() * 2 + 1, alpha: 1, color: color
        });
    }
};

singularitySwell.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 1. Draw Singularity Vacuum Pull Field Ring Guidelines
    let holdingClick = this.mouse.isDown && this.ammoPool > 0;
    ctx.save();
    ctx.strokeStyle = this.biome.color;
    ctx.globalAlpha = holdingClick ? 0.25 : 0.06;
    ctx.lineWidth = holdingClick ? 3 : 1;
    if (holdingClick) ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, this.player.radius * (holdingClick ? 5.0 : 2.2), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // 2. Render Debris/Scrap Targets Across Map
    this.debris.forEach(item => {
        ctx.save();
        ctx.strokeStyle = item.color;
        // Visual indicator clue: if item is too large to fit down the hole, make its fill hollow/faded
        let canDevour = item.radius < this.player.radius;
        ctx.fillStyle = canDevour ? item.color : 'transparent';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        if (item.type === "FRIGATE_HULL") {
            // Draw angular cross fragments shards blocks
            ctx.rect(item.x - item.radius, item.y - item.radius, item.radius * 2, item.radius * 1.2);
        } else if (item.type === "ASTEROID") {
            ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        } else {
            ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        }
        
        ctx.fill(); ctx.stroke();
        ctx.restore();
    });
    
    // 3. Render Shards FX Particles
    this.particles.forEach(pt => {
        ctx.save(); ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
    
    // 4. Draw the Swelling Devour Hole.io Circle Horizon Core
    ctx.save();
    ctx.fillStyle = "#000000"; // Pure abyssal absolute black space
    ctx.strokeStyle = this.biome.color;
    ctx.lineWidth = holdingClick ? 4 : 2;
    ctx.shadowBlur = holdingClick ? 20 : 8;
    ctx.shadowColor = this.biome.color;
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.restore();
    
    // 5. Floating text parameters overlays
    this.floatingTexts.forEach(t => {
        ctx.save(); ctx.globalAlpha = t.alpha;
        ctx.fillStyle = t.color;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    });
};

singularitySwell.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    this.ammoPool = Math.ceil(this.ammoPool / 4);
    if (this.canvas) {
        this.canvas.removeEventListener('mousemove', this._moveRef);
        this.canvas.removeEventListener('touchmove', this._touchRef);
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
        this.canvas.removeEventListener('mouseup', this._upRef);
        this.canvas.removeEventListener('touchend', this._upRef);
    }
    window.removeEventListener('resize', this._resizeRef);
};
