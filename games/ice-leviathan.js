/**
 * ICE-LEVIATHAN.JS [ DIAGNOSTIC TELEMETRY RE-BUILD ]
 * Gravity peg-shattering engine equipped with explicit resizing loops and canvas text indicators.
 */

const iceLeviathan = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    // Core parameters
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    // Rendering Nodes
    playerElement: null,
    viewportElement: null,
    
    // Physical Vector Matrices
    player: { x: 0, y: 60, radius: 30, angle: 0 },
    probes: [],    
    pegs: [],      
    particles: [], 
    collectibles: [],
    floatingTexts: [],
    
    gravity: 0.25,
    mouse: { x: 0, y: 0 }
};

iceLeviathan.init = function(canvas, ctx, biome, isApex, ammo) {
    try {
        this.canvas = canvas;
        this.ctx = ctx;
        this.biome = biome || { id: 'ICE', color: '#00e5ff' };
        this.isApexEvent = isApex;
        this.ammoPool = (ammo || 20) * 5; 
        this.bonusScrapEarned = 0;
        this.frameCount = 0;
        
        this.probes = [];
        this.pegs = [];
        this.particles = [];
        this.collectibles = [];
        this.floatingTexts = [];
        
        this.resizeCanvas();
        this.player.x = this.canvas.width / 2;
        this.mouse.x = this.canvas.width / 2;
        this.mouse.y = this.canvas.height / 2;
        
        // Populate Peg grid arrays
        const rows = this.isApexEvent ? 6 : 4;
        const cols = 9;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const staggerX = (r % 2 === 0) ? 25 : -25;
                const px = (this.canvas.width / (cols + 1)) * (c + 1) + staggerX;
                const py = 180 + (r * 65);
                
                if (px > 40 && px < this.canvas.width - 40) {
                    this.pegs.push({
                        x: px, y: py,
                        radius: 12,
                        hp: this.isApexEvent ? 2 : 1
                    });
                }
            }
        }
        
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
                this.playerElement.innerHTML = `<div style="width:100%; height:100%; background:${this.biome.color}; clip-path:polygon(50% 0%, 0% 100%, 100% 100%);"></div>`;
            }
            this.viewportElement.appendChild(this.playerElement);
        }
        
        this._moveRef = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        };
        this._clickRef = () => this.manuallyDeployProbe();
        this._resizeRef = () => this.resizeCanvas();
        
        this.canvas.addEventListener('mousemove', this._moveRef);
        this.canvas.addEventListener('click', this._clickRef);
        window.addEventListener('resize', this._resizeRef);
        
        this.loopActive = true;
        this.executeSimulationLoop();
    } catch (err) {
        alert("CRITICAL SYNC FAILURE DURING GRAVITY INIT BLOCK:\n" + err.message);
    }
};

iceLeviathan.manuallyDeployProbe = function() {
    if (this.ammoPool <= 0) return;
    this.ammoPool--;
    const hudAmmo = document.getElementById('game-hud-ammo');
    if (hudAmmo) hudAmmo.innerText = this.ammoPool;
    
    this.probes.push({
        x: this.player.x + Math.cos(this.player.angle) * 45,
        y: this.player.y + Math.sin(this.player.angle) * 45,
        vx: Math.cos(this.player.angle) * 10,
        vy: Math.sin(this.player.angle) * 10,
        radius: 7
    });
};

iceLeviathan.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

iceLeviathan.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    try {
        this.frameCount++;
        
        // --- [ FIXED: REDUNDANT RESIZE STRIPPED ] ---
        // Removed this.resizeCanvas() from the 60 FPS animation loop.
        // Re-allocating width/height here forces the browser to wipe the canvas clean every frame.
        
        this.updatePhysics();
        this.drawScene();
        this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
    } catch (frameError) {
        this.loopActive = false;
        alert("CRITICAL RENDER THREAD CRASH INSIDE GRAVITY FRAME STEP:\n" + frameError.message);
    }
};

iceLeviathan.updatePhysics = function() {
    let dx = this.mouse.x - this.player.x;
    let dy = this.mouse.y - this.player.y;
    this.player.angle = Math.atan2(dy, dx);
    
    if (this.playerElement) {
        const ox = this.player.x - 40;
        const oy = this.player.y - 40;
        const rot = this.player.angle * (180 / Math.PI) - 90;
        this.playerElement.style.transform = `translate3d(${ox}px, ${oy}px, 0) rotate(${rot}deg)`;
    }
    
    if (this.ammoPool > 0 && this.probes.length < 2 && Math.random() < 0.02) {
        this.manuallyDeployProbe();
    }
    
    for (let i = this.probes.length - 1; i >= 0; i--) {
        let p = this.probes[i];
        p.vy += this.gravity;
        p.x += p.vx; p.y += p.vy;
        
        if (p.x < p.radius) { p.x = p.radius; p.vx *= -0.8; }
        if (p.x > this.canvas.width - p.radius) { p.x = this.canvas.width - p.radius; p.vx *= -0.8; }
        
        if (p.y > this.canvas.height + 20) {
            this.probes.splice(i, 1);
            continue;
        }
        
        for (let j = this.pegs.length - 1; j >= 0; j--) {
            let peg = this.pegs[j];
            let pdx = p.x - peg.x;
            let pdy = p.y - peg.y;
            let pdist = Math.sqrt(pdx * pdx + pdy * pdy);
            
            if (pdist < p.radius + peg.radius) {
                let nx = pdx / pdist;
                let ny = pdy / pdist;
                
                p.x = peg.x + nx * (p.radius + peg.radius);
                p.y = peg.y + ny * (p.radius + peg.radius);
                
                let dot = p.vx * nx + p.vy * ny;
                p.vx = (p.vx - 2 * dot * nx) * 0.8;
                p.vy = (p.vy - 2 * dot * ny) * 0.8;
                
                peg.hp--;
                
                if (peg.hp <= 0) {
                    this.triggerPegExplosion(peg.x, peg.y);
                    this.collectibles.push({
                        x: peg.x, y: peg.y,
                        vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * -3,
                        value: Math.round((Math.random() * 4 + 4) * (this.isApexEvent ? 3.0 : 1.0))
                    });
                    this.pegs.splice(j, 1);
                }
                break;
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
        
        if (cdist < 550) {
            let pull = (550 - cdist) / 10;
            c.x += (cdx / cdist) * pull;
            c.y += (cdy / cdist) * pull;
        }
        
        if (cdist < 45) {
            this.bonusScrapEarned += c.value;
            this.floatingTexts.push({ x: c.x, y: c.y - 10, text: `+${c.value}`, alpha: 1 });
            const hudScrap = document.getElementById('game-hud-scrap');
            if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            this.collectibles.splice(i, 1);
        }
    }
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
        let pt = this.particles[i];
        pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.05;
        pt.alpha -= 0.02;
        if (pt.alpha <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        let t = this.floatingTexts[i];
        t.y -= 0.6; t.alpha -= 0.02;
        if (t.alpha <= 0) this.floatingTexts.splice(i, 1);
    }
};

iceLeviathan.triggerPegExplosion = function(x, y) {
    for (let i = 0; i < 10; i++) {
        let a = Math.random() * Math.PI * 2;
        let s = Math.random() * 3 + 2;
        this.particles.push({
            x: x, y: y,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            radius: Math.random() * 2 + 1, alpha: 1,
            color: this.biome.color
        });
    }
};

iceLeviathan.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // --- [ ACTIVE TELEMETRY HEARTBEAT INDICATORS ] ---
    // Renders a distinct safety boundary card and string count directly onto the canvas view matrix
    ctx.save();
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, this.canvas.width - 20, this.canvas.height - 20);
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`[ LEVIATHAN CANVAS ACTIVE // LOOP HEARTBEAT FRAME: ${this.frameCount} ]`, 25, 95);
    ctx.restore();
    // --------------------------------------------------

    ctx.save();
    ctx.strokeStyle = this.biome.color;
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(this.player.x, this.player.y);
    ctx.lineTo(this.player.x + Math.cos(this.player.angle) * 350, this.player.y + Math.sin(this.player.angle) * 350);
    ctx.stroke();
    ctx.restore();
    
    this.pegs.forEach(peg => {
        ctx.save();
        ctx.strokeStyle = this.biome.color;
        ctx.lineWidth = 2;
        ctx.fillStyle = '#050515';
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.restore();
    });
    
    this.probes.forEach(p => {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
    
    this.collectibles.forEach(c => {
        ctx.save();
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.rect(c.x - 4, c.y - 4, 8, 8);
        ctx.fill();
        ctx.restore();
    });
    
    this.particles.forEach(pt => {
        ctx.save(); ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
    
    this.floatingTexts.forEach(t => {
        ctx.save(); ctx.globalAlpha = t.alpha;
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    });
};

iceLeviathan.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    this.ammoPool = Math.ceil(this.ammoPool / 5);
    if (this.playerElement) { this.playerElement.remove(); this.playerElement = null; }
    if (this.canvas) {
        this.canvas.removeEventListener('mousemove', this._moveRef);
        this.canvas.removeEventListener('click', this._clickRef);
    }
    window.removeEventListener('resize', this._resizeRef);
};
