/**
 * VOID-BLADE.JS [ A-TIER MODULE ]
 * Gestural High-Frequency Plasma Slicer Cutter Matrix.
 * Controls: Drag cursor/finger rapidly across viewport shapes to slash structures.
 */

const voidBlade = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    crates: [],
    swipeTrail: [],
    isSwiping: false
};

voidBlade.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'CYBER', color: '#00ff88' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.crates = [];
    this.swipeTrail = [];
    this.isSwiping = false;
    this.resizeCanvas();
    
    const trackSwipe = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const mx = clientX - rect.left;
        const my = clientY - rect.top;
        
        this.swipeTrail.push({ x: mx, y: my, age: 10 });
        this.evaluateSliceIntersections(mx, my);
    };
    
    this._downRef = (e) => { e.preventDefault(); this.isSwiping = true; trackSwipe(e); };
    this._moveRef = (e) => { if (this.isSwiping) trackSwipe(e); };
    this._upRef = () => { this.isSwiping = false; };
    
    this.canvas.addEventListener('mousedown', this._downRef);
    this.canvas.addEventListener('touchstart', this._downRef, { passive: false });
    this.canvas.addEventListener('mousemove', this._moveRef);
    this.canvas.addEventListener('touchmove', this._moveRef, { passive: true });
    window.addEventListener('mouseup', this._upRef);
    window.addEventListener('touchend', this._upRef);
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

voidBlade.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

voidBlade.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

voidBlade.updatePhysics = function() {
    // Launch space scrap containers upwards into floating view arcs
    if (this.frameCount % (this.isApexEvent ? 20 : 35) === 0) {
        this.crates.push({
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: this.canvas.height + 20,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 5 - 9, // Upward vertical propulsion vector
            radius: 20,
            isExplosive: Math.random() < 0.2
        });
    }
    
    // Resolve kinematics speeds matrices
    this.crates.forEach(c => {
        c.x += c.vx; c.y += c.vy;
        c.vy += 0.2; // Minor gravity descent vector pull
    });
    
    // Filter dead object frames
    for (let i = this.crates.length - 1; i >= 0; i--) {
        if (this.crates[i].y > this.canvas.height + 40) this.crates.splice(i, 1);
    }
    
    // Decay sweep line particle frames
    for (let i = this.swipeTrail.length - 1; i >= 0; i--) {
        this.swipeTrail[i].age--;
        if (this.swipeTrail[i].age <= 0) this.swipeTrail.splice(i, 1);
    }
};

voidBlade.evaluateSliceIntersections = function(mx, my) {
    if (this.swipeTrail.length < 2) return;
    
    // Proximity target bounding sphere crossing validation checks
    for (let i = this.crates.length - 1; i >= 0; i--) {
        let c = this.crates[i];
        let dist = Math.hypot(mx - c.x, my - c.y);
        
        if (dist < c.radius + 8) {
            if (c.isExplosive) {
                // Volatile barrels break ammo reserves
                if (this.ammoPool > 15) this.ammoPool -= 15;
                const hudAmmo = document.getElementById('game-hud-ammo');
                if (hudAmmo) hudAmmo.innerText = this.ammoPool;
            } else {
                // Clean crate harvest payload payout reward points
                let points = this.isApexEvent ? 30 : 15;
                this.bonusScrapEarned += points;
                const hudScrap = document.getElementById('game-hud-scrap');
                if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            }
            this.crates.splice(i, 1);
        }
    }
};

voidBlade.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Slicing Path Line
    if (this.swipeTrail.length > 1) {
        ctx.save();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4;
        ctx.shadowBlur = 15; ctx.shadowColor = this.biome.color;
        ctx.beginPath();
        ctx.moveTo(this.swipeTrail[0].x, this.swipeTrail[0].y);
        for (let i = 1; i < this.swipeTrail.length; i++) {
            ctx.lineTo(this.swipeTrail[i].x, this.swipeTrail[i].y);
        }
        ctx.stroke();
        ctx.restore();
    }
    
    // Draw Flying Cargo Cubes
    this.crates.forEach(c => {
        ctx.save();
        ctx.fillStyle = c.isExplosive ? '#ff3333' : this.biome.color;
        ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(c.x - c.radius, c.y - c.radius, c.radius * 2, c.radius * 2);
        ctx.restore();
    });
};

voidBlade.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._downRef);
        this.canvas.removeEventListener('touchstart', this._downRef);
        this.canvas.removeEventListener('mousemove', this._moveRef);
        this.canvas.removeEventListener('touchmove', this._moveRef);
    }
    window.removeEventListener('mouseup', this._upRef);
    window.removeEventListener('touchend', this._upRef);
};
