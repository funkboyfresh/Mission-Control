/**
 * RAILGUN-ASSASSIN.JS [ B-TIER MODULE ]
 * Localized Bullet-Time Target-Acquisition Grid.
 * Controls: Tap anywhere to discharge railgun slug when objects intersect target crosshairs.
 */

const railgunAssassin = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    crosshairY: 0,
    targets: [],
    flashAlpha: 0
};

railgunAssassin.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'VOID', color: '#a200ff' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.flashAlpha = 0;
    
    this.resizeCanvas();
    this.crosshairY = this.canvas.height / 2;
    this.targets = [];
    
    this._fireRef = (e) => {
        e.preventDefault();
        this.dischargeAssassinSlug();
    };
    
    this.canvas.addEventListener('mousedown', this._fireRef);
    this.canvas.addEventListener('touchstart', this._fireRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

railgunAssassin.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

railgunAssassin.dischargeAssassinSlug = function() {
    if (this.ammoPool < 10) return;
    
    this.ammoPool -= 10;
    const hudAmmo = document.getElementById('game-hud-ammo');
    if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    
    this.flashAlpha = 1.0; // Trigger blinding trace beam flash FX
    
    // Evaluate if any high-value target shapes hit crosshair horizontal lane coordinates
    let hitFound = false;
    for (let i = this.targets.length - 1; i >= 0; i--) {
        let t = this.targets[i];
        let diff = Math.abs(t.y - this.crosshairY);
        
        if (diff < 30) {
            hitFound = true;
            let gain = this.isApexEvent ? 50 : 25;
            this.bonusScrapEarned += gain;
            this.targets.splice(i, 1);
        }
    }
    
    const hudScrap = document.getElementById('game-hud-scrap');
    if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
};

railgunAssassin.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

railgunAssassin.updatePhysics = function() {
    // Generate sweeping runner vectors sliding past horizontally in slow-mo
    if (Math.random() < 0.03) {
        this.targets.push({
            x: -40,
            y: Math.random() * (this.canvas.height - 200) + 100,
            speed: this.isApexEvent ? 7 : 4
        });
    }
    
    for (let i = this.targets.length - 1; i >= 0; i--) {
        this.targets[i].x += this.targets[i].speed;
        if (this.targets[i].x > this.canvas.width + 40) this.targets.splice(i, 1);
    }
    
    if (this.flashAlpha > 0) this.flashAlpha -= 0.1;
};

railgunAssassin.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Stationary Horizontal Trajectory Trapping Crosshairs Axis
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, this.crosshairY); ctx.lineTo(this.canvas.width, this.crosshairY); ctx.stroke();
    
    ctx.save();
    ctx.strokeStyle = this.biome.color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10; ctx.shadowColor = this.biome.color;
    ctx.beginPath(); ctx.arc(this.canvas.width / 2, this.crosshairY, 25, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    
    // Draw Sliding Target Core Anomalies
    ctx.fillStyle = '#ffffff';
    this.targets.forEach(t => {
        ctx.fillRect(t.x - 15, t.y - 15, 30, 30);
    });
    
    // Draw Blinding Beam Flash FX discharge trace lane lines
    if (this.flashAlpha > 0) {
        ctx.save(); ctx.globalAlpha = this.flashAlpha;
        ctx.fillStyle = '#00ffbb';
        ctx.fillRect(0, this.crosshairY - 4, this.canvas.width, 8);
        ctx.restore();
    }
};

railgunAssassin.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._fireRef);
        this.canvas.removeEventListener('touchstart', this._fireRef);
    }
};
