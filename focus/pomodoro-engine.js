/**
 * POMODORO-ENGINE.JS [ PATCH V15.2 — SETUP TIMELINE HARMONY ]
 * Handles focus timers, resource harvesting, and embeds a manual biome cheat control center.
 * Features built-in Campaign Timeline Tracking inside the Planetary Descent panel.
 */

const PLANET_BIOMES = [
    { id: 'MAGMA', color: '#ff3366', bg: 'radial-gradient(circle at bottom, #3a0008 0%, #000000 80%)' },
    { id: 'ICE', color: '#00e5ff', bg: 'radial-gradient(circle at bottom, #001a22 0%, #000000 80%)' },
    { id: 'CYBER', color: '#00ff88', bg: 'radial-gradient(circle at bottom, #002211 0%, #000000 80%)' },
    { id: 'VOID', color: '#a200ff', bg: 'radial-gradient(circle at bottom, #1a0033 0%, #000000 80%)' },
    { id: 'TOXIC', color: '#ccff00', bg: 'radial-gradient(circle at bottom, #1a3300 0%, #000000 80%)' },
    { id: 'CRYSTAL', color: '#ff66cc', bg: 'radial-gradient(circle at bottom, #330033 0%, #000000 80%)' },
    { id: 'DUNE', color: '#ffaa00', bg: 'radial-gradient(circle at bottom, #331a00 0%, #000000 80%)' },
    { id: 'ABYSSAL', color: '#0066ff', bg: 'radial-gradient(circle at bottom, #000a33 0%, #000000 80%)' },
    { id: 'SPORE', color: '#b266ff', bg: 'radial-gradient(circle at bottom, #1a0033 0%, #000000 80%)' },
    { id: 'FERROUS', color: '#cc5500', bg: 'radial-gradient(circle at bottom, #330a00 0%, #000000 80%)' },
    { id: 'FALLOUT', color: '#bfff00', bg: 'radial-gradient(circle at bottom, #1a2200 0%, #000000 80%)' },
    { id: 'ECLIPSE', color: '#e0e0e0', bg: 'radial-gradient(circle at bottom, #111111 0%, #000000 80%)' },
    { id: 'PLASMA', color: '#7700ff', bg: 'radial-gradient(circle at bottom, #110033 0%, #000000 80%)' },
    { id: 'CHRONOS', color: '#ffe55c', bg: 'radial-gradient(circle at bottom, #332b00 0%, #000000 80%)' }
];

// --- [ STRICT FOCUS ENFORCER ] ---
document.addEventListener("visibilitychange", () => {
    if (document.hidden && focusState && focusState.isActive) {
        const powerMode = localStorage.getItem('cryoScreenMode') || 'BRIGHT';
        if (powerMode === 'SYSTEM') return; 
        
        clearInterval(focusState.timerInterval);
        focusState.isActive = false;
        
        if (typeof exitCryoMode === 'function') exitCryoMode();
        
        setTimeout(() => {
            alert("CRITICAL FAILURE: Hull breach detected! You left the Cryo-Chamber interface.\n\nAll Energy and Scrap gathered this session has been lost.");
        }, 100);
    }
});

let focusState = {
    isActive: false,
    timerInterval: null,
    timeRemaining: 0,
    sessionTotalDuration: 0,
    sessionMultiplier: 1.0,
    targetStartTime: 0,
    targetEndTime: 0,
    
    // FIXED: Default timer allocation re-routed to 30 minutes seamlessly
    selectedDuration: 30,
    selectedMultiplier: 1.25,
    
    dripScrapDeposited: 0,
    campaignProgress: parseInt(localStorage.getItem('campaignProgress')) || 0,
    currentBiome: null,
    sessionEnergy: 0,
    sessionScrap: 0,
    wakeLock: null
};

try {
    focusState.currentBiome = JSON.parse(localStorage.getItem('currentBiome')) || PLANET_BIOMES[0];
} catch(e) {
    focusState.currentBiome = PLANET_BIOMES[0];
}

function selectCryoTimer(minutes, multiplier, btnElement) {
    focusState.selectedDuration = minutes;
    focusState.selectedMultiplier = multiplier;
    const buttons = document.querySelectorAll('.timer-select-btn');
    buttons.forEach(btn => {
        btn.style.borderColor = '#555';
        btn.style.color = '#fff';
        btn.style.boxShadow = 'none';
    });
    if (btnElement && focusState.currentBiome) {
        btnElement.style.borderColor = focusState.currentBiome.color;
        btnElement.style.color = focusState.currentBiome.color;
        btnElement.style.boxShadow = `inset 0 0 10px ${focusState.currentBiome.color}33`;
    }
}

function devSetTestBiome(biomeId) {
    const match = PLANET_BIOMES.find(b => b.id === biomeId);
    if (match) {
        focusState.currentBiome = match;
        localStorage.setItem('currentBiome', JSON.stringify(match));
        const modal = document.querySelector('.modal-overlay');
        if (modal) modal.remove();
        openCryoSetupModal(); 
    }
}

function openCryoSetupModal() {
    if (!focusState.currentBiome || !focusState.currentBiome.color) {
        focusState.currentBiome = PLANET_BIOMES[0];
    }
    const modal = document.createElement('div');
    modal.className = 'modal-overlay warp-transition';
    modal.style.display = 'flex';
    const progressPct = (focusState.campaignProgress / 90) * 100;
    
    // --- [ INJECT CONTEXTUAL CAMPAIGN TIMELINE ASYNC VARIABLES ] ---
    let progressVal = focusState.campaignProgress;
    let is30Lit = progressVal >= 30;
    let is60Lit = progressVal >= 60;
    let is90Lit = progressVal >= 90;
    let filledBarWidth = is90Lit ? 100 : (is60Lit ? 50 : 0);

    const componentTimelineHtml = `
        <div style="margin: 18px 0; font-family: monospace; text-align: left;">
            <div style="font-size: 0.55rem; color: #666; letter-spacing: 2px; margin-bottom: 8px; text-transform: uppercase; font-weight: bold;">GALAXY TIMELINE PROGRESS</div>
            <div style="position: relative; display: flex; justify-content: space-between; align-items: center; padding: 12px 10px; background: rgba(255,255,255,0.02); border: 1px solid #111; border-radius: 4px;">
                <div style="position: absolute; top: 50%; left: 40px; right: 40px; height: 2px; background: #1a1a1a; transform: translateY(-50%); z-index: 1;"></div>
                <div style="position: absolute; top: 50%; left: 40px; width: calc(${filledBarWidth}% - ${filledBarWidth === 100 ? '80px' : filledBarWidth === 50 ? '40px' : '0px'}); height: 2px; background: ${focusState.currentBiome.color}; transform: translateY(-50%); z-index: 2; transition: width 0.4s ease;"></div>
                
                <div style="position: relative; z-index: 3; display: flex; flex-direction: column; align-items: center; width: 65px;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: ${is30Lit ? '#000' : '#111'}; border: 2px solid ${is30Lit ? focusState.currentBiome.color : '#333'}; display: flex; align-items: center; justify-content: center; color: ${is30Lit ? '#fff' : '#555'}; box-shadow: ${is30Lit ? '0 0 10px ' + focusState.currentBiome.color + '44' : 'none'}; transition: all 0.3s;">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                    </div>
                    <span style="font-size: 0.48rem; font-weight: bold; color: ${is30Lit ? '#fff' : '#444'}; margin-top: 5px; letter-spacing: 1px;">PREPARING</span>
                    <span style="font-size: 0.42rem; color: #666;">30M</span>
                </div>

                <div style="position: relative; z-index: 3; display: flex; flex-direction: column; align-items: center; width: 65px;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: ${is60Lit ? '#000' : '#111'}; border: 2px solid ${is60Lit ? focusState.currentBiome.color : '#333'}; display: flex; align-items: center; justify-content: center; color: ${is60Lit ? '#fff' : '#555'}; box-shadow: ${is60Lit ? '0 0 10px ' + focusState.currentBiome.color + '44' : 'none'}; transition: all 0.3s;">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                    </div>
                    <span style="font-size: 0.48rem; font-weight: bold; color: ${is60Lit ? '#fff' : '#444'}; margin-top: 5px; letter-spacing: 1px;">DESCENDING</span>
                    <span style="font-size: 0.42rem; color: #666;">60M</span>
                </div>

                <div style="position: relative; z-index: 3; display: flex; flex-direction: column; align-items: center; width: 65px;">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: ${is90Lit ? '#000' : '#111'}; border: 2px solid ${is90Lit ? focusState.currentBiome.color : '#333'}; display: flex; align-items: center; justify-content: center; color: ${is90Lit ? '#fff' : '#555'}; box-shadow: ${is90Lit ? '0 0 10px ' + focusState.currentBiome.color + '44' : 'none'}; transition: all 0.3s;">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18h10M5 14h14M12 2v12M12 14l4-4M12 14L8 10"/></svg>
                    </div>
                    <span style="font-size: 0.48rem; font-weight: bold; color: ${is90Lit ? '#fff' : '#444'}; margin-top: 5px; letter-spacing: 1px;">EXTRACTION</span>
                    <span style="font-size: 0.42rem; color: #666;">90M</span>
                </div>
            </div>
        </div>
    `;

    let devButtonsHtml = '';
    PLANET_BIOMES.forEach(b => {
        const isCurrent = b.id === focusState.currentBiome.id;
        devButtonsHtml += `
            <button type="button" onclick="devSetTestBiome('${b.id}')" style="padding:4px 2px; font-size:0.55rem; background:transparent; border:1px solid ${isCurrent ? b.color : '#444'}; color:${isCurrent ? b.color : '#aaa'}; font-weight:${isCurrent ? 'bold' : 'normal'}; cursor:pointer; border-radius:2px; text-align:center;">
                ${b.id}
            </button>
        `;
    });

    modal.innerHTML = `
        <div class="modal-content" style="border: 1px solid ${focusState.currentBiome.color}; background: rgba(0,0,5,0.95); padding: 20px; width: 90%; max-width: 430px; box-shadow: 0 0 40px ${focusState.currentBiome.color}22; border-radius: 4px; overflow-y:auto; max-height:90vh;">
            <div class="view-level-title" style="color: ${focusState.currentBiome.color}; text-shadow: 0 0 10px ${focusState.currentBiome.color}; margin-top: 0;">CRYO-STASIS // PLANETARY DESCENT</div>
            <h2 class="view-main-title" style="margin-bottom: 5px;">BIOME: ${focusState.currentBiome.id}</h2>
            
            <div class="progress-wrapper" style="width: 100%; margin: 12px 0; border-color: ${focusState.currentBiome.color};">
                <div class="progress-bar-container">
                    <div class="progress-fill" style="width: ${progressPct}%; background: ${focusState.currentBiome.color}; box-shadow: 0 0 10px ${focusState.currentBiome.color};"></div>
                </div>
                <div class="progress-text" style="color: ${focusState.currentBiome.color};">${focusState.campaignProgress} / 90 MIN TO APEX EVENT</div>
            </div>

            ${componentTimelineHtml}

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 15px;">
                <button type="button" class="mod-btn timer-select-btn" onclick="selectCryoTimer(15, 1.0, this)" style="padding: 12px; border-color: #555; color: #fff;">
                    <div style="font-size: 1.1rem; font-weight: bold;">15 MIN</div>
                    <div style="font-size: 0.55rem; opacity: 0.6; margin-top: 2px;">1.0x REWARDS</div>
                </button>
                <button type="button" class="mod-btn timer-select-btn" onclick="selectCryoTimer(30, 1.25, this)" style="padding: 12px; border-color: ${focusState.currentBiome.color}; color: ${focusState.currentBiome.color}; box-shadow: inset 0 0 10px ${focusState.currentBiome.color}33;">
                    <div style="font-size: 1.1rem; font-weight: bold;">30 MIN</div>
                    <div style="font-size: 0.55rem; opacity: 0.6; margin-top: 2px;">1.25x REWARDS</div>
                </button>
                <button type="button" class="mod-btn timer-select-btn" onclick="selectCryoTimer(60, 1.6, this)" style="padding: 12px; border-color: #555; color: #fff;">
                    <div style="font-size: 1.1rem; font-weight: bold;">60 MIN</div>
                    <div style="font-size: 0.55rem; opacity: 0.6; margin-top: 2px;">1.6x REWARDS</div>
                </button>
                <button type="button" class="mod-btn timer-select-btn" onclick="selectCryoTimer(90, 2.0, this)" style="padding: 12px; border-color: #555; color: #fff;">
                    <div style="font-size: 1.1rem; font-weight: bold;">90 MIN</div>
                    <div style="font-size: 0.55rem; opacity: 0.6; margin-top: 2px;">2.0x REWARDS</div>
                </button>
            </div>
            
            <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 8px;">
                <button type="button" class="success-btn" onclick="launchCryoStasis(focusState.selectedDuration, focusState.selectedMultiplier, this)" style="width: 100%; padding: 12px; background: ${focusState.currentBiome.color}; color: #000; font-weight: bold; font-size: 0.85rem; letter-spacing: 2px; border: none; box-shadow: 0 0 15px ${focusState.currentBiome.color}; cursor: pointer; border-radius: 2px;">INITIATE DESCENT</button>
                <button type="button" class="action-btn" onclick="this.closest('.modal-overlay').remove()" style="width: 100%; padding: 8px; background: transparent; border: 1px solid #555; color: #888; font-size: 0.65rem;">[ ABORT SEQUENCE ]</button>
            </div>

            <div style="margin-top:20px; padding-top:15px; border-top:1px dashed #333; font-family:monospace; text-align:left;">
                <div style="color:#ff9900; font-size:0.6rem; font-weight:bold; letter-spacing:1px; margin-bottom:8px;">[ DEV CONTROL DECK // BIOME OVERRIDE ]</div>
                <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 4px; background:rgba(0,0,0,0.4); padding:8px; border:1px solid #222;">
                    ${devButtonsHtml}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// --- [ SCREEN WAKE LOCK API ] ---
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            focusState.wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch (err) {
        console.warn('Wake Lock request denied or unsupported:', err.message);
    }
}

function releaseWakeLock() {
    if (focusState.wakeLock !== null) {
        focusState.wakeLock.release().then(() => {
            focusState.wakeLock = null;
        });
    }
}
// --------------------------------

function launchCryoStasis(minutes, multiplier, btnElement) {
    try {
        if (btnElement && btnElement.closest('.modal-overlay')) {
            btnElement.closest('.modal-overlay').remove();
        }
        focusState.isActive = true;
        focusState.sessionTotalDuration = minutes || 30; // Matches priority
        focusState.sessionMultiplier = multiplier || 1.25;
        
        const now = Date.now();
        focusState.targetStartTime = now;
        focusState.targetEndTime = now + (focusState.sessionTotalDuration * 60 * 1000); 
        focusState.timeRemaining = focusState.sessionTotalDuration * 60;  
        
        focusState.dripScrapDeposited = 0;
        focusState.sessionEnergy = 0;
        focusState.sessionScrap = 0;
        
        renderCryoUI();
        requestWakeLock(); 
        focusState.timerInterval = setInterval(cryoTick, 1000);
    } catch (error) {
        alert("CRITICAL ERROR DURING LAUNCH SEQUENCE:\n" + error.message);
    }
}



function onPomodoroComplete() {
    console.log("Mission horizon reached.");
    
    // Check if the global bracket exists before firing
    if (typeof window.triggerMinigameEncounter === 'function') {
        window.triggerMinigameEncounter();
    } else {
        console.error("Telemetry failure: triggerMinigameEncounter is missing from the global window scope.");
    }
}



function cryoTick() {
    try {
        const now = Date.now();
        const remainingMs = focusState.targetEndTime - now;
        focusState.timeRemaining = Math.max(0, Math.ceil(remainingMs / 1000));
        
        const currentTickTime = Math.min(now, focusState.targetEndTime);
        const totalDurationMs = focusState.targetEndTime - focusState.targetStartTime;
        const elapsedMs = Math.max(0, currentTickTime - focusState.targetStartTime);
        const progressRatio = totalDurationMs > 0 ? Math.min(1, elapsedMs / totalDurationMs) : 0;
        
        let energyPerUnit = 10 * focusState.sessionMultiplier;
        let scrapPerUnit = 5 * focusState.sessionMultiplier;
        if (state && state.pantheon && state.pantheon['tower_1_ascension']) { 
            scrapPerUnit = Math.floor(scrapPerUnit * 1.25); 
        }
        
        const totalSessionEnergy = energyPerUnit * focusState.sessionTotalDuration;
        const totalSessionScrap = scrapPerUnit * focusState.sessionTotalDuration;
        const absoluteDripTarget = Math.floor(totalSessionScrap * 0.2);
        const absoluteVaultTarget = totalSessionScrap - absoluteDripTarget;
        
        const currentExpectedDrip = Math.floor(absoluteDripTarget * progressRatio);
        const dripToUnload = currentExpectedDrip - focusState.dripScrapDeposited;
        
        if (dripToUnload > 0 && typeof state !== 'undefined') {
            state.scrap += dripToUnload;
            focusState.dripScrapDeposited += dripToUnload;
            if (typeof save === 'function') save();
            if (typeof updateHUD === 'function') updateHUD();
        }
        
        focusState.sessionEnergy = Math.floor(totalSessionEnergy * progressRatio);
        focusState.sessionScrap = Math.floor(absoluteVaultTarget * progressRatio);
        updateCryoReadout();
        
        const mins = Math.floor(focusState.timeRemaining / 60);
        const secs = focusState.timeRemaining % 60;
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        const clockEl = document.getElementById('cryo-clock');
        if (clockEl) clockEl.innerText = timeStr;
        
      if (focusState.timeRemaining <= 0) {
            clearInterval(focusState.timerInterval);
            focusState.isActive = false;
            
            const finishedBiome = focusState.currentBiome;
            focusState.campaignProgress += focusState.sessionTotalDuration;
            
            let isApexEvent = false;
            if (focusState.campaignProgress >= 90) {
                isApexEvent = true;
                focusState.campaignProgress = 0; 
                focusState.currentBiome = PLANET_BIOMES[Math.floor(Math.random() * PLANET_BIOMES.length)]; 
            }
            
            localStorage.setItem('campaignProgress', focusState.campaignProgress);
            localStorage.setItem('currentBiome', JSON.stringify(focusState.currentBiome));
            
            focusState.sessionEnergy = totalSessionEnergy;
            focusState.sessionScrap = absoluteVaultTarget;
            
            // SECURITY INTERCEPT FIX: Target the window global scope directly to stop it bypassing the combat window
            const launchTrigger = window.triggerMinigameEncounter || triggerMinigameEncounter;
            if (typeof launchTrigger === 'function') {
                console.log("Telemetry: Timer complete. Securely invoking global triggerMinigameEncounter.");
                launchTrigger(focusState.sessionTotalDuration, focusState.sessionMultiplier, isApexEvent, focusState.sessionEnergy, focusState.sessionScrap, finishedBiome);
            } else {
                console.warn("Telemetry Warning: Minigame trigger not found globally. Executing default resource dump.");
                if (typeof state !== 'undefined') state.scrap += focusState.sessionScrap;
                if (isApexEvent && typeof addEnergy === 'function') {
                    addEnergy(focusState.sessionEnergy);
                } else if (typeof state !== 'undefined') {
                    state.energy += focusState.sessionEnergy;
                }
                if (typeof save === 'function') save();
                if (typeof updateHUD === 'function') updateHUD();
                exitCryoMode();
            }
        }
    } catch (tickError) {
        clearInterval(focusState.timerInterval);
        alert("RUNTIME EXCEPTION DETECTED DURING CRYO TICK:\n" + tickError.message);
    }
}

function updateCryoReadout() {
    const readout = document.getElementById('cryo-readout');
    if (readout) {
        readout.innerHTML = `
            <span style="color: var(--accent); text-shadow: 0 0 5px var(--accent-glow);">ENERGY: ${focusState.sessionEnergy}</span>
            <span style="color: var(--captured); text-shadow: 0 0 5px var(--captured);">SCRAP: ${focusState.sessionScrap}</span>
        `;
    }
}

function renderCryoUI() {
    try {
        const container = document.createElement('div');
        container.id = 'cryo-mode-container';
        container.className = 'warp-transition';
        container.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            background: ${focusState.currentBiome.bg}; 
            z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center;
            overflow: hidden;
        `;
        
        const surface = document.createElement('div');
        surface.style.cssText = `
            position: absolute; top: -100%; left: 0; width: 100%; height: 200%;
            background-image: linear-gradient(transparent 50%, ${focusState.currentBiome.color}22 50%);
            background-size: 100% 40px;
            animation: surface-scroll 2s linear infinite;
            z-index: 1;
        `;
        
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes surface-scroll { 0% { transform: translateY(0); } 100% { transform: translateY(40px); } }
            .cryo-hud { z-index: 10; position: relative; text-align: center; }
        `;
        container.appendChild(style);
        container.appendChild(surface);
        
        const shipWrapper = document.createElement('div');
        shipWrapper.style.cssText = `position: absolute; bottom: 15%; width: 140px; height: 140px; z-index: 5; filter: drop-shadow(0 0 20px ${focusState.currentBiome.color}); pointer-events: none;`;
        if (typeof drawModularShip === 'function' && typeof state !== 'undefined' && state.shipParts) {
            drawModularShip(shipWrapper, state.shipParts);
        }
        container.appendChild(shipWrapper);
        
        const durationStr = (focusState.sessionTotalDuration || 30).toString().padStart(2, '0');
        
        container.insertAdjacentHTML('beforeend', `
            <div class="cryo-hud">
                <div style="font-size: 0.75rem; letter-spacing: 4px; color: ${focusState.currentBiome.color}; margin-bottom: 10px; font-weight: bold; text-shadow: 0 0 10px ${focusState.currentBiome.color};">CRYO-STASIS ACTIVE</div>
                
                <div id="cryo-clock" style="font-size: 4.5rem; font-weight: bold; font-family: monospace; color: #fff; text-shadow: 0 0 20px ${focusState.currentBiome.color}; margin: 10px 0; cursor:pointer;" title="DEBUG: Click Clock to Force Finish!" onclick="focusState.targetEndTime = Date.now();">
                    ${durationStr}:00
                </div>
                
                <div id="cryo-readout" style="margin-top: 20px; font-size: 0.8rem; font-weight: bold; display: flex; gap: 20px; justify-content: center; background: rgba(0,0,0,0.5); padding: 10px 20px; border-radius: 4px; border: 1px solid ${focusState.currentBiome.color}44;">
                    <span style="color: var(--accent);">ENERGY: 0</span>
                    <span style="color: var(--captured);">SCRAP: 0</span>
                </div>
                
                <div style="margin-top: 40px; display:flex; flex-direction:column; gap:10px; align-items:center;">
                    <button type="button" onclick="focusState.targetEndTime = Date.now();" style="background:rgba(255,153,0,0.2); border:1px solid #ff9900; color:#ff9900; padding:6px 12px; font-size:0.55rem; letter-spacing:1px; cursor:pointer; font-family:monospace;">[ DEBUG INSTANT JUMP TO BREAK ]</button>
                    <button type="button" onclick="abortCryoStasis()" style="background: rgba(0,0,0,0.8); border: 1px solid #555; color: #888; padding: 6px 12px; font-size: 0.55rem; letter-spacing: 1px; cursor: pointer;">[ EMERGENCY THAW ]</button>
                </div>
            </div>
        `);

        const powerMode = localStorage.getItem('cryoScreenMode') || 'BRIGHT';
        if (powerMode === 'DIM') {
            const dimmer = document.createElement('div');
            dimmer.id = 'cryo-oled-dimmer';
            dimmer.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #000000; z-index: 2; opacity: 0; transition: opacity 3s ease; pointer-events: none;';
            
            const hint = document.createElement('div');
            hint.innerText = "TAP SCREEN TO WAKE";
            hint.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #444; font-family: monospace; font-size: 0.8rem; letter-spacing: 2px; text-align: center;';
            dimmer.appendChild(hint);
            
            container.appendChild(dimmer);
            
            let idleTimeout;
            const resetIdle = () => {
                dimmer.style.opacity = '0';
                clearTimeout(idleTimeout);
                idleTimeout = setTimeout(() => { dimmer.style.opacity = '0.98'; }, 8000); 
            };
            
            container.addEventListener('touchstart', resetIdle, {passive: true});
            container.addEventListener('mousemove', resetIdle, {passive: true});
            resetIdle();
        }

        document.body.appendChild(container);
    } catch (renderError) {
        alert("CRITICAL EXCEPTION IN RENDER CRYO UI BLOCK:\\n" + renderError.message);
    }
}

function abortCryoStasis() {
    if(confirm("INITIATE EMERGENCY THAW?\\n\\nYou will wake up early. All Energy and Scrap gathered this session will be lost.")) {
        clearInterval(focusState.timerInterval);
        focusState.isActive = false;
        exitCryoMode();
    }
}

function exitCryoMode() {
    releaseWakeLock(); 
    const container = document.getElementById('cryo-mode-container');
    if (container) container.remove();
}
