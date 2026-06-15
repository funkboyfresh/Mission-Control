/**
 * VERTICAL-SHMUP.JS [ A-TIER MODULE ]
 * Fast-paced top-down scrolling arcade shooter.
 * Controls: Drag mouse/finger to position ship. Hold or multi-touch to deploy EMP.
 */

const verticalShmup = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    player: { x: 0, y: 0, radius: 12 },
    enemies: [],
    bullets: [],
    particles: [],
    floatingTexts: [],
    mouse: { x: 0, y: 0, isDown: false }
};

verticalShmup.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'FERROUS', color: '#cc5500' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.floatingTexts = [];
    
    this.resizeCanvas();
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height - 80;
    this.mouse.x = this.player.x;
    this.mouse.y = this.player.y;
    
    // Smooth input tracking
    const updateMousePos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        this.mouse.x = clientX - rect.left;
        this.mouse.y = clientY - rect.top;
    };

    this._moveRef = (e) => { updateMousePos(e); };
    this._downRef = (e) => { 
        this.mouse.isDown = true; 
        updateMousePos(e);
        if (this.ammoPool >= 25) {
            this.deployEMPBomb();
        }
    };
    this._upRef = () => { this.mouse.isDown = false; };
    this._resizeRef = () => this.resizeCanvas();
    
    this.canvas.addEventListener('mousemove', this._moveRef);
    this.canvas.addEventListener('touchmove', this._moveRef, { passive: true });
    this.canvas.addEventListener('mousedown', this._downRef);
    this.canvas.addEventListener('touchstart', this._downRef, { passive: false });
    this.canvas.addEventListener('mouseup', this._upRef);
    this.canvas.addEventListener('touchend', this._upRef);
    window.addEventListener('resize', this._resizeRef);
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

verticalShmup.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

verticalShmup.deployEMPBomb = function() {
    this.ammoPool -= 25;
    const hudAmmo = document.getElementById('game-hud-ammo');
    if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    
    this.floatingTexts.push({ x: this.player.x, y: this.player.y - 20, text: "EMP DETONATION!", color: '#ffffff', alpha: 1 });
    
    // Destroy all current visible enemies for bonus loot
    this.enemies.forEach(enemy => {
        this.bonusScrapEarned += 15;
        this.triggerExplosion(enemy.x, enemy.y, this.biome.color);
    });
    this.enemies = [];
    
    const hudScrap = document.getElementById('game-hud-scrap');
    if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
};

verticalShmup.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

verticalShmup.updatePhysics = function() {
    // Kinematic player interpolation following cursor
    this.player.x += (this.mouse.x - this.player.x) * 0.25;
    this.player.y += (this.mouse.y - this.player.y) * 0.25;
    
    // Auto weapon fire rate matrix
    if (this.frameCount % 12 === 0) {
        this.bullets.push({ x: this.player.x, y: this.player.y - 15, vy: -12 });
    }
    
    // Spawn falling enemy grids
    if (this.frameCount % (this.isApexEvent ? 25 : 40) === 0) {
        this.enemies.push({
            x: Math.random() * (this.canvas.width - 60) + 30,
            y: -20,
            vy: Math.random() * 2 + 3,
            hp: this.isApexEvent ? 2 : 1,
            radius: 15
        });
    }
    
    // Update bullets vector
    for (let i = this.bullets.length - 1; i >= 0; i--) {
        let b = this.bullets[i];
        b.y += b.vy;
        if (b.y < -10) this.bullets.splice(i, 1);
    }
    
    // Update enemy arrays & run collision resolution loops
    for (let i = this.enemies.length - 1; i >= 0; i--) {
        let e = this.enemies[i];
        e.y += e.vy;
        
        // Bullet vs Enemy checking
        for (let j = this.bullets.length - 1; j >= 0; j--) {
            let b = this.bullets[j];
            let dist = Math.hypot(b.x - e.x, b.y - e.y);
            if (dist < e.radius + 4) {
                this.bullets.splice(j, 1);
                e.hp--;
                if (e.hp <= 0) {
                    let reward = this.isApexEvent ? 20 : 10;
                    this.bonusScrapEarned += reward;
                    this.floatingTexts.push({ x: e.x, y: e.y, text: `+${reward}`, color: '#00ff88', alpha: 1 });
                    this.triggerExplosion(e.x, e.y, this.biome.color);
                    
                    const hudScrap = document.getElementById('game-hud-scrap');
                    if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
                    
                    this.enemies.splice(i, 1);
                    break;
                }
            }
        }
        
        if (e.y > this.canvas.height + 20) this.enemies.splice(i, 1);
    }
    
    // FX cleanup metrics
    for (let i = this.particles.length - 1; i >= 0; i--) {
        let p = this.particles[i];
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.05;
        if (p.alpha <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        let t = this.floatingTexts[i];
        t.y -= 0.5; t.alpha -= 0.02;
        if (t.alpha <= 0) this.floatingTexts.splice(i, 1);
    }
};

verticalShmup.triggerExplosion = function(x, y, color) {
    for (let i = 0; i < 6; i++) {
        let ang = Math.random() * Math.PI * 2;
        let spd = Math.random() * 3 + 1;
        this.particles.push({
            x: x, y: y,
            vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
            radius: Math.random() * 3 + 1, alpha: 1, color: color
        });
    }
};

verticalShmup.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render Projectiles
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 8; ctx.shadowColor = '#ffffff';
    this.bullets.forEach(b => {
        ctx.fillRect(b.x - 2, b.y - 6, 4, 12);
    });
    
    // Render Invaders
    this.enemies.forEach(e => {
        ctx.save();
        ctx.fillStyle = this.biome.color;
        ctx.shadowBlur = 12; ctx.shadowColor = this.biome.color;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
    
    // Render Particle Engine
    ctx.shadowBlur = 0;
    this.particles.forEach(p => {
        ctx.save(); ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
    
    // Render Pilot Fighter Core
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 15; ctx.shadowColor = '#viewport';
    ctx.beginPath();
    ctx.moveTo(this.player.x, this.player.y - 14);
    ctx.lineTo(this.player.x - 12, this.player.y + 10);
    ctx.lineTo(this.player.x + 12, this.player.y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Render Floating Damage values
    this.floatingTexts.forEach(t => {
        ctx.save(); ctx.globalAlpha = t.alpha;
        ctx.fillStyle = t.color;
        ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    });
};

verticalShmup.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousemove', this._moveRef);
        this.canvas.removeEventListener('touchmove', this._moveRef);
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
        this.canvas.removeEventListener('mouseup', this._upRef);
        this.canvas.removeEventListener('touchend', this._upRef);
    }
    window.removeEventListener('resize', this._resizeRef);
};
