/**
 * OUROBOROS-SWEEP.JS [ S-TIER MODULE ]
 * HTML5 Canvas Snake.io style physics engine.
 * Features: Kinematic segment tracking, mass expansion, and energy-fueled magnetic dashing.
 */

const ouroborosSweep = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    // Economy & Biome Data
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    // DOM Layers
    viewportElement: null,
    
    // Physics Entities
    segments: [], // index 0 is the head, the rest follow
    baseSpeed: 5,
    boostSpeed: 10,
    scrap: [],
    particles: [],
    floatingTexts: [],
    
    mouse: { x: 0, y: 0, isDown: false }
};

ouroborosSweep.init = function(canvas, ctx, biome, isApex, ammo) {
    try {
        this.canvas = canvas;
        this.ctx = ctx;
        this.biome = biome || { id: 'SPORE', color: '#b266ff' };
        this.isApexEvent = isApex;
        this.ammoPool = (ammo || 20) * 5; 
        this.bonusScrapEarned = 0;
        this.frameCount = 0;
        
        this.scrap = [];
        this.particles = [];
        this.floatingTexts = [];
        this.mouse.isDown = false;
        
        this.resizeCanvas();
        this.mouse.x = this.canvas.width / 2;
        this.mouse.y = this.canvas.height / 2;
        
        // Initialize the Centipede (Head + 4 initial tail segments)
        this.segments = [];
        for(let i = 0; i < 5; i++) {
            this.segments.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2 + (i * 15),
                radius: i === 0 ? 16 : 10 // Head is larger
            });
        }
        
        // Seed the map with initial scrap
        const totalScrap = this.isApexEvent ? 60 : 40;
        for(let i = 0; i < totalScrap; i++) {
            this.spawnScrap(true);
        }
        
        // Event Listeners (Desktop + Mobile Touch)
        this._moveRef = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        };
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
        alert("CRITICAL SYNC FAILURE DURING OUROBOROS INIT:\n" + err.message);
    }
};

ouroborosSweep.spawnScrap = function(randomStart) {
    let sx = randomStart ? Math.random() * this.canvas.width : (Math.random() > 0.5 ? -20 : this.canvas.width + 20);
    let sy = randomStart ? Math.random() * this.canvas.height : Math.random() * this.canvas.height;
    
    const isHighValue = Math.random() > 0.85;
    
    this.scrap.push({
        x: sx, y: sy,
        radius: isHighValue ? 6 : 3,
        color: isHighValue ? '#00ff88' : '#ffffff',
        value: isHighValue ? 15 : 5,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5
    });
};

ouroborosSweep.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

ouroborosSweep.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    try {
        this.frameCount++;
        this.updatePhysics();
        this.drawScene();
        this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
    } catch (frameError) {
        this.loopActive = false;
        alert("CRITICAL RENDER THREAD CRASH INSIDE OUROBOROS STEP:\n" + frameError.message);
    }
};

ouroborosSweep.updatePhysics = function() {
    // 1. Process Energy Boost & Magnetic Vacuum
    let currentSpeed = this.baseSpeed;
    let magnetRange = 40;
    let isBoosting = false;
    
    if (this.mouse.isDown && this.ammoPool > 0) {
        isBoosting = true;
        currentSpeed = this.boostSpeed;
        magnetRange = 180; // Expand vacuum field
        
        if (this.frameCount % 4 === 0) {
            this.ammoPool--;
            const hudAmmo = document.getElementById('game-hud-ammo');
            if (hudAmmo) hudAmmo.innerText = this.ammoPool;
            
            // Drop a trail particle when boosting
            this.particles.push({
                x: this.segments[this.segments.length-1].x,
                y: this.segments[this.segments.length-1].y,
                vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
                radius: 3, alpha: 1, color: this.biome.color
            });
        }
    }
    
    // 2. Head Movement (Kinematic steering towards mouse)
    let head = this.segments[0];
    let dx = this.mouse.x - head.x;
    let dy = this.mouse.y - head.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > currentSpeed) {
        head.x += (dx / dist) * currentSpeed;
        head.y += (dy / dist) * currentSpeed;
    }
    
    // 3. Tail Segment Interpolation (Follow the leader)
    for (let i = 1; i < this.segments.length; i++) {
        let leader = this.segments[i - 1];
        let follower = this.segments[i];
        
        let sdx = leader.x - follower.x;
        let sdy = leader.y - follower.y;
        let sdist = Math.sqrt(sdx * sdx + sdy * sdy);
        
        let targetSpacing = 14; 
        if (sdist > targetSpacing) {
            let pull = (sdist - targetSpacing) * 0.45; // Elastic snap strength
            follower.x += (sdx / sdist) * pull;
            follower.y += (sdy / sdist) * pull;
        }
    }
    
    // 4. Scrap Collection & Magnetism
    for (let i = this.scrap.length - 1; i >= 0; i--) {
        let s = this.scrap[i];
        s.x += s.vx; s.y += s.vy; // Drift
        
        // Bounce off walls
        if(s.x < 0 || s.x > this.canvas.width) s.vx *= -1;
        if(s.y < 0 || s.y > this.canvas.height) s.vy *= -1;
        
        let hdx = head.x - s.x;
        let hdy = head.y - s.y;
        let hdist = Math.sqrt(hdx * hdx + hdy * hdy);
        
        // Magnetic Pull
        if (hdist < magnetRange) {
            s.x += (hdx / hdist) * 6;
            s.y += (hdy / hdist) * 6;
        }
        
        // Devoured
        if (hdist < head.radius + s.radius) {
            let earned = Math.round(s.value * (this.isApexEvent ? 2 : 1));
            this.bonusScrapEarned += earned;
            const hudScrap = document.getElementById('game-hud-scrap');
            if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            
            this.floatingTexts.push({ x: s.x, y: s.y - 10, text: `+${earned}`, color: s.color, alpha: 1 });
            this.triggerExplosion(s.x, s.y, s.color);
            
            // Add a new tail segment every few scrap pieces
            if (Math.random() > 0.5) {
                let last = this.segments[this.segments.length - 1];
                this.segments.push({ x: last.x, y: last.y, radius: 10 });
            }
            
            this.scrap.splice(i, 1);
            this.spawnScrap(false); // Replenish
        }
    }
    
    // 5. Cleanup FX
    for (let i = this.particles.length - 1; i >= 0; i--) {
        let pt = this.particles[i];
        pt.x += pt.vx; pt.y += pt.vy;
        pt.alpha -= 0.03;
        if (pt.alpha <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        let t = this.floatingTexts[i];
        t.y -= 0.8; t.alpha -= 0.02;
        if (t.alpha <= 0) this.floatingTexts.splice(i, 1);
    }
};

ouroborosSweep.triggerExplosion = function(x, y, color) {
    for (let i = 0; i < 5; i++) {
        let a = Math.random() * Math.PI * 2;
        let s = Math.random() * 2 + 1;
        this.particles.push({
            x: x, y: y,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            radius: Math.random() * 2 + 1, alpha: 1, color: color
        });
    }
};

ouroborosSweep.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    let isBoosting = this.mouse.isDown && this.ammoPool > 0;

    // Draw Scrap
    this.scrap.forEach(s => {
        ctx.save();
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 8; ctx.shadowColor = s.color;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
    
    // Draw the Ouroboros Centipede (Tail to Head so head draws on top)
    for (let i = this.segments.length - 1; i >= 0; i--) {
        let seg = this.segments[i];
        ctx.save();
        
        if (i === 0) {
            // Head Styling
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 15; ctx.shadowColor = this.biome.color;
        } else {
            // Tail Styling
            ctx.fillStyle = isBoosting ? '#ffffff' : this.biome.color;
            ctx.globalAlpha = Math.max(0.2, 1 - (i * 0.02)); // Fade out towards end of tail
            ctx.shadowBlur = isBoosting ? 10 : 0;
            ctx.shadowColor = this.biome.color;
        }
        
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, seg.radius, 0, Math.PI * 2);
        ctx.fill();
        
        if (i > 0) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();
    }
    
    // Draw Particles
    this.particles.forEach(pt => {
        ctx.save(); ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
    
    // Draw Floating Texts
    this.floatingTexts.forEach(t => {
        ctx.save(); ctx.globalAlpha = t.alpha;
        ctx.fillStyle = t.color;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    });
};

ouroborosSweep.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    this.ammoPool = Math.ceil(this.ammoPool / 5);
    
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
