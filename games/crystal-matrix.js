/**
 * CRYSTAL-MATRIX.JS [ HARDENED TELEMETRY BUILD ]
 * HTML5 Canvas grid block extraction collapse engine equipped with continuous dimension anchors and telemetry tracking loops.
 */

const crystalMatrix = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    frameCount: 0,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    playerElement: null,
    viewportElement: null,
    
    player: { x: 0, y: 0, radius: 30 },
    grid: [],
    cols: 10,
    rows: 7,
    blockSize: 45,
    gridStartX: 0,
    gridStartY: 140,
    
    particles: [],
    floatingTexts: [],
    colorsList: []
};

crystalMatrix.init = function(canvas, ctx, biome, isApex, ammo) {
    try {
        this.canvas = canvas;
        this.ctx = ctx;
        this.biome = biome || { id: 'CRYSTAL', color: '#ff66cc' };
        this.isApexEvent = isApex;
        this.ammoPool = (ammo || 20) * 5; // Handle 5x overcharge matrix calibration
        this.bonusScrapEarned = 0;
        this.frameCount = 0;
        
        this.particles = [];
        this.floatingTexts = [];
        this.grid = [];
        
        this.resizeCanvas();
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 65;
        this.gridStartX = (this.canvas.width - (this.cols * this.blockSize)) / 2;
        
        // Explicit Hex array structures bypass variable constraints
        this.colorsList = [this.biome.color, '#ffffff', '#ffaa00', '#00ff88'];
        
        // Build the active structural match block board grid matrices
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = {
                    color: this.colorsList[Math.floor(Math.random() * this.colorsList.length)],
                    active: true
                };
            }
        }
        
        // Mount absolute starfighter HTML node center bottom
        this.viewportElement = document.getElementById('minigame-viewport');
        if (this.viewportElement) {
            this.playerElement = document.createElement('div');
            this.playerElement.id = 'minigame-player-ship';
            this.playerElement.style.cssText = `
                position: absolute; width: 80px; height: 80px;
                left: ${this.player.x - 40}px; top: ${this.player.y - 40}px; z-index: 10002; pointer-events: none;
                filter: drop-shadow(0 0 15px ${this.biome.color});
                will-change: transform;
            `;
            if (typeof drawModularShip === 'function' && typeof state !== 'undefined' && state.shipParts) {
                drawModularShip(this.playerElement, state.shipParts);
            } else {
                this.playerElement.innerHTML = `<div style="width:100%; height:100%; background:${this.biome.color}; clip-path:polygon(50% 0%, 0% 100%, 100% 100%);"></div>`;
            }
            this.viewportElement.appendChild(this.playerElement);
        }
        
        this._clickRef = (e) => this.handleGridClick(e);
        this._resizeRef = () => this.resizeCanvas();
        
        this.canvas.addEventListener('click', this._clickRef);
        window.addEventListener('resize', this._resizeRef);
        
        this.loopActive = true;
        this.executeSimulationLoop();
    } catch(err) {
        alert("CRITICAL SYNC FAILURE DURING CRYSTAL INIT BLOCK:\n" + err.message);
    }
};

crystalMatrix.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.gridStartX = (this.canvas.width - (this.cols * this.blockSize)) / 2;
    if (this.playerElement) {
        this.player.x = this.canvas.width / 2;
        this.playerElement.style.left = `${this.player.x - 40}px`;
    }
};

crystalMatrix.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    try {
        this.frameCount++;
        
        // --- [ FIXED: REDUNDANT RESIZE STRIPPED ] ---
        // Removed this.resizeCanvas() from the 60 FPS animation loop.
        // Stripping this stops the loop from instantly clearing out the block map rendering array.
        
        this.updateAnimationArrays();
        this.drawScene();
        this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
    } catch (frameError) {
        this.loopActive = false;
        alert("CRITICAL RENDER THREAD CRASH INSIDE CRYSTAL FRAME STEP:\n" + frameError.message);
    }
};

crystalMatrix.handleGridClick = function(e) {
    if (this.ammoPool <= 0) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const c = Math.floor((mx - this.gridStartX) / this.blockSize);
    const r = Math.floor((my - this.gridStartY) / this.blockSize);
    
    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
        const target = this.grid[r][c];
        if (target && target.active) {
            let cluster = [];
            this.findClusterNodes(r, c, target.color, cluster);
            
            // Allow processing extraction collapse loops on matching paths of 2 cells or more
            if (cluster.length >= 2) {
                this.ammoPool = Math.max(0, this.ammoPool - 5); 
                const hudAmmo = document.getElementById('game-hud-ammo');
                if (hudAmmo) hudAmmo.innerText = this.ammoPool;
                
                let yieldValue = cluster.length * (this.isApexEvent ? 3 : 1) * 3;
                this.bonusScrapEarned += yieldValue;
                const hudScrap = document.getElementById('game-hud-scrap');
                if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
                
                cluster.forEach(node => {
                    this.grid[node.r][node.c].active = false;
                    this.burstBlockFX(
                        this.gridStartX + node.c * this.blockSize + this.blockSize/2,
                        this.gridStartY + node.r * this.blockSize + this.blockSize/2,
                        target.color
                    );
                });
                
                this.floatingTexts.push({ x: mx, y: my, text: `+${yieldValue} SCRAP`, alpha: 1 });
            }
        }
    }
};

crystalMatrix.findClusterNodes = function(r, c, color, cluster) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return;
    if (!this.grid[r][c].active || this.grid[r][c].color !== color) return;
    if (cluster.some(n => n.r === r && n.c === c)) return;
    
    cluster.push({ r, c });
    this.findClusterNodes(r + 1, c, color, cluster);
    this.findClusterNodes(r - 1, c, color, cluster);
    this.findClusterNodes(r, c + 1, color, cluster);
    this.findClusterNodes(r, c - 1, color, cluster);
};

crystalMatrix.burstBlockFX = function(x, y, color) {
    for (let i = 0; i < 8; i++) {
        this.particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5,
            size: Math.random() * 3 + 2, alpha: 1, color: color
        });
    }
};

crystalMatrix.updateAnimationArrays = function() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
        let pt = this.particles[i];
        pt.x += pt.vx; pt.y += pt.vy;
        
        // Magnet vacuum pull down towards flagship coordinates
        let dx = this.player.x - pt.x;
        let dy = this.player.y - pt.y;
        let d = Math.sqrt(dx * dx + dy * dy);
        if (d > 5) {
            pt.x += (dx / d) * 2; pt.y += (dy / d) * 2;
        }
        
        pt.alpha -= 0.015;
        if (pt.alpha <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        let t = this.floatingTexts[i];
        t.y -= 0.6; t.alpha -= 0.02;
        if (t.alpha <= 0) this.floatingTexts.splice(i, 1);
    }
};

crystalMatrix.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // --- [ ACTIVE TELEMETRY HEARTBEAT INDICATORS ] ---
    // Draws hardware validation boundaries onto canvas stream contexts
    ctx.save();
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, this.canvas.width - 20, this.canvas.height - 20);
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`[ MATRIX CANVAS ACTIVE // LOOP HEARTBEAT FRAME: ${this.frameCount} ]`, 25, 95);
    ctx.restore();
    // --------------------------------------------------

    for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
            let b = this.grid[r][c];
            if (b.active) {
                const bx = this.gridStartX + c * this.blockSize;
                const by = this.gridStartY + r * this.blockSize;
                
                ctx.save();
                ctx.strokeStyle = '#111122';
                ctx.lineWidth = 1;
                ctx.fillStyle = b.color;
                ctx.beginPath();
                ctx.rect(bx + 2, by + 2, this.blockSize - 4, this.blockSize - 4);
                ctx.fill(); ctx.stroke();
                ctx.restore();
            }
        }
    }
    
    this.particles.forEach(pt => {
        ctx.save(); ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath(); ctx.rect(pt.x, pt.y, pt.size, pt.size); ctx.fill();
        ctx.restore();
    });
    
    this.floatingTexts.forEach(t => {
        ctx.save(); ctx.globalAlpha = t.alpha;
        ctx.fillStyle = '#00ff88'; // Hex overridden collection color profile
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    });
};

crystalMatrix.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    this.ammoPool = Math.ceil(this.ammoPool / 5);
    if (this.playerElement) { this.playerElement.remove(); this.playerElement = null; }
    if (this.canvas) this.canvas.removeEventListener('click', this._clickRef);
    window.removeEventListener('resize', this._resizeRef);
};
