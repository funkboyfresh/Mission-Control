/**
 * VOID-SWARM.JS
 * Pure Canvas Vector Physics Loop Simulation Module with 15% Swarm Dampening applied.
 */

const voidSwarm = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    
    // Runtime Game States
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    // Hybrid DOM Overlay Trackers
    playerElement: null,
    viewportElement: null,
    
    // Entity Matrix Pools
    player: { x: 0, y: 0, radius: 30, speed: 9, angle: 0 },
    projectiles: [],
    enemies: [],
    particles: [],
    collectibles: [], 
    floatingTexts: [], 
    
    // Kinetic Feedback & Economy Buffers
    screenShakeIntensity: 0,
    ammoSuperchargeMultiplier: 5, 
    mouse: { x: 0, y: 0 }
};

voidSwarm.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome;
    this.isApexEvent = isApex;
    
    this.ammoPool = (ammo || 100) * this.ammoSuperchargeMultiplier;
    this.bonusScrapEarned = 0;
    this.screenShakeIntensity = 0;
    
    this.projectiles = [];
    this.enemies = [];
    this.particles = [];
    this.collectibles = [];
    this.floatingTexts = [];
    
    this.resizeCanvas();
    
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height / 2;
    this.mouse.x = this.canvas.width / 2;
    this.mouse.y = this.canvas.height / 2;
    
    const hudAmmo = document.getElementById('game-hud-ammo');
    if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    
    this.viewportElement = document.getElementById('minigame-viewport');
    if (this.viewportElement) {
        this.playerElement = document.createElement('div');
        this.playerElement.id = 'minigame-player-ship';
        this.playerElement.style.cssText = `
            position: absolute; width: 80px; height: 80px;
            left: 0; top: 0; z-index: 10002; pointer-events: none;
            filter: drop-shadow(0 0 15px ${this.biome.color});
            transform-origin: center center; will-change: transform;
        `;
        
        if (typeof drawModularShip === 'function' && typeof state !== 'undefined' && state.shipParts) {
            drawModularShip(this.playerElement, state.shipParts);
        } else {
            this.playerElement.innerHTML = `<div style="width:100%; height:100%; background:${this.biome.color}; clip-path:polygon(100% 50%, 0 0, 20% 50%, 0 100%);"></div>`;
        }
        this.viewportElement.appendChild(this.playerElement);
    }
    
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
    this._resizeRef = () => this.resizeCanvas();
    
    this.canvas.addEventListener('mousemove', this._moveRef);
    this.canvas.addEventListener('touchmove', this._touchRef);
    window.addEventListener('resize', this._resizeRef);
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

voidSwarm.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

voidSwarm.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    
    this.updatePhysics();
    this.drawScene();
    
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

voidSwarm.updatePhysics = function() {
    let dx = this.mouse.x - this.player.x;
    let dy = this.mouse.y - this.player.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 4) {
        this.player.x += (dx / dist) * this.player.speed;
        this.player.y += (dy / dist) * this.player.speed;
        this.player.angle = Math.atan2(dy, dx);
    }
    
    if (this.playerElement) {
        const offsetX = this.player.x - 40; 
        const offsetY = this.player.y - 40; 
        const radToDeg = this.player.angle * (180 / Math.PI);
        this.playerElement.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${radToDeg}deg)`;
    }
    
    let closestEnemy = null;
    let minDist = Infinity;
    
    for (let e of this.enemies) {
        let edx = e.x - this.player.x;
        let edy = e.y - this.player.y;
        let d = Math.sqrt(edx * edx + edy * edy);
        if (d < minDist) {
            minDist = d;
            closestEnemy = e;
        }
    }
    
    let fireAngle = this.player.angle;
    if (closestEnemy) {
        fireAngle = Math.atan2(closestEnemy.y - this.player.y, closestEnemy.x - this.player.x);
    }
    
    if (this.ammoPool > 0 && Math.random() < 0.35) {
        this.ammoPool--;
        const hudAmmo = document.getElementById('game-hud-ammo');
        if (hudAmmo) hudAmmo.innerText = this.ammoPool;
        
        const sideOffset = Math.random() > 0.5 ? 14 : -14;
        const bx = this.player.x + Math.cos(fireAngle + Math.PI/2) * sideOffset;
        const by = this.player.y + Math.sin(fireAngle + Math.PI/2) * sideOffset;

        this.projectiles.push({
            x: bx, y: by,
            vx: Math.cos(fireAngle) * 16, 
            vy: Math.sin(fireAngle) * 16,
            radius: 3.5
        });
    }
    
    let spawnRate = this.isApexEvent ? 0.12 : 0.07; 
    if (this.enemies.length < 60 && Math.random() < spawnRate) {
        let edge = Math.floor(Math.random() * 4);
        let sx, sy;
        
        if (edge === 0) { sx = Math.random() * this.canvas.width; sy = -30; }
        else if (edge === 1) { sx = this.canvas.width + 30; sy = Math.random() * this.canvas.height; }
        else if (edge === 2) { sx = Math.random() * this.canvas.width; sy = this.canvas.height + 30; }
        else { sx = -30; sy = Math.random() * this.canvas.height; }
        
        let shape = 'CIRCLE';
        if (this.biome.id === 'CRYSTAL' || this.biome.id === 'FERROUS') shape = 'TRIANGLE';
        if (this.biome.id === 'CYBER' || this.biome.id === 'PLASMA') shape = 'SQUARE';

        const isElite = Math.random() < (this.isApexEvent ? 0.40 : 0.15);
        
        // --- [ DIRECTIVE 1: SWARM MOVEMENT DAMPENED BY 15% ] ---
        // Base movement components multiplied by 0.85
        let enemySpeed = isElite ? 1.5 : (Math.random() * 2 + (this.isApexEvent ? 2.5 : 1.5));
        let dampenedSpeed = enemySpeed * 0.85;

        this.enemies.push({
            x: sx, y: sy, shape: shape,
            isElite: isElite,
            radius: isElite ? 24 : 12,
            speed: dampenedSpeed,
            hp: isElite ? 4 : 1
        });
    }
    
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
        let p = this.projectiles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > this.canvas.width || p.y < 0 || p.y > this.canvas.height) {
            this.projectiles.splice(i, 1);
        }
    }
    
    for (let i = this.enemies.length - 1; i >= 0; i--) {
        let e = this.enemies[i];
        let edx = this.player.x - e.x;
        let edy = this.player.y - e.y;
        let edist = Math.sqrt(edx * edx + edy * edy);
        
        e.x += (edx / edist) * e.speed;
        e.y += (edy / edist) * e.speed;
        
        for (let j = this.projectiles.length - 1; j >= 0; j--) {
            let p = this.projectiles[j];
            let pdx = p.x - e.x;
            let pdy = p.y - e.y;
            let pdist = Math.sqrt(pdx * pdx + pdy * pdy);
            
            if (pdist < e.radius + p.radius) {
                this.projectiles.splice(j, 1);
                e.hp--;
                
                this.particles.push({
                    x: p.x, y: p.y,
                    vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
                    radius: 2, alpha: 1, color: '#ffffff'
                });
                
                if (e.hp <= 0) {
                    this.detonateExplosion(e.x, e.y, e.isElite ? 22 : 12);
                    this.screenShakeIntensity = Math.min(15, this.screenShakeIntensity + (e.isElite ? 8 : 4));
                    
                    const fragmentSpawns = e.isElite ? 5 : 1;
                    for(let f = 0; f < fragmentSpawns; f++) {
                        this.collectibles.push({
                            x: e.x + (Math.random() - 0.5) * 15,
                            y: e.y + (Math.random() - 0.5) * 15,
                            vx: (Math.random() - 0.5) * 5,
                            vy: (Math.random() - 0.5) * 5,
                            value: Math.round((Math.random() * 4 + 3) * (this.isApexEvent ? 3.0 : 1.0))
                        });
                    }
                    
                    this.enemies.splice(i, 1);
                    break;
                }
            }
        }
    }
    
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
        let c = this.collectibles[i];
        
        c.x += c.vx; c.y += c.vy;
        c.vx *= 0.95; c.vy *= 0.95;
        
        let cdx = this.player.x - c.x;
        let cdy = this.player.y - c.y;
        let cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        
        if (cdist < 240) {
            let pullForce = (240 - cdist) / 12; 
            c.x += (cdx / cdist) * pullForce;
            c.y += (cdy / cdist) * pullForce;
        }
        
        if (cdist < this.player.radius + 8) {
            this.bonusScrapEarned += c.value;
            
            this.floatingTexts.push({
                x: c.x, y: c.y - 10,
                text: `+${c.value}`,
                alpha: 1,
                color: 'var(--captured)'
            });
            
            const hudScrap = document.getElementById('game-hud-scrap');
            if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            
            this.collectibles.splice(i, 1);
        }
    }
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
        let pt = this.particles[i];
        pt.x += pt.vx; pt.y += pt.vy;
        pt.alpha -= 0.025;
        if (pt.alpha <= 0) this.particles.splice(i, 1);
    }
    
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        let t = this.floatingTexts[i];
        t.y -= 0.8; 
        t.alpha -= 0.02;
        if (t.alpha <= 0) this.floatingTexts.splice(i, 1);
    }
    
    if (this.screenShakeIntensity > 0) {
        this.screenShakeIntensity *= 0.9;
        if (this.screenShakeIntensity < 0.2) this.screenShakeIntensity = 0;
    }
};

voidSwarm.detonateExplosion = function(x, y, count) {
    for (let i = 0; i < count; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * 5 + 2;
        this.particles.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 3 + 1,
            alpha: 1,
            color: this.biome.color
        });
    }
};

voidSwarm.drawScene = function() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    
    ctx.save();
    
    if (this.screenShakeIntensity > 0) {
        let shakeX = (Math.random() - 0.5) * this.screenShakeIntensity;
        let shakeY = (Math.random() - 0.5) * this.screenShakeIntensity;
        ctx.translate(shakeX, shakeY);
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    this.particles.forEach(pt => {
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.shadowBlur = pt.color === '#ffffff' ? 0 : 8;
        ctx.shadowColor = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
    
    this.collectibles.forEach(c => {
        ctx.save();
        ctx.fillStyle = 'var(--captured)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'var(--captured)';
        ctx.beginPath();
        ctx.moveTo(c.x, c.y - 5);
        ctx.lineTo(c.x + 4, c.y);
        ctx.lineTo(c.x, c.y + 5);
        ctx.lineTo(c.x - 4, c.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    });
    
    this.projectiles.forEach(p => {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.biome.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
    
    this.enemies.forEach(e => {
        ctx.save();
        ctx.strokeStyle = this.biome.color;
        ctx.lineWidth = e.isElite ? 3 : 2;
        ctx.fillStyle = e.isElite ? `${this.biome.color}35` : `${this.biome.color}15`;
        ctx.shadowBlur = e.isElite ? 18 : 10;
        ctx.shadowColor = this.biome.color;
        ctx.beginPath();
        
        if (e.shape === 'SQUARE') {
            ctx.rect(e.x - e.radius, e.y - e.radius, e.radius * 2, e.radius * 2);
        } else if (e.shape === 'TRIANGLE') {
            ctx.moveTo(e.x, e.y - e.radius);
            ctx.lineTo(e.x + e.radius, e.y + e.radius);
            ctx.lineTo(e.x - e.radius, e.y + e.radius);
            ctx.closePath();
        } else {
            ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        }
        
        ctx.fill();
        ctx.stroke();
        
        if (e.isElite) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius * 0.4, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    });
    
    this.floatingTexts.forEach(t => {
        ctx.save();
        ctx.globalAlpha = t.alpha;
        ctx.fillStyle = t.color;
        ctx.font = 'bold 11px monospace';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#000000';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    });
    
    ctx.restore(); 
};

voidSwarm.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    
    this.ammoPool = Math.ceil(this.ammoPool / this.ammoSuperchargeMultiplier);
    
    if (this.playerElement) {
        this.playerElement.remove();
        this.playerElement = null;
    }
    
    if (this.canvas) {
        this.canvas.removeEventListener('mousemove', this._moveRef);
        this.canvas.removeEventListener('touchmove', this._touchRef);
    }
    window.removeEventListener('resize', this._resizeRef);
};
