/**
 * DREADNOUGHT-ARTILLERY.JS [ C-TIER ADAPTATION ]
 * Drag-and-Aim Ballistic Trajectory Gravitational Mortar Shell.
 * Controls: Drag mouse/touch back anywhere on screen to calculate slingshot flight arc paths.
 */

const dreadnoughtArtillery = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    playerPos: { x: 80, y: 0 },
    enemyPos: { x: 0, y: 0, radius: 45 },
    shell: null,
    
    dragStart: null,
    dragCurrent: null,
    isDragging: false
};

dreadnoughtArtillery.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'TOXIC', color: '#ccff00' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    
    this.shell = null;
    this.isDragging = false;
    this.dragStart = null;
    this.dragCurrent = null;
    
    this.resizeCanvas();
    this.playerPos.y = this.canvas.height - 100;
    this.enemyPos.x = this.canvas.width - 120;
    this.enemyPos.y = this.canvas.height - 140;
    
    const getPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };
    
    // Slingshot gesture tracking nodes hook setups
    this._downRef = (e) => {
        e.preventDefault();
        this.isDragging = true;
        this.dragStart = getPos(e);
        this.dragCurrent = this.dragStart;
    };
    this._moveRef = (e) => {
        if (!this.isDragging) return;
        this.dragCurrent = getPos(e);
    };
    this._upRef = () => {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.fireMortarShell();
    };
    
    this.canvas.addEventListener('mousedown', this._downRef);
    this.canvas.addEventListener('touchstart', this._downRef, { passive: false });
    this.canvas.addEventListener('mousemove', this._moveRef);
    this.canvas.addEventListener('touchmove', this._moveRef, { passive: true });
    this.canvas.addEventListener('mouseup', this._upRef);
    this.canvas.addEventListener('touchend', this._upRef);
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

dreadnoughtArtillery.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

dreadnoughtArtillery.fireMortarShell = function() {
    if (this.shell || this.ammoPool < 15) return;
    
    this.ammoPool -= 15;
    const hudAmmo = document.getElementById('game-hud-ammo');
    if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    
    // Inverted drag displacement vectors provide slingshot momentum math
    const dx = this.dragStart.x - this.dragCurrent.x;
    const dy = this.dragStart.y - this.dragCurrent.y;
    
    this.shell = {
        x: this.playerPos.x,
        y: this.playerPos.y - 15,
        vx: dx * 0.12,
        vy: dy * 0.12
    };
};

dreadnoughtArtillery.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

dreadnoughtArtillery.updatePhysics = function() {
    if (!this.shell) return;
    
    // Apply downward physics vector gravity acceleration path curves
    this.shell.vx *= 0.99;
    this.shell.vy += 0.28; // Gravity step constant
    
    this.shell.x += this.shell.vx;
    this.shell.y += this.shell.vy;
    
    // Evaluate crosshair circle collision radius boundaries
    let dist = Math.hypot(this.shell.x - this.enemyPos.x, this.shell.y - this.enemyPos.y);
    if (dist < this.enemyPos.radius) {
        let payload = this.isApexEvent ? 60 : 35;
        this.bonusScrapEarned += payload;
        const hudScrap = document.getElementById('game-hud-scrap');
        if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
        
        this.shell = null; // Consume projectile on direct impact
        return;
    }
    
    // Ground or boundary check erase safety checks
    if (this.shell.y > this.canvas.height || this.shell.x > this.canvas.width || this.shell.x < -20) {
        this.shell = null;
    }
};

dreadnoughtArtillery.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Ground Layout lines
    ctx.strokeStyle = '#222222'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, this.canvas.height - 80); ctx.lineTo(this.canvas.width, this.canvas.height - 80); ctx.stroke();
    
    // Draw Player Ship Base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.playerPos.x - 20, this.playerPos.y - 10, 40, 20);
    
    // Draw Enemy Capital Battleship Target Hull
    ctx.save();
    ctx.fillStyle = this.biome.color;
    ctx.shadowBlur = 20; ctx.shadowColor = this.biome.color;
    ctx.beginPath(); ctx.arc(this.enemyPos.x, this.enemyPos.y, this.enemyPos.radius, Math.PI, 0); ctx.fill();
    ctx.restore();
    
    // Draw Trajectory Aiming Line Guideline
    if (this.isDragging && !this.shell) {
        ctx.save();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        
        ctx.beginPath();
        ctx.moveTo(this.playerPos.x, this.playerPos.y - 15);
        
        let tx = this.playerPos.x; let ty = this.playerPos.y - 15;
        let tvx = (this.dragStart.x - this.dragCurrent.x) * 0.12;
        let tvy = (this.dragStart.y - this.dragCurrent.y) * 0.12;
        
        // Render 30 frames of hypothetical parabolic motion arc prediction
        for (let i = 0; i < 30; i++) {
            tvy += 0.28; tx += tvx; ty += tvy;
            ctx.lineTo(tx, ty);
        }
        ctx.stroke();
        ctx.restore();
    }
    
    // Draw Launched Mortar Shell
    if (this.shell) {
        ctx.save();
        ctx.fillStyle = '#00ffbb';
        ctx.shadowBlur = 10; ctx.shadowColor = '#00ffbb';
        ctx.beginPath(); ctx.arc(this.shell.x, this.shell.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
};

dreadnoughtArtillery.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
        this.canvas.removeEventListener('mousemove', this._moveRef);
        this.canvas.removeEventListener('touchmove', this._moveRef);
        this.canvas.removeEventListener('mouseup', this._upRef);
        this.canvas.removeEventListener('touchend', this._upRef);
    }
};
