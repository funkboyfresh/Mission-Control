/**
 * ==================================================================================
 * COSMIC-RICOCHET.JS [ ARCHITECTURE BLUEPRINT & GAME ENGINE MATRIX ]
 * ==================================================================================
 * * 🌌 THEMATIC CONCEPT:
 * "Cosmic Ricochet" is a hyper-velocity kinetic space pinball sandbox that serves
 * as the 60-minute/90-minute action climax for the "Kinematic Bumper Recharge" 
 * campaign. The game represents a descent into a dense planetary magnetic core fields.
 *
 * 🛰️ S-TIER MECHANICAL CONTINUITY (THE MARRYING LOOPS):
 * This engine acts as a 1:1 mechanical evolution of its 30-minute preparation prequel, 
 * "orbitalDefense.js". 
 * 1. During the focus prep phase, the pilot manually deploys tactical defense 
 * satellites into a geometric coordinate grid.
 * 2. When this combat break engine triggers, those exact coordinate positions are 
 * passed straight into the bumpers array, transforming your focus footprint into
 * the active layout of the pinball table.
 * 3. The pilot's modular ship cockpit capsule is dropped onto the canvas as the ball.
 *
 * 🛠️ EXPANDED HANGAR REFIT ADAPTATIONS (VISUAL & STAT MARRIAGE):
 * To guarantee that permanent upgrades dynamically modify both ship aesthetics and
 * physical breakout power, this engine hooks directly into `state.shipParts`:
 * * - NOSE RE-FIT [heavy_wedge]: Wraps the capsule in dense red-bordered hex plate vector 
 * graphics on canvas. Increases physical mass to 1.55 and boosts the restitution 
 * bounce coefficient from 12.0 to 15.5 to aggressively slice through debris.
 * * - WINGS RE-FIT [magnetic_fins]: Replaces standard bottom steel flippers with sweeping 
 * neon-blue tractor fin vectors. Extends flipper length scale by +30% to maximize 
 * deflection safety nets.
 * * - ENGINE RE-FIT [ion_node]: Alters rear plume particles to sharp green bursts. Every 
 * satellite bounce triggers an active 360° vacuum ripple wave that draws loose 
 * drifting cargo scrap items from afar directly into collection hitboxes.
 *
 * 🎮 CONTROLS OVERVIEW:
 * - Left Arrow / Key A / Tap Lower-Left Screen: Actuate Left Flipper
 * - Right Arrow / Key D / Tap Lower-Right Screen: Actuate Right Flipper
 * - Spacebar / Tap Upper Screen: Fire Plasmatic Shockwave Thruster (Costs 5 Energy)
 * ==================================================================================
 */

const cosmicRicochet = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    // Core Ship Kinetic State Vector Properties
    player: { x: 0, y: 0, vx: 0, vy: 0, radius: 16, angle: 0, mass: 1.0 },
    
    // Interactive Entities Matrices
    bumpers: [],
    particles: [],
    cargoScrap: [], 
    
    // Dual Mechanical Flippers Configuration
    flippers: {
        left: { anchorX: 0, anchorY: 0, len: 0, angle: 0, targetAngle: 0, isFlapping: false },
        right: { anchorX: 0, anchorY: 0, len: 0, angle: 0, targetAngle: 0, isFlapping: false }
    },
    
    // Unified Hangar Part Classifiers Cache
    equippedNose: "standard",
    equippedWings: "standard",
    equippedEngine: "standard"
};

cosmicRicochet.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'FERROUS', color: '#cc5500' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.frameCount = 0;
    
    this.bumpers = [];
    this.particles = [];
    this.cargoScrap = [];
    
    this.resizeCanvas();
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // --- [ INJECT ACTIVE PROGRESSION HANGAR HOOKS ] ---
    if (typeof state !== 'undefined' && state.shipParts) {
        this.equippedNose = state.shipParts.nose || "standard";
        this.equippedWings = state.shipParts.wings || "standard";
        this.equippedEngine = state.shipParts.engine || "standard";
    } else {
        // Safe local default fallback parameters for direct testing windows
        this.equippedNose = "heavy_wedge"; 
        this.equippedWings = "magnetic_fins";
        this.equippedEngine = "ion_node";
    }
    
    // Scale ball dimensions and inertial mass curves relative to nose cone upgrades
    this.player.radius = this.equippedNose === "heavy_wedge" ? 19 : 15;
    this.player.mass = this.equippedNose === "heavy_wedge" ? 1.55 : 1.0;
    
    this.player.x = w / 2;
    this.player.y = h * 0.25;
    this.player.vx = 5;
    this.player.vy = -3;
    
    // --- [ COMPUTE GEOMETRIC SCALE FOR VECTOR FLIPPERS ] ---
    const flipperLengthBase = w * 0.14;
    const actualFlipperLength = this.equippedWings === "magnetic_fins" ? flipperLengthBase * 1.30 : flipperLengthBase;
    
    this.flippers.left = {
        anchorX: w * 0.22,
        anchorY: h * 0.86,
        len: actualFlipperLength,
        angle: Math.PI * 0.15,
        targetAngle: Math.PI * 0.15,
        isFlapping: false
    };
    
    this.flippers.right = {
        anchorX: w * 0.78,
        anchorY: h * 0.86,
        len: actualFlipperLength,
        angle: Math.PI * 0.85,
        targetAngle: Math.PI * 0.85,
        isFlapping: false
    };
    
    // Seed tactical bumpers across layout zones (Populated from orbitalDefense in production)
    const bumperCount = isApex ? 9 : 6;
    for (let i = 0; i < bumperCount; i++) {
        this.bumpers.push({
            x: (w / (bumperCount + 1)) * (i + 1) + (Math.random() - 0.5) * 30,
            y: h * 0.38 + (Math.random() - 0.5) * 180,
            radius: isApex ? 22 : 28,
            pulseGlow: 0,
            vacuumWaveRadius: 0
        });
    }
    
    this.generateDebrisScrapField();
    
    // --- [ INPUT PERIPHERAL LISTENER PROTOCOLS ] ---
    this._pulseRef = (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const mx = clientX - rect.left;
        const my = clientY - rect.top;
        
        if (my > h * 0.70) {
            if (mx < w / 2) {
                this.actuateLeftFlipper(true);
            } else {
                this.actuateRightFlipper(true);
            }
        } else {
            this.fireShockwaveThruster(mx, my);
        }
    };
    
    this._releaseRef = (e) => {
        if (!e.touches || e.touches.length === 0) {
            this.actuateLeftFlipper(false);
            this.actuateRightFlipper(false);
        }
    };
    
    this._keyDownRef = (e) => {
        if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') this.actuateLeftFlipper(true);
        if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') this.actuateRightFlipper(true);
        if (e.key === ' ') this.fireShockwaveThruster(this.player.x, this.player.y + 40);
    };
    
    this._keyUpRef = (e) => {
        if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') this.actuateLeftFlipper(false);
        if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') this.actuateRightFlipper(false);
    };

    this.canvas.addEventListener('mousedown', this._pulseRef);
    this.canvas.addEventListener('mouseup', this._releaseRef);
    this.canvas.addEventListener('touchstart', this._pulseRef, { passive: false });
    this.canvas.addEventListener('touchend', this._releaseRef, { passive: false });
    window.addEventListener('keydown', this._keyDownRef);
    window.addEventListener('keyup', this._keyUpRef);
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

cosmicRicochet.generateDebrisScrapField = function() {
    const pieces = this.isApexEvent ? 12 : 7;
    for (let i = 0; i < pieces; i++) {
        this.cargoScrap.push({
            x: Math.random() * (this.canvas.width - 60) + 30,
            y: Math.random() * (this.canvas.height * 0.5) + 60,
            radius: 6,
            collected: false
        });
    }
};

cosmicRicochet.actuateLeftFlipper = function(engage) {
    this.flippers.left.targetAngle = engage ? -Math.PI * 0.18 : Math.PI * 0.15;
    this.flippers.left.isFlapping = engage;
};

cosmicRicochet.actuateRightFlipper = function(engage) {
    this.flippers.right.targetAngle = engage ? Math.PI * 1.18 : Math.PI * 0.85;
    this.flippers.right.isFlapping = engage;
};

cosmicRicochet.fireShockwaveThruster = function(mx, my) {
    if (this.ammoPool < 5) return;
    
    const ang = Math.atan2(this.player.y - my, this.player.x - mx);
    const force = this.equippedEngine === "ion_node" ? 16.5 : 13.5;
    
    this.player.vx = Math.cos(ang) * force;
    this.player.vy = Math.sin(ang) * force;
    
    this.ammoPool -= 5;
    const hudAmmo = document.getElementById('game-hud-ammo');
    if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    
    this.triggerImpactSparks(mx, my, '#ffffff', 12);
};

cosmicRicochet.updatePhysics = function() {
    this.player.vy += 0.22; // Gravity vector pull constant
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;
    
    this.player.vx *= 0.993;
    this.player.vy *= 0.993;
    
    const r = this.player.radius;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    if (Math.hypot(this.player.vx, this.player.vy) > 0.5) {
        this.player.angle = Math.atan2(this.player.vy, this.player.vx) + Math.PI / 2;
    }
    
    if (this.player.x < r) { this.player.x = r; this.player.vx *= -0.85; }
    if (this.player.x > w - r) { this.player.x = w - r; this.player.vx *= -0.85; }
    if (this.player.y < r) { this.player.y = r; this.player.vy *= -0.85; }
    
    // Lower drainage containment breach handling
    if (this.player.y > h + 40) {
        this.player.x = w / 2;
        this.player.y = h * 0.2;
        this.player.vx = (Math.random() - 0.5) * 6;
        this.player.vy = 2;
        if (this.ammoPool > 10) this.ammoPool -= 10;
        const hudAmmo = document.getElementById('game-hud-ammo');
        if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    }
    
    // --- [ FLIPPER LINE SEGMENT VECTOR PHYSICS CALCULATION ] ---
    ['left', 'right'].forEach(side => {
        let flip = this.flippers[side];
        let diff = flip.targetAngle - flip.angle;
        let sweepSpeed = flip.isFlapping ? 0.32 : 0.14;
        flip.angle += diff * sweepSpeed;
        
        let endX = flip.anchorX + Math.cos(flip.angle) * flip.len;
        let endY = flip.anchorY + Math.sin(flip.angle) * flip.len;
        
        let A = this.player.x - flip.anchorX;
        let B = this.player.y - flip.anchorY;
        let DX = endX - flip.anchorX;
        let DY = endY - flip.anchorY;
        let lenSq = flip.len * flip.len;
        let dot = (A * DX + B * DY) / lenSq;
        let t = Math.max(0, Math.min(1, dot));
        
        let closeX = flip.anchorX + t * DX;
        let closeY = flip.anchorY + t * DY;
        let dist = Math.hypot(this.player.x - closeX, this.player.y - closeY);
        
        if (dist < r + 4) {
            let bounceAng = Math.atan2(this.player.y - closeY, this.player.x - closeX);
            let forceVel = flip.isFlapping ? 15.0 / this.player.mass : 9.0 / this.player.mass;
            
            this.player.vx = Math.cos(bounceAng) * forceVel;
            this.player.vy = Math.sin(bounceAng) * forceVel;
            
            this.player.x = closeX + Math.cos(bounceAng) * (r + 6);
            this.player.y = closeY + Math.sin(bounceAng) * (r + 6);
            
            this.triggerImpactSparks(closeX, closeY, '#ffffff', 8);
        }
    });
    
    // --- [ BUMPER DEFLECTION VECTOR MODIFIERS ] ---
    this.bumpers.forEach(b => {
        if (b.pulseGlow > 0) b.pulseGlow -= 0.04;
        if (b.vacuumWaveRadius > 0) {
            b.vacuumWaveRadius += 8;
            if (b.vacuumWaveRadius > 180) b.vacuumWaveRadius = 0;
        }
        
        let dist = Math.hypot(this.player.x - b.x, this.player.y - b.y);
        if (dist < b.radius + r) {
            const ang = Math.atan2(this.player.y - b.y, this.player.x - b.x);
            const launchForce = this.equippedNose === "heavy_wedge" ? 15.5 : 12.0;
            
            this.player.vx = Math.cos(ang) * launchForce;
            this.player.vy = Math.sin(ang) * launchForce;
            
            this.player.x = b.x + Math.cos(ang) * (b.radius + r + 2);
            this.player.y = b.y + Math.sin(ang) * (b.radius + r + 2);
            
            b.pulseGlow = 1.0;
            if (this.equippedEngine === "ion_node") b.vacuumWaveRadius = 1;
            
            let payout = this.isApexEvent ? 40 : 20;
            this.bonusScrapEarned += payout;
            
            const hudScrap = document.getElementById('game-hud-scrap');
            if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            
            this.triggerImpactSparks(b.x, b.y, this.biome.color, 14);
        }
        
        // Ion extraction suction loops pulling drifting minerals
        if (this.equippedEngine === "ion_node" && b.vacuumWaveRadius > 0) {
            this.cargoScrap.forEach(scrap => {
                if (!scrap.collected) {
                    let sDist = Math.hypot(scrap.x - b.x, scrap.y - b.y);
                    if (Math.abs(sDist - b.vacuumWaveRadius) < 25) {
                        let sAng = Math.atan2(b.y - scrap.y, b.x - scrap.x);
                        scrap.x += Math.cos(sAng) * 6;
                        scrap.y += Math.sin(sAng) * 6;
                    }
                }
            });
        }
    });
    
    // --- [ DRIFTING CORE MATERIAL INTERCEPT CHECKS ] ---
    this.cargoScrap.forEach(scrap => {
        if (!scrap.collected) {
            let dist = Math.hypot(this.player.x - scrap.x, this.player.y - scrap.y);
            if (dist < r + scrap.radius + 5) {
                scrap.collected = true;
                this.bonusScrapEarned += 35;
                const hudScrap = document.getElementById('game-hud-scrap');
                if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
                this.triggerImpactSparks(scrap.x, scrap.y, '#00ffaa', 6);
            }
        }
    });
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
        let p = this.particles[i];
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.035;
        if (p.alpha <= 0) this.particles.splice(i, 1);
    }
    
    if (this.cargoScrap.filter(s => !s.collected).length === 0) {
        this.generateDebrisScrapField();
    }
};

cosmicRicochet.triggerImpactSparks = function(x, y, color, amt) {
    let count = amt || 8;
    for (let i = 0; i < count; i++) {
        let a = Math.random() * Math.PI * 2;
        let s = Math.random() * 5 + 2;
        this.particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, alpha: 1, color: color });
    }
};

cosmicRicochet.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Paint Capacitor Bumpers
    this.bumpers.forEach(b => {
        ctx.save();
        ctx.strokeStyle = this.biome.color;
        ctx.lineWidth = b.pulseGlow > 0 ? 4 : 2;
        ctx.fillStyle = b.pulseGlow > 0 ? `${this.biome.color}25` : 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = b.pulseGlow * 20; ctx.shadowColor = this.biome.color;
        
        ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.globalAlpha = b.pulseGlow;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.radius * 0.6, 0, Math.PI * 2); ctx.stroke();
        
        if (b.vacuumWaveRadius > 0) {
            ctx.strokeStyle = '#00ffaa'; ctx.lineWidth = 2;
            ctx.globalAlpha = Math.max(0, 1.0 - (b.vacuumWaveRadius / 180));
            ctx.beginPath(); ctx.arc(b.x, b.y, b.vacuumWaveRadius, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    });
    
    // Paint Drifting Minerals Matrix
    this.cargoScrap.forEach(scrap => {
        if (!scrap.collected) {
            ctx.save();
            ctx.fillStyle = '#00ffaa'; ctx.shadowBlur = 10; ctx.shadowColor = '#00ffaa';
            ctx.beginPath();
            ctx.moveTo(scrap.x, scrap.y - scrap.radius);
            ctx.lineTo(scrap.x + scrap.radius, scrap.y);
            ctx.lineTo(scrap.x, scrap.y + scrap.radius);
            ctx.lineTo(scrap.x - scrap.radius, scrap.y);
            ctx.closePath(); ctx.fill();
            ctx.restore();
        }
    });
    
    // Paint Actuated Flippers
    ['left', 'right'].forEach(side => {
        let flip = this.flippers[side];
        let endX = flip.anchorX + Math.cos(flip.angle) * flip.len;
        let endY = flip.anchorY + Math.sin(flip.angle) * flip.len;
        
        ctx.save();
        ctx.strokeStyle = this.equippedWings === "magnetic_fins" ? '#00e5ff' : '#ffffff';
        ctx.lineWidth = 7; ctx.lineCap = 'round';
        ctx.shadowBlur = this.equippedWings === "magnetic_fins" ? 15 : 5;
        ctx.shadowColor = ctx.strokeStyle;
        
        ctx.beginPath();
        ctx.moveTo(flip.anchorX, flip.anchorY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        ctx.fillStyle = '#444444'; ctx.beginPath(); ctx.arc(flip.anchorX, flip.anchorY, 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
    
    this.particles.forEach(p => {
        ctx.save(); ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3); ctx.restore();
    });
    
    // --- [ RENDER CUSTOM VECTOR SHIPS GEOMETRY SCHEMATICS ] ---
    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    ctx.rotate(this.player.angle);
    
    const r = this.player.radius;
    
    // Combustion plumes
    ctx.fillStyle = this.equippedEngine === "ion_node" ? '#00ffaa' : '#ffaa00';
    ctx.globalAlpha = 0.75 + Math.sin(this.frameCount * 0.4) * 0.2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, r * 0.5);
    ctx.lineTo(0, r * (1.1 + Math.random() * 0.3));
    ctx.lineTo(r * 0.3, r * 0.5);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1.0;
    
    // Dynamic Wing Formations
    ctx.strokeStyle = this.equippedWings === "magnetic_fins" ? '#00e5ff' : this.biome.color;
    ctx.lineWidth = 2; ctx.fillStyle = '#08080a';
    ctx.beginPath();
    if (this.equippedWings === "magnetic_fins") {
        ctx.moveTo(-r * 0.2, r * 0.2); ctx.lineTo(-r * 1.2, r * 0.4); ctx.lineTo(-r * 0.4, -r * 0.2);
        ctx.moveTo(r * 0.2, r * 0.2); ctx.lineTo(r * 1.2, r * 0.4); ctx.lineTo(r * 0.4, -r * 0.2);
    } else {
        ctx.moveTo(-r * 0.2, r * 0.2); ctx.lineTo(-r * 0.8, r * 0.2); ctx.lineTo(-r * 0.3, -r * 0.1);
        ctx.moveTo(r * 0.2, r * 0.2); ctx.lineTo(r * 0.8, r * 0.2); ctx.lineTo(r * 0.3, -r * 0.1);
    }
    ctx.stroke(); ctx.fill();
    
    // Core structural fuselage capsule
    ctx.fillStyle = '#0d0d12'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    
    // Dynamic Nose Shield Wedge
    ctx.strokeStyle = this.equippedNose === "heavy_wedge" ? '#ff3366' : '#ffffff';
    ctx.fillStyle = '#14141f'; ctx.lineWidth = 2;
    ctx.beginPath();
    if (this.equippedNose === "heavy_wedge") {
        ctx.moveTo(-r * 0.5, -r * 0.3);
        ctx.lineTo(-r * 0.6, -r * 0.8);
        ctx.lineTo(0, -r * 1.3);
        ctx.lineTo(r * 0.6, -r * 0.8);
        ctx.lineTo(r * 0.5, -r * 0.3);
    } else {
        ctx.moveTo(-r * 0.3, -r * 0.4);
        ctx.lineTo(0, -r * 1.0);
        ctx.lineTo(r * 0.3, -r * 0.4);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    
    ctx.restore();
};

cosmicRicochet.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._pulseRef);
        this.canvas.removeEventListener('mouseup', this._releaseRef);
        this.canvas.removeEventListener('touchstart', this._pulseRef);
        this.canvas.removeEventListener('touchend', this._releaseRef);
    }
    window.removeEventListener('keydown', this._keyDownRef);
    window.removeEventListener('keyup', this._keyUpRef);
};
