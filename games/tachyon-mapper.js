/**
 * TACHYON-MAPPER.JS [ S-TIER PREPARATION MODULE ]
 * Sequential Order Index Numerical Calibration Interface.
 * Controls: Tap floating numerical fields strictly in ascending sequence hierarchy.
 */

const tachyonMapper = {
    canvas: null,
    ctx: null,
    loopActive: false,
    rafId: null,
    
    ammoPool: 0,
    bonusScrapEarned: 0,
    biome: null,
    isApexEvent: false,
    
    dataPackets: [],
    targetIndex: 1
};

tachyonMapper.init = function(canvas, ctx, biome, isApex, ammo) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.biome = biome || { id: 'CYBER', color: '#00ff88' };
    this.isApexEvent = isApex;
    this.ammoPool = Math.ceil(ammo || 100);
    this.bonusScrapEarned = 0;
    this.targetIndex = 1;
    
    this.dataPackets = [];
    this.resizeCanvas();
    
    // Populate an ordered array chain of target packets drifting in orbit paths
    const count = 4;
    for (let i = 1; i <= count; i++) {
        this.dataPackets.push({
            id: i,
            x: (this.canvas.width / (count + 1)) * i + (Math.random() - 0.5) * 30,
            y: Math.random() * (this.canvas.height - 200) + 100,
            radius: 22
        });
    }
    
    this._sortRef = (e) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const mx = clientX - rect.left;
        const my = clientY - rect.top;
        this.evaluatePacketTap(mx, my);
    };
    
    this.canvas.addEventListener('mousedown', this._sortRef);
    this.canvas.addEventListener('touchstart', this._sortRef, { passive: false });
    
    this.loopActive = true;
    this.executeSimulationLoop();
};

tachyonMapper.resizeCanvas = function() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
};

tachyonMapper.evaluatePacketTap = function(mx, my) {
    let clickedPacket = null;
    let index = -1;
    
    for (let i = 0; i < this.dataPackets.length; i++) {
        let p = this.dataPackets[i];
        if (Math.hypot(mx - p.x, my - p.y) < p.radius + 5) { clickedPacket = p; index = i; break; }
    }
    
    if (clickedPacket) {
        if (clickedPacket.id === this.targetIndex) {
            // SUCCESS: Sequence alignment valid!
            this.targetIndex++;
            let profit = this.isApexEvent ? 24 : 12;
            this.bonusScrapEarned += profit;
            this.dataPackets.splice(index, 1);
            
            const hudScrap = document.getElementById('game-hud-scrap');
            if (hudScrap) hudScrap.innerText = `+${this.bonusScrapEarned} SCRAP`;
            
            // Re-spawn wave grid once completely cleared down to empty coordinates
            if (this.dataPackets.length === 0) {
                this.targetIndex = 1;
                this.init(this.canvas, this.ctx, this.biome, this.isApexEvent, this.ammoPool);
            }
        } else {
            // Out-of-order calibration breaks matrix linkage
            if (this.ammoPool > 8) this.ammoPool -= 8;
            const hudAmmo = document.getElementById('game-hud-ammo');
            if (hudAmmo) hudAmmo.innerText = this.ammoPool;
        }
    }
};

tachyonMapper.executeSimulationLoop = function() {
    if (!this.loopActive) return;
    this.drawScene();
    this.rafId = requestAnimationFrame(() => this.executeSimulationLoop());
};

tachyonMapper.drawScene = function() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Floating Numeric Data Fields
    this.dataPackets.forEach(p => {
        ctx.save();
        ctx.strokeStyle = this.biome.color; ctx.lineWidth = 2;
        ctx.fillStyle = p.id === this.targetIndex ? `${this.biome.color}22` : 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = p.id === this.targetIndex ? 15 : 0; ctx.shadowColor = this.biome.color;
        
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`0${p.id}`, p.x, p.y + 4);
        ctx.restore();
    });
    
    // Guidance help readout header tracking strings
    ctx.save();
    ctx.fillStyle = '#666666'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`TARGET CALIBRATION NODE INDEX: 0${this.targetIndex}`, this.canvas.width/2, 45);
    ctx.restore();
};

tachyonMapper.terminate = function() {
    this.loopActive = false;
    cancelAnimationFrame(this.rafId);
    if (this.canvas) {
        this.canvas.removeEventListener('mousedown', this._sortRef);
        this.canvas.removeEventListener('touchstart', this._sortRef);
    }
};
