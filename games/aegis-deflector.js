/**
 * AEGIS-DEFLECTOR.JS [ A-TIER MODULE ]
 * 360-Degree Perimeter Radial Shield Vector Reflection Grid.
 * Controls: Slide pointer circularly around screen coordinates to tilt the shield arc.
 */

const aegisDeflector = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    shieldAngle: 0,
    shieldArcSize: Math.PI * 0.35,
    attackRays: [],
    drones: []
};

aegisDeflector.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'PLASMA', color: '#7700ff' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.shieldAngle = 0;
    this.attackRays = [];
    this.drones = [];
    this.resizeCanvas();
    
    // Spawn automated flanking fire drones tracking along perimeter bounds
    for (let i = 0; i < 3; i++) {
        this.drones.push({ angle: (Math.PI * 2 / 3) * i, fireCooldown: 40 });
    }
    
    const trackAngle = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const mx = clientX - rect.left;
        const my = clientY - rect.top;
        
        // Pin exact angle target relative to center command hub
        this.shieldAngle = Math.atan2(my - this.canvas.height / 2, mx - this.canvas.width / 2);
    };
    
    this._trackRef = (e) => { e.preventDefault(); trackAngle(e); };
    
    this.canvas.addEventListener('mousemove', this._trackRef);
    this.canvas.addEventListener('touchmove', this._trackRef, { passive: false });
    this.canvas.addEventListener('mousedown', this._trackRef);
    this.canvas.addEventListener('touchstart', this._trackRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

aegisDeflector.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

aegisDeflector.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.frameCount++;
    this.updatePhysics();
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

aegisDeflector.updatePhysics = function() {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const perimeterRadius = Math.min(this.canvas.width, this.canvas.height) * 0.45;
    
    // Animate peripheral interceptor orbits shifting slowly
    this.drones.forEach(d => {
        d.angle += 0.005;
        if (d.fireCooldown > 0) d.fireCooldown--;
        
        if (d.fireCooldown <= 0) {
            // Discharge a high-frequency tracking laser bolt collapsing on the center core
            this.attackRays.push({
                x: cx + Math.cos(d.angle) * perimeterRadius,
                y: cy + Math.sin(d.angle) * perimeterRadius,
                speed: this.isApexEvent ? 5 : 3.5,
                angle: d.angle,
                reflected: false
            });
            d.fireCooldown = Math.random() * 50 + (this.isApexEvent ? 30 : 60);
        }
    });
    
    // Move rays and check shield interceptions
    for (let i = this.attackRays.length - 1; i >= 0; i--) {
        let r = this.attackRays[i];
        
        if (!r.reflected) {
            // Move inward towards center core structure
            r.x -= Math.cos(r.angle) * r.speed;
            r.y -= Math.sin(r.angle) * r.speed;
            
            let dist = Math.hypot(r.x - cx, r.y - cy);
            
            // Shield contact envelope boundary threshold intersection check
            if (dist < 65 && dist > 45) {
                // Confirm if current vector matches shield slice segment coordinates
                let diff = Math.abs(this.shieldAngle - r.angle);
                while (diff > Math.PI) diff -= Math.PI * 2;
                diff = Math.abs(diff);
                
                if (diff < this.shieldArcSize / 2) {
                    r.reflected = true; // Invert movement momentum direction vectors!
                    let points = this.isApexEvent ? 20 : 10;
                    this.bonusScrapEarned += points;
                    const hudScrap = document.getElementById('game-hud-scrap');
                    if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
                }
            }
            
            // Core hull damage tracking on penalty impacts
            if (dist < 20) {
                if (this.ammoPool > 12) this.ammoPool -= 12;
                const hudAmmo = document.getElementById('game-hud-ammo');
                if (hudAmmo) hudAmmo.innerText = this.ammoPool;
                this.attackRays.splice(i, 1);
            }
        } else {
            // Fly out into background space grid cleanly
            r.x += Math.cos(r.angle) * r.speed * 1.5;
            r.y += Math.sin(r.angle) * r.speed * 1.5;
            if (Math.hypot(r.x - cx, r.y - cy) > perimeterRadius + 50) this.attackRays.splice(i, 1);
        }
    }
};

aegisDeflector.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    // Draw Stationary Target Core platform
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 15; ctx.shadowColor = this.biome.color;
    ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    
    // Draw Sliding Arc Deflector Shield Line segment path rings
    ctx.save();
    ctx.strokeStyle = '#00ffaa'; ctx.lineWidth = 5;
    ctx.shadowBlur = 12; ctx.shadowColor = '#00ffaa';
    ctx.beginPath();
    ctx.arc(cx, cy, 55, this.shieldAngle - this.shieldArcSize/2, this.shieldAngle + this.shieldArcSize/2);
    ctx.stroke();
    ctx.restore();
    
    // Draw Attacking Periphery Enforcers
    const pRadius = Math.min(this.canvas.width, this.canvas.height) * 0.45;
    ctx.fillStyle = this.biome.color;
    this.drones.forEach(d => {
        let dx = cx + Math.cos(d.angle) * pRadius;
        let dy = cy + Math.sin(d.angle) * pRadius;
        ctx.fillRect(dx - 5, dy - 5, 10, 10);
    });
    
    // Draw Tracer Laser Beams vectors
    this.attackRays.forEach(r => {
        ctx.save();
        ctx.fillStyle = r.reflected ? '#00ffaa' : '#ff3333';
        ctx.beginPath(); ctx.arc(r.x, r.y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
};

aegisDeflector.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousemove', this._trackRef);
        this.canvas.removeEventListener('touchmove', this._trackRef);
        this.canvas.removeEventListener('mousedown', this._trackRef);
        this.canvas.removeEventListener('touchstart', this._trackRef);
    }
};
