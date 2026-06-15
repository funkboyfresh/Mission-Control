/**
 * TACTICAL-DRAFT.JS [ B-TIER MODULE ]
 * Strategic Fleet Formation Auto-Battler Simulation.
 * Controls: Interactive HUD menu selects drone variants using energy budget.
 */

const tacticalDraft = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    draftMode: true,
    playerDrones: [],
    enemySwarm: [],
    lasers: [],
    particles: []
};

tacticalDraft.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'DUNE', color: '#ffaa00' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.draftMode = true;
    this.playerDrones = [];
    this.enemySwarm = [];
    this.lasers = [];
    this.particles = [];
    
    this.resizeCanvas();
    
    // Dynamic input layout nodes hook
    this._clickRef = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const mx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const my = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        this.handleDraftSelection(mx, my);
    };
    
    this.canvas.addEventListener('mousedown', this._clickRef);
    this.canvas.addEventListener('touchstart', this._clickRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

tacticalDraft.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

tacticalDraft.handleDraftSelection = function(mx, my) {
    if (!this.draftMode) return;
    
    const cy = this.canvas.height / 2;
    const cw = this.canvas.width;
    
    // Option 1: Interceptor Drone (Left Side)
    if (mx > cw * 0.15 && mx < cw * 0.45 && my > cy - 40 && my < cy + 40) {
        if (this.ammoPool >= 20) {
            this.ammoPool -= 20;
            this.playerDrones.push({ x: 80, y: Math.random() * (this.canvas.height - 200) + 100, type: 'ATTACK' });
        }
    }
    
    // Option 2: LOCK IN AND COMMENCE ENGAGEMENT (Right Side Button)
    if (mx > cw * 0.55 && mx < cw * 0.85 && my > cy - 40 && my < cy + 40) {
        this.draftMode = false;
        this.spawnEnemyInterceptors();
    }
    
    const hudAmmo = document.getElementById('game-hud-ammo');
    if (hudAmmo) hudAmmo.innerText = this.ammoPool;
};

tacticalDraft.spawnEnemyInterceptors = function() {
    const count = this.isApexEvent ? 12 : 6;
    for (let i = 0; i < count; i++) {
        this.enemySwarm.push({
            x: this.canvas.width + Math.random() * 200,
            y: Math.random() * (this.canvas.height - 200) + 100,
            hp: 2,
            speed: Math.random() * 1.5 + 1.5
        });
    }
};

tacticalDraft.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

tacticalDraft.updatePhysics = function() {
    if (this.draftMode) return;
    
    // Automation simulation loops
    if (this.frameCount % 25 === 0 && this.playerDrones.length > 0) {
        this.playerDrones.forEach(d => {
            if (this.enemySwarm.length > 0) {
                let target = this.enemySwarm[0];
                this.lasers.push({ x: d.x, y: d.y, tx: target.x, ty: target.y, alpha: 1.0 });
                target.hp--;
            }
        });
    }
    
    // Process combat resolution values
    for (let i = this.enemySwarm.length - 1; i >= 0; i--) {
        let e = this.enemySwarm[i];
        e.x -= e.speed;
        
        if (e.hp <= 0 || e.x < 50) {
            if (e.hp <= 0) {
                let gain = this.isApexEvent ? 30 : 15;
                this.bonusScrapEarned += gain;
                const hudScrap = document.getElementById('game-hud-scrap');
                if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            }
            this.enemySwarm.splice(i, 1);
        }
    }
    
    // Fade laser arrays out of canvas viewport view
    for (let i = this.lasers.length - 1; i >= 0; i--) {
        this.lasers[i].alpha -= 0.1;
        if (this.lasers[i].alpha <= 0) this.lasers.splice(i, 1);
    }
};

tacticalDraft.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const cw = this.canvas.width;
    const cy = this.canvas.height / 2;
    
    if (this.draftMode) {
        // Render Dashboard Interface UI Cards
        ctx.save();
        ctx.strokeStyle = this.biome.color;
        ctx.lineWidth = 2;
        ctx.font = '12px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        
        // Card Left: Build interceptor drone unit
        ctx.strokeRect(cw * 0.15, cy - 40, cw * 0.3, 80);
        ctx.fillText(`DRAFT DRONE (-20 ENERGY)`, cw * 0.3, cy - 5);
        ctx.fillStyle = this.biome.color;
        ctx.fillText(`TOTAL UNITS BUILT: ${this.playerDrones.length}`, cw * 0.3, cy + 20);
        
        // Card Right: Lock sequence activation framework
        ctx.fillStyle = '#ffffff';
        ctx.strokeRect(cw * 0.55, cy - 40, cw * 0.3, 80);
        ctx.fillText("[ INITIALIZE SIMULATION ]", cw * 0.7, cy + 5);
        ctx.restore();
    } else {
        // Draw combat simulation action sequence
        ctx.save();
        ctx.fillStyle = '#ffffff';
        this.playerDrones.forEach(d => {
            ctx.fillRect(d.x - 10, d.y - 10, 20, 20);
        });
        
        ctx.fillStyle = this.biome.color;
        ctx.shadowBlur = 10; ctx.shadowColor = this.biome.color;
        this.enemySwarm.forEach(e => {
            ctx.beginPath(); ctx.arc(e.x, e.y, 10, 0, Math.PI * 2); ctx.fill();
        });
        
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#00ffaa';
        ctx.lineWidth = 2;
        this.lasers.forEach(l => {
            ctx.save(); ctx.globalAlpha = l.alpha;
            ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(l.tx, l.ty); ctx.stroke();
            ctx.restore();
        });
        ctx.restore();
    }
};

tacticalDraft.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._clickRef);
        this.canvas.removeEventListener('touchstart', this._clickRef);
    }
};
