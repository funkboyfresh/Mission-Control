/**
 * SUPERNOVA-ESCAPE.JS [ S-TIER MODULE ]
 * HTML5 Canvas Side-Scrolling Thruster-Pulse Survival Matrix.
 * Controls: Tap/Click to apply upward thruster velocity. Hold to burn shield energy.
 */

const supernovaEscape = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    // Mission Parameters
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    // Player Physics
    player: { x: 100, y: 0, radius: 14, vy: 0, gravity: 0.4, thrust: -7.5 },
    obstacles: [],
    scrap: [],
    particles: [],
    floatingTexts: [],
    
    mouse: { isDown: false }
};

supernovaEscape.init = function(canvas, ctx, biome, isApex, ammo) {
    try {
        this.canvas = canvas;
        this.ctx = ctx;
        this.biome = biome || { id: 'MAGMA', color: '#ff3366' };
        this.isApexEvent = isApex;
        this.ammoPool = (ammo || 20) * 4; 
        this.bonusScrapEarned = 0;
        this.frameCount = 0;
        
        this.obstacles = [];
        this.scrap = [];
        this.particles = [];
        this.floatingTexts = [];
        this.mouse.isDown = false;
        
        this.resizeCanvas();
        this.player.y = this.canvas.height / 2;
        this.player.vy = 0;
        
        // Input Event Nodes (Binds unified mouse-click and mobile touch events)
        this._downRef = (e) => {
            e.preventDefault();
            this.mouse.isDown = true;
            // Apply instant snappy kinematic lift pulse on initial tap
            this.player.vy = this.player.thrust;
            this.triggerThrusterSparks();
        };
        this._upRef = () => { this.mouse.isDown = false; };
        this._resizeRef = () => this.resizeCanvas();
        
        this.canvas.addEventListener('mousedown', this._downRef);
        this.canvas.addEventListener('touchstart', this._downRef, { passive: false });
        this.canvas.addEventListener('mouseup', this._upRef);
        this.canvas.addEventListener('touchend', this._upRef);
        window.addEventListener('resize', this._resizeRef);
        
        this.loopActive = true;
        this.executeSimulationLoop();
    } catch (err) {
        alert("CRITICAL SYNC FAILURE DURING SUPERNOVA INIT:\n" + err.message);
    }
};

supernovaEscape.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

supernovaEscape.spawnThreatMatrix = function() {
    const scrollSpeed = this.isApexEvent ? 8 : 6;
    
    // Spawn Obstacle Blocks
    if (this.frameCount % 70 === 0) {
        const height = Math.random() * (this.canvas.height * 0.4) + 60;
        const isTop = Math.random() > 0.5;
        this.obstacles.push({
            x: this.canvas.width + 50,
            y: isTop ? 0 : this.canvas.height - height,
            width: 40,
            height: height,
            speed: scrollSpeed
        });
    }
    
    // Spawn Resource Collectibles
    if (this.frameCount % 45 === 0) {
        this.scrap.push({
            x: this.canvas.width + 30,
            y: Math.random() * (this.canvas.height - 100) + 50,
            radius: 5,
            speed: scrollSpeed,
            color: '#00ff88'
        });
    }
};

supernovaEscape.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    try {
        this.frameCount++;
        this.updatePhysics();
        this.drawScene();
        this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
    } catch (frameError) {
        this.loopActive = false;
        alert("CRITICAL RENDER FAILURE INSIDE SUPERNOVA STEP:\n" + frameError.message);
    }
};

supernovaEscape.updatePhysics = function() {
    this.spawnThreatMatrix();
    
    // 1. Apply Gravitational Drag and Momentum Vector
    this.player.vy += this.player.gravity;
    this.player.y += this.player.vy;
    
    // Constrain to atmospheric floor/ceiling boundaries
    if (this.player.y < this.player.radius) {
        this.player.y = this.player.radius;
        this.player.vy = 0;
    }
    if (this.player.y > this.canvas.height - this.player.radius) {
        this.player.y = this.canvas.height - this.player.radius;
        this.player.vy = 0;
    }
    
    // 2. Evaluate Invulnerability Shield Energy Spending Matrix
    let shieldActive = false;
    if (this.mouse.isDown && this.ammoPool > 0) {
        shieldActive = true;
        if (this.frameCount % 5 === 0) {
            this.ammoPool--;
            const hudAmmo = document.getElementById('game-hud-ammo');
            if (hudAmmo) hudAmmo.innerText = this.ammoPool;
        }
    }
    
    // 3. Process Scrolling Obstacles & Collision Shards
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
        let obs = this.obstacles[i];
        obs.x -= obs.speed;
        
        // AABB Box Collision Check against the player sphere
        let closestX = Math.max(obs.x, Math.min(this.player.x, obs.x + obs.width));
        let closestY = Math.max(obs.y, Math.min(this.player.y, obs.y + obs.height));
        let distanceX = this.player.x - closestX;
        let distanceY = this.player.y - closestY;
        let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        
        if (distanceSquared < (this.player.radius * this.player.radius)) {
            if (shieldActive) {
                // If shield is active, smash through obstacles and earn bonus score!
                this.triggerDebrisExplosion(obs.x + obs.width/2, obs.y + obs.height/2, this.biome.color);
                this.floatingTexts.push({ x: obs.x, y: this.player.y, text: "SMASH! +10", color: '#ffffff', alpha: 1 });
                this.bonusScrapEarned += 10;
                this.obstacles.splice(i, 1);
            } else {
                // Failsafe recovery: push ship back cleanly to prevent hard collision locks
                this.player.vy = 4;
                this.floatingTexts.push({ x: this.player.x, y: this.player.y - 20, text: "HULL DAMAGE", color: '#ff0033', alpha: 1 });
            }
        }
        
        if (obs.x + obs.width < -50) this.obstacles.splice(i, 1);
    }
    
    // 4. Process Resource Matrix
    for (let i = this.scrap.length - 1; i >= 0; i--) {
        let s = this.scrap[i];
        s.x -= s.speed;
        
        let sdx = this.player.x - s.x;
        let sdy = this.player.y - s.y;
        let sdist = Math.sqrt(sdx * sdx + sdy * sdy);
        
        // Shield Magnetosphere pulling mechanics
        if (shieldActive && sdist < 160) {
            s.x += (sdx / sdist) * 8;
            s.y += (sdy / sdist) * 8;
        }
        
        if (sdist < this.player.radius + s.radius) {
            let value = this.isApexEvent ? 20 : 10;
            this.bonusScrapEarned += value;
            this.floatingTexts.push({ x: s.x, y: s.y, text: `+${value}`, color: s.color, alpha: 1 });
            
            const hudScrap = document.getElementById('game-hud-scrap');
            if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            
            this.scrap.splice(i, 1);
            continue;
        }
        
        if (s.x < -50) this.scrap.splice(i, 1);
    }
    
    // 5. Particle decay metrics
    for (let i = this.particles.length - 1; i >= 0; i--) {
        let p = this.particles[i];
        p.x += p.vx; p.y += p.vy;
        p.alpha -= 0.04;
        if (p.alpha <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        let t = this.floatingTexts[i];
        t.y -= 0.5; t.alpha -= 0.02;
        if (t.alpha <= 0) this.floatingTexts.splice(i, 1);
    }
};

supernovaEscape.triggerThrusterSparks = function() {
    for (let i = 0; i < 4; i++) {
        this.particles.push({
            x: this.player.x - 10, y: this.player.y,
            vx: -Math.random() * 3 - 2, vy: (Math.random() - 0.5) * 3,
            radius: Math.random() * 2 + 1, alpha: 1, color: '#ffaa00'
        });
    }
};

supernovaEscape.triggerDebrisExplosion = function(x, y, color) {
    for (let i = 0; i < 8; i++) {
        let a = Math.random() * Math.PI * 2;
        let s = Math.random() * 4 + 2;
        this.particles.push({
            x: x, y: y,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            radius: Math.random() * 3 + 1, alpha: 1, color: color
        });
    }
};

supernovaEscape.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    let shieldActive = this.mouse.isDown && this.ammoPool > 0;
    
    // Draw Scrolling Obstacles
    this.obstacles.forEach(obs => {
        ctx.save();
        ctx.fillStyle = this.biome.color;
        ctx.globalAlpha = 0.15;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = this.biome.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10; ctx.shadowColor = this.biome.color;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        ctx.restore();
    });
    
    // Draw Scrap Matrix
    this.scrap.forEach(s => {
        ctx.save();
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 8; ctx.shadowColor = s.color;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
    
    // Draw Particles
    this.particles.forEach(p => {
        ctx.save(); ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
    
    // Draw Player Ship Core
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = shieldActive ? 25 : 10;
    ctx.shadowColor = shieldActive ? this.biome.color : '#ffffff';
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw Activated Shield Cocoon
    if (shieldActive) {
        ctx.strokeStyle = this.biome.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, this.player.radius * 2.0, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
    
    // Draw Text Overlays
    this.floatingTexts.forEach(t => {
        ctx.save(); ctx.globalAlpha = t.alpha;
        ctx.fillStyle = t.color;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    });
};

supernovaEscape.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    this.ammoPool = Math.ceil(this.ammoPool / 4);
    
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
        this.canvas.removeEventListener('mouseup', this._upRef);
        this.canvas.removeEventListener('touchend', this._upRef);
    }
    window.removeEventListener('resize', this._resizeRef);
};
