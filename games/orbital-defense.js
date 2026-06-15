/**
 * ORBITAL-DEFENSE.JS [ C-TIER ADAPTATION ]
 * Concentric Ring Satellite Tower Defense Simulator.
 * Controls: Tap anywhere around the central core planet to deploy auto-firing turrets.
 */

const orbitalDefense = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    defenseRingRadius: 70,
    turrets: [],
    threats: [],
    projectiles: [],
    particles: []
};

orbitalDefense.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'CRYSTAL', color: '#ff66cc' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.turrets = [];
    this.threats = [];
    this.projectiles = [];
    this.particles = [];
    
    this.resizeCanvas();
    
    // Track click placement vector coordinates
    this._clickRef = (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const mx = clientX - rect.left;
        const my = clientY - rect.top;
        this.deploySatelliteTurret(mx, my);
    };
    
    this.canvas.addEventListener('mousedown', this._clickRef);
    this.canvas.addEventListener('touchstart', this._clickRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

orbitalDefense.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

orbitalDefense.deploySatelliteTurret = function(mx, my) {
    if (this.ammoPool < 20) return;
    
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Extract exact angle signature relative to center core platform
    const angle = Math.atan2(my - cy, mx - cx);
    
    this.ammoPool -= 20;
    const hudAmmo = document.getElementById('game-hud-ammo');
    if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    
    // Snap turret onto the functional defense ring path line
    this.turrets.push({
        angle: angle,
        fireCooldown: 0
    });
};

orbitalDefense.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

orbitalDefense.updatePhysics = function() {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Spawn threat vectors converging inward from viewport bounds
    if (this.frameCount % (this.isApexEvent ? 25 : 45) === 0) {
        const ang = Math.random() * Math.PI * 2;
        const startDist = Math.max(this.canvas.width, this.canvas.height) * 0.6;
        this.threats.push({
            x: cx + Math.cos(ang) * startDist,
            y: cy + Math.sin(ang) * startDist,
            speed: this.isApexEvent ? 2.5 : 1.5,
            hp: 1
        });
    }
    
    // Handle automated satellite weapons firing metrics
    this.turrets.forEach(t => {
        if (t.fireCooldown > 0) t.fireCooldown--;
        
        if (t.fireCooldown === 0 && this.threats.length > 0) {
            // Target closest threat node in corridor tracking lanes
            let closestThreat = this.threats[0];
            let tx = cx + Math.cos(t.angle) * this.defenseRingRadius;
            let ty = cy + Math.sin(t.angle) * this.defenseRingRadius;
            
            // Fire projectile heading directly along the intercept trajectory line
            const fAng = Math.atan2(closestThreat.y - ty, closestThreat.x - tx);
            this.projectiles.push({
                x: tx, y: ty,
                vx: Math.cos(fAng) * 7, vy: Math.sin(fAng) * 7
            });
            t.fireCooldown = 30; // Reset reload pacing timer
        }
    });
    
    // Move projectiles outwards
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
        let p = this.projectiles[i];
        p.x += p.vx; p.y += p.vy;
        
        // Collsion check loops targeting active fragments
        for (let j = this.threats.length - 1; j >= 0; j--) {
            let th = this.threats[j];
            if (Math.hypot(p.x - th.x, p.y - th.y) < 15) {
                this.projectiles.splice(i, 1);
                th.hp--;
                if (th.hp <= 0) {
                    let prize = this.isApexEvent ? 25 : 15;
                    this.bonusScrapEarned += prize;
                    const hudScrap = document.getElementById('game-hud-scrap');
                    if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
                    this.threats.splice(j, 1);
                }
                break;
            }
        }
    }
    
    // Pull threat obstacles inward toward center core anchor line bounds
    for (let i = this.threats.length - 1; i >= 0; i--) {
        let th = this.threats[i];
        let ang = Math.atan2(cy - th.y, cx - th.x);
        th.x += Math.cos(ang) * th.speed;
        th.y += Math.sin(ang) * th.speed;
        
        // Base shield tracking depletion on impact
        if (Math.hypot(cx - th.x, cy - th.y) < 30) {
            if (this.ammoPool > 10) {
                this.ammoPool -= 10;
                const hudAmmo = document.getElementById('game-hud-ammo');
                if (hudAmmo) hudAmmo.innerText = this.ammoPool;
            }
            this.threats.splice(i, 1);
        }
    }
};

orbitalDefense.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Draw Safe-Zone Defense Perimeter Ring lines
    ctx.save();
    ctx.strokeStyle = this.biome.color;
    ctx.lineWidth = 1; ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.arc(cx, cy, this.defenseRingRadius, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    
    // Draw Stationary Center Command Core
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 15; ctx.shadowColor = this.biome.color;
    ctx.beginPath(); ctx.arc(cx, cy, 25, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    
    // Draw Orbiting Defense Turrets
    ctx.fillStyle = this.biome.color;
    this.turrets.forEach(t => {
        let tx = cx + Math.cos(t.angle) * this.defenseRingRadius;
        let ty = cy + Math.sin(t.angle) * this.defenseRingRadius;
        ctx.fillRect(tx - 6, ty - 6, 12, 12);
    });
    
    // Draw Projectiles
    ctx.fillStyle = '#00ffaa';
    this.projectiles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
    });
    
    // Draw Inward Advancing Threats
    ctx.fillStyle = '#ff3333';
    this.threats.forEach(th => {
        ctx.fillRect(th.x - 5, th.y - 5, 10, 10);
    });
};

orbitalDefense.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._clickRef);
        this.canvas.removeEventListener('touchstart', this._clickRef);
    }
};
