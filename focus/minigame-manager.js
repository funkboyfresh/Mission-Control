/**
 * MINIGAME-MANAGER.JS [ PATCH V15.0 — MILESTONE PROGRESSION NETWORK ]
 * Integrates space-age vector progress lines with dedicated milestone icons:
 * 30 Min (Preparing), 60 Min (Descending), and 90 Min (Extraction).
 * Maintains cumulative tracking handles, juice impacts, and Phase 3 boss decorators.
 */

let minigameManager = {
    isActive: false,
    timer: 30,
    timerInterval: null,
    
    // Unified Session Exchange Metrics
    baseScrapPayload: 0,
    bonusScrapEarned: 0,
    ammoPool: 0,
    biome: null,
    isApexEvent: false,
    
    // Multi-Wave Scaling Parameters
    currentPhase: 1,
    bossSpawned: false,
    
    // Juicy Audio-Visual Dynamics
    shakeFrames: 0,
    flashOpacity: 0,
    flashColor: "#ffffff",
    
    // Environmental Hazard Entities Array
    hazards: [],
    
    // Campaign Stat Modifiers
    campaignUpgradeBonus: 1.0,
    
    // Narrative Tracking Keys
    activeCampaign: null,
    activeGame: null,
    gameTitle: "TACTICAL ASSIGNMENT PROFILE"
};

// --- [ NARRATIVE CAMPAIGN ARCHIVE — LAZY ARROW GETTERS ] ---
const CAMPAIGN_DATABANK = [
    {
        id: "VANGUARD_LINEBREAKER",
        title: "OPERATION: VANGUARD LINEBREAKER",
        biomes: ["CYBER", "FERROUS", "PLASMA", "VOID"],
        getPrep: () => (typeof tacticalDraft !== 'undefined') ? tacticalDraft : null,
        prepTitle: "TACTICAL DRONE SQUADRON DRAFT",
        getCombat: () => (typeof verticalShmup !== 'undefined') ? verticalShmup : null,
        combatTitle: "VERTICAL CORRIDOR BREAKTHROUGH",
        intel: "Draft an autonomous defensive drone wing to protect your fuselage core during the upcoming high-velocity vertical breach run."
    },
    {
        id: "THERMAL_OVERLOAD",
        title: "OPERATION: THERMAL OVERLOAD PROTOCOL",
        biomes: ["CYBER", "PLASMA", "FERROUS"],
        getPrep: () => (typeof singularityForge !== 'undefined') ? singularityForge : null,
        prepTitle: "REACTOR COOLANT RHYTHM CALIBRATION",
        getCombat: () => (typeof voidBlade !== 'undefined') ? voidBlade : null,
        combatTitle: "HIGH-FREQUENCY PLASMATIC ENERGY SLICER",
        intel: "Calibrate localized reactor cycles to stabilize structural lines, allowing you to manually slice and harvest volatile cargo matrix grids."
    },
    {
        id: "DEEP_CORE_SIPHON",
        title: "OPERATION: DEEP-CORE SIPHON",
        biomes: ["MAGMA", "TOXIC", "FALLOUT", "DUNE"],
        getPrep: () => (typeof voidHarpoon !== 'undefined') ? voidHarpoon : null,
        prepTitle: "CORE CURRENT VACUUM HARPOON EXTRACTION",
        getCombat: () => (typeof supernovaEscape !== 'undefined') ? supernovaEscape : null,
        combatTitle: "SUPERNOVA ATMOSPHERIC ESCAPE FLIGHT",
        intel: "Lower heavy vacuum cords to siphon fuel capacitance units, supercharging engine lines to plow through oncoming planetary debris waves."
    },
    {
        id: "SIEGE_FLAGSHIP",
        title: "OPERATION: CAPITAL SIEGE STRIKE",
        biomes: ["TOXIC", "FALLOUT", "ICE", "DUNE", "MAGMA"],
        getPrep: () => (typeof railgunAssassin !== 'undefined') ? railgunAssassin : null,
        prepTitle: "SLOW-MOTION TRAJECTORY SENSOR ASSASSIN",
        getCombat: () => (typeof dreadnoughtArtillery !== 'undefined') ? dreadnoughtArtillery : null,
        combatTitle: "BALLISTIC PARABOLIC ARTILLERY MORTAR STRIKE",
        intel: "Neutralize planetary lookout sensors in slow motion to scramble outer tracking arrays, leaving enemy capital hulls vulnerable to mortar shells."
    },
    {
        id: "SINGULARITY_CONTAINMENT",
        title: "OPERATION: SINGULARITY CONTAINMENT",
        biomes: ["VOID", "CRYSTAL", "ECLIPSE", "ABYSSAL", "SPORE"],
        getPrep: () => (typeof crystalMatrix !== 'undefined') ? crystalMatrix : null,
        prepTitle: "CRYSTAL DAMPENER RE-ALIGNMENT CONFIGURATION",
        getCombat: () => (typeof singularitySwell !== 'undefined') ? singularitySwell : null,
        combatTitle: "SINGULARITY CORE DEBRIS CONSUMPTION RUN",
        intel: "Align structural crystal grids to generate an insulating shield barrier before releasing a mini-black hole gravity collection core."
    },
{
        id: "CHRONO_HORIZON",
        title: "OPERATION: CHRONOMETRIC TIMELINE BREACH",
        biomes: ["CHRONOS", "ECLIPSE", "VOID", "ICE"],
        getPrep: () => (typeof chronoStabilizer !== 'undefined') ? chronoStabilizer : null, // PURGED OVERLAP
        prepTitle: "CHRONO DIAL SYSTEM TIMELINE STABILIZER",                              // Bespoke Title
        getCombat: () => (typeof slipstreamRun !== 'undefined') ? slipstreamRun : null,
        combatTitle: "SLIPSTREAM PSEUDO-3D CORRIDOR TUNNEL RUN",
        intel: "Weld drifting space-time fractures onto the orbital clock gauge axis to align temporal anchor points, preparing slipstream engines for the wormhole runner."
    },
    {
        id: "SOLAR_SURF_RUN",
        title: "OPERATION: SOLAR FLARE RADIAL RIDER",
        biomes: ["MAGMA", "FERROUS", "DUNE"],
        getPrep: () => (typeof solarCollector !== 'undefined') ? solarCollector : null,
        prepTitle: "SOLAR FLARE CORONA ION SIPHON",
        getCombat: () => (typeof solarSurf !== 'undefined') ? solarSurf : null,
        combatTitle: "SOLAR FLARE WAVE-RIDOR MOMENTUM SURFER",
        intel: "Deploy linear siphon collection grids to harvest raw voltage particle spikes, charging engine batteries to surf solar flare valleys."
    },
    {
        id: "ORBITAL_WRECKER",
        title: "OPERATION: PHYSICAL FLAIL DEFENSE",
        biomes: ["ABYSSAL", "SPORE", "VOID", "TOXIC"],
        getPrep: () => (typeof magneticCoupler !== 'undefined') ? magneticCoupler : null,
        prepTitle: "MAGNETIZED FLAIL CHORD COUPLER MATRIX",
        getCombat: () => (typeof orbitalFlail !== 'undefined') ? orbitalFlail : null,
        combatTitle: "CENTRIFUGAL PHYSICS TETHER WRECKING ORB",
        intel: "Calibrate and interlock rotating axis link joints vertically to stack high-density mass onto your centrifugal kinetic chord flail."
    },
    {
        id: "COMPRESSION_DETONATION",
        title: "OPERATION: RADIAL BLAST DECOMPRESSION",
        biomes: ["VOID", "PLASMA", "CYBER", "CHRONOS"],
        getPrep: () => (typeof coreCharger !== 'undefined') ? coreCharger : null,
        prepTitle: "SINGULARITY PRESSURE CORE VALVE CHARGER",
        getCombat: () => (typeof compressionPulse !== 'undefined') ? compressionPulse : null,
        combatTitle: "360-DEGREE RADIAL PULSE COMPRESSION BLOW",
        intel: "Calibrate expanding containment wavelengths exactly within boundary limits to condense a micro-singularity containment shell."
    },
    {
        id: "PLASMA_RAIL_GRIND",
        title: "OPERATION: NEON PROXIMITY GRINDER",
        biomes: ["CYBER", "PLASMA", "FERROUS", "CRYSTAL"],
        getPrep: () => (typeof trackWelder !== 'undefined') ? trackWelder : null,
        prepTitle: "MAG-RAIL TRACK CROSSHAIR LASER WELDER",
        getCombat: () => (typeof railGrider !== 'undefined') ? railGrider : null,
        combatTitle: "MAGNETIZED RAIL PROXIMITY SURFER EXTRACTION",
        intel: "Fire high-frequency plasma welder arcs strictly through fractured rail joints to patch structural lines for high-speed surfing runs."
    },
    {
        id: "PLASMATIC_RAM",
        title: "OPERATION: HEAVY HULL PLASMATIC RAMMER",
        biomes: ["TOXIC", "MAGMA", "FALLOUT", "FERROUS"],
        getPrep: () => (typeof shieldForge !== 'undefined') ? shieldForge : null,
        prepTitle: "WEDGE PLATING SHIELD PLATES COMPONENT FORGE",
        getCombat: () => (typeof plasmaticRammer !== 'undefined') ? plasmaticRammer : null,
        combatTitle: "PLASMA WEDGE SHIELD DEMOLITION BASHER",
        intel: "Weld high-density tungsten-plasma tile sheets squarely onto your nose matrix mold to forge an armor barrier capable of ramming enemy hull blocks."
    },
    {
        id: "CASCADE_REACTION",
        title: "OPERATION: FUSION SHOCKWAVE CASCADE",
        biomes: ["PLASMA", "CYBER", "CRYSTAL", "ECLIPSE"],
        getPrep: () => (typeof resonanceLinker !== 'undefined') ? resonanceLinker : null,
        prepTitle: "RADAR RESONANCE LINK RANGE INTERFACE",
        getCombat: () => (typeof fusionCascade !== 'undefined') ? fusionCascade : null,
        combatTitle: "FUSION SPIKE CHAIN EXPLOSION ENVELOPE",
        intel: "Lock floating terminal core pins with a 360° sweeping laser arm to bridge conduit fields, directly increasing your cascade shockwave radii fields."
    },
    {
        id: "SINGULARITY_SLING",
        title: "OPERATION: SINGLE-POINT SINGULARITY TETHER",
        biomes: ["CHRONOS", "VOID", "ICE", "DUNE"],
        getPrep: () => (typeof anchorCalibrator !== 'undefined') ? anchorCalibrator : null,
        prepTitle: "ANCHOR FREQUENCY METER GAUGE CALIBRATOR",
        getCombat: () => (typeof singularityTether !== 'undefined') ? singularityTether : null,
        combatTitle: "WEIGHTLESS ORBIT SLINGSHOT ESCAPE CORRIDOR",
        intel: "Freeze the sonar dial pointer dead on center alignment targets to lock tracking codes, giving you path trajectories for your orbital swing lines."
    },
    {
        id: "CHRONO_GAIN_SLICER",
        title: "OPERATION: CHRONOMETRIC WARP SLICER",
        biomes: ["CYBER", "CHRONOS", "ECLIPSE", "PLASMA"],
        getPrep: () => (typeof tachyonMapper !== 'undefined') ? tachyonMapper : null,
        prepTitle: "BINARY PACKET MATRIX TACHYON MAPPER",
        getCombat: () => (typeof chronoDash !== 'undefined') ? chronoDash : null,
        combatTitle: "BLINK-WARP DILATED TRAJECTORY FLEET BISECTOR",
        intel: "Sort incoming tachyon packets strictly in chronological ascending sequence numbers to expand your blink warp targeting line length limits."
    },
    {
        id: "SWARM_ANALYSIS",
        title: "OPERATION: SWARM CORE DECRYPTION",
        biomes: ["VOID", "ABYSSAL", "SPORE"],
        getPrep: () => (typeof swarmAnalyzer !== 'undefined') ? swarmAnalyzer : null,
        prepTitle: "TELEMETRY WAVELENGTH DATA ANALYZER",
        getCombat: () => (typeof voidSwarm !== 'undefined') ? voidSwarm : null,
        combatTitle: "VOID SWARM CORRIDOR RESISTANCE SQUADRON",
        intel: "Intercept and capture wave frequency data spikes at their peaks to extract operational weaknesses before fighting the swarm."
    },
    {
        id: "CRYOGENIC_BREACH",
        title: "OPERATION: CRYOGENIC SHIELD BREAK",
        biomes: ["ICE", "VOID", "ABYSSAL"],
        getPrep: () => (typeof pressureVent !== 'undefined') ? pressureVent : null,
        prepTitle: "CORE GAUGE PRESSURE RE-BALANCER VENT",
        getCombat: () => (typeof iceLeviathan !== 'undefined') ? iceLeviathan : null,
        combatTitle: "LEVIATHAN PHYSICAL GRAVITY WELL LAUNCHER",
        intel: "Discharge volatile core pressure cylinders within strict gauge boundaries to authorize heavy gravity key matrix launchers."
    },
    {
        id: "GRID_OUROBOROS",
        title: "OPERATION: KINEMATIC ARENA EXTRACTION",
        biomes: ["SPORE", "ABYSSAL", "CYBER"],
        getPrep: () => (typeof nodeCompiler !== 'undefined') ? nodeCompiler : null,
        prepTitle: "CONCENTRIC SYSTEM LATTICE LINK COMPILER",
        getCombat: () => (typeof ouroborosSweep !== 'undefined') ? ouroborosSweep : null,
        combatTitle: "OUROBOROS KINEMATIC ENERGY TAIL ARENA",
        intel: "Compress shrink rings flush over lattice nodes to compile link data lines, increasing processing lengths for the sweep field."
    },
    {
        id: "MAGNETIC_BOUNCE",
        title: "OPERATION: KINEMATIC BUMPER RECHARGE",
        biomes: ["FERROUS", "CRYSTAL", "DUNE"],
        getPrep: () => (typeof orbitalDefense !== 'undefined') ? orbitalDefense : null,
        prepTitle: "ORBITAL DEFENSE SATELLITE PLACEMENT DOME",
        getCombat: () => (typeof cosmicRicochet !== 'undefined') ? cosmicRicochet : null,
        combatTitle: "COSMIC RICOCHET HIGH-VELOCITY SPACE PINBALL",
        intel: "Deploy automated satellite rings to defend and power up outer bumper structures before slingshotting your ship core into them."
    },
    {
        id: "SLIPSTREAM_SHIELD",
        title: "OPERATION: SLIPSTREAM FREQUENCY EXTRACTION",
        biomes: ["VOID", "PLASMA", "CHRONOS", "ECLIPSE"],
        getPrep: () => (typeof aegisDeflector !== 'undefined') ? aegisDeflector : null,
        prepTitle: "AEGIS PERIMETER DEFLECTOR CALIBRATOR",
        getCombat: () => (typeof slipstreamGrapple !== 'undefined') ? slipstreamGrapple : null,
        combatTitle: "SLIPSTREAM SLINGSHOT ORBITAL GRAPPLE HOOK RUNNER",
        intel: "Rotate your Aegis shield circularly to deflect inbound laser arrays, mapping tractor markers to latch and grapple through the wormhole."
    }
];

function triggerMinigameEncounter(duration, multiplier, isApex, energy, scrap, biomeOverride) {
    if (typeof exitCryoMode === 'function') exitCryoMode(); 
    
    const sessionMins = duration || 30;
    
    minigameManager.isActive = false;
    minigameManager.isApexEvent = (sessionMins >= 90 || isApex === true);
    minigameManager.timer = minigameManager.isApexEvent ? 90 : 30;
    minigameManager.ammoPool = energy || 100;
    minigameManager.baseScrapPayload = scrap || 0;
    minigameManager.bonusScrapEarned = 0;
    minigameManager.currentPhase = 1;
    minigameManager.bossSpawned = false;
    
    minigameManager.shakeFrames = 0;
    minigameManager.flashOpacity = 0;
    minigameManager.hazards = [];
    
    minigameManager.biome = biomeOverride || ((typeof focusState !== 'undefined' && focusState.currentBiome) ? focusState.currentBiome : { id: 'VOID', color: '#a200ff', bg: 'radial-gradient(circle at bottom, #1a0033 0%, #000000 80%)' });
    const bid = minigameManager.biome.id;

    const storageKey = `active_campaign_track_${bid}`;
    let savedCampaignId = localStorage.getItem(storageKey);
    let matchedTracks = CAMPAIGN_DATABANK.filter(c => c.biomes.includes(bid));
    
    if (matchedTracks.length === 0) matchedTracks = [CAMPAIGN_DATABANK[0]];
    
    let activeOp = matchedTracks.find(c => c.id === savedCampaignId);
    if (!activeOp) {
        const rolledIndex = Math.floor(Math.random() * matchedTracks.length);
        activeOp = matchedTracks[rolledIndex];
        localStorage.setItem(storageKey, activeOp.id);
    }
    minigameManager.activeCampaign = activeOp;

    let isCombatMode = (sessionMins >= 60 || minigameManager.isApexEvent || (typeof focusState !== 'undefined' && focusState.campaignProgress >= 60));
    let targetGameInstance = isCombatMode ? activeOp.getCombat() : activeOp.getPrep();
    let targetGameTitle = isCombatMode ? activeOp.combatTitle : activeOp.prepTitle;

    if (isCombatMode) {
        let cachedBonusScrap = parseFloat(localStorage.getItem(`campaign_upgrade_scrap_${bid}`) || 0);
        minigameManager.campaignUpgradeBonus = 1.0 + (cachedBonusScrap / 350.0);
        minigameManager.ammoPool = Math.ceil(minigameManager.ammoPool * minigameManager.campaignUpgradeBonus);
        
        if (minigameManager.isApexEvent) {
            targetGameTitle = `APEX SHOWDOWN: ${activeOp.combatTitle}`;
        }
    } else {
        minigameManager.campaignUpgradeBonus = 1.0;
    }

    if (targetGameInstance !== null && typeof targetGameInstance !== 'undefined') {
        minigameManager.activeGame = targetGameInstance;
        minigameManager.gameTitle = targetGameTitle;
    } else {
        console.warn(`Campaign Getter Resolution Failed. Falling back to default swarm engine loop.`);
        minigameManager.activeGame = (typeof voidSwarm !== 'undefined') ? voidSwarm : null;
        minigameManager.gameTitle = "VOID SWARM CORRIDOR ATTACK";
    }

    // --- [ MASTER ASYMMETRIC MILESTONE CALCULATOR ] ---
    let progressVal = (typeof focusState !== 'undefined') ? focusState.campaignProgress : sessionMins;
    if (minigameManager.isApexEvent) progressVal = 90;
    
    let is30Lit = progressVal >= 30;
    let is60Lit = progressVal >= 60;
    let is90Lit = progressVal >= 90;
    let filledBarWidth = is90Lit ? 100 : (is60Lit ? 50 : 0);

    // High-tech shared timeline tracking component layout string
    const componentTimelineHtml = `
        <div style="margin: 18px 0; font-family: monospace; text-align: left;">
            <div style="font-size: 0.55rem; color: #666; letter-spacing: 2px; margin-bottom: 8px; text-transform: uppercase; font-weight: bold;">CAMPAIGN EXTRACTION TRACKER</div>
            <div style="position: relative; display: flex; justify-content: space-between; align-items: center; padding: 12px 10px; background: rgba(255,255,255,0.02); border: 1px solid #111; border-radius: 4px;">
                <div style="position: absolute; top: 50%; left: 40px; right: 40px; height: 2px; background: #1a1a1a; transform: translateY(-50%); z-index: 1;"></div>
                <div style="position: absolute; top: 50%; left: 40px; width: calc(${filledBarWidth}% - ${filledBarWidth === 100 ? '80px' : filledBarWidth === 50 ? '40px' : '0px'}); height: 2px; background: ${minigameManager.biome.color}; transform: translateY(-50%); z-index: 2; transition: width 0.4s ease;"></div>
                
                <div style="position: relative; z-index: 3; display: flex; flex-direction: column; align-items: center; width: 65px;">
                    <div style="width: 26px; height: 26px; border-radius: 50%; background: ${is30Lit ? '#000' : '#111'}; border: 2px solid ${is30Lit ? minigameManager.biome.color : '#333'}; display: flex; align-items: center; justify-content: center; color: ${is30Lit ? '#fff' : '#555'}; box-shadow: ${is30Lit ? '0 0 10px ' + minigameManager.biome.color + '44' : 'none'}; transition: all 0.3s;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                    </div>
                    <span style="font-size: 0.5rem; font-weight: bold; color: ${is30Lit ? '#fff' : '#444'}; margin-top: 5px; letter-spacing: 1px;">PREPARING</span>
                    <span style="font-size: 0.45rem; color: #666;">30M</span>
                </div>

                <div style="position: relative; z-index: 3; display: flex; flex-direction: column; align-items: center; width: 65px;">
                    <div style="width: 26px; height: 26px; border-radius: 50%; background: ${is60Lit ? '#000' : '#111'}; border: 2px solid ${is60Lit ? minigameManager.biome.color : '#333'}; display: flex; align-items: center; justify-content: center; color: ${is60Lit ? '#fff' : '#555'}; box-shadow: ${is60Lit ? '0 0 10px ' + minigameManager.biome.color + '44' : 'none'}; transition: all 0.3s;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                    </div>
                    <span style="font-size: 0.5rem; font-weight: bold; color: ${is60Lit ? '#fff' : '#444'}; margin-top: 5px; letter-spacing: 1px;">DESCENDING</span>
                    <span style="font-size: 0.45rem; color: #666;">60M</span>
                </div>

                <div style="position: relative; z-index: 3; display: flex; flex-direction: column; align-items: center; width: 65px;">
                    <div style="width: 26px; height: 26px; border-radius: 50%; background: ${is90Lit ? '#000' : '#111'}; border: 2px solid ${is90Lit ? minigameManager.biome.color : '#333'}; display: flex; align-items: center; justify-content: center; color: ${is90Lit ? '#fff' : '#555'}; box-shadow: ${is90Lit ? '0 0 10px ' + minigameManager.biome.color + '44' : 'none'}; transition: all 0.3s;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18h10M5 14h14M12 2v12M12 14l4-4M12 14L8 10"/></svg>
                    </div>
                    <span style="font-size: 0.5rem; font-weight: bold; color: ${is90Lit ? '#fff' : '#444'}; margin-top: 5px; letter-spacing: 1px;">EXTRACTION</span>
                    <span style="font-size: 0.45rem; color: #666;">90M</span>
                </div>
            </div>
        </div>
    `;

    // --- [ RENDER WORKSPACE CONTAINERS PANEL PANELS ] ---
    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'minigame-viewport';
    canvasContainer.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: ${minigameManager.biome.bg}; z-index: 10000; overflow: hidden;
        display: flex; flex-direction: column; user-select: none; -webkit-user-select: none;
    `;
    
    canvasContainer.innerHTML = `
        <div id="minigame-top-hud" style="position: absolute; top: 20px; left: 20px; right: 20px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 10005; font-family: monospace; opacity: 0.3; transition: opacity 0.5s;">
            <div>
                <div style="color: ${minigameManager.biome.color}; font-size: 0.6rem; letter-spacing: 3px; font-weight: bold; text-transform: uppercase; margin-bottom: 2px;">
                    ${activeOp.title}
                </div>
                <div id="game-phase-indicator" style="color: #888; font-size: 0.55rem; letter-spacing: 1px; text-transform: uppercase;">
                    ${minigameManager.isApexEvent ? 'GAUNTLET INTRUSION // PHASE 1/3' : 'TACTICAL DECK LINKED'}
                </div>
                <div style="font-size: 1.3rem; font-weight: bold; color: #fff; margin-top: 5px; text-shadow: 0 0 10px ${minigameManager.biome.color};">
                    ${minigameManager.gameTitle}
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.55rem; color: #888; letter-spacing: 1px;">RETRIEVAL WINDOW</div>
                <div id="game-clock" style="font-size: 2.3rem; font-weight: bold; color: #fff; text-shadow: 0 0 15px #ff3366;">${minigameManager.timer}s</div>
            </div>
        </div>

        <div id="minigame-live-tracker-overlay" style="position: absolute; top: 90px; left: 20px; width: 280px; pointer-events: none; z-index: 10005; opacity: 0; transition: opacity 0.5s;">
            ${componentTimelineHtml}
        </div>

        <div id="minigame-bottom-hud" style="position: absolute; bottom: 20px; left: 20px; right: 20px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; z-index: 10005; font-family: monospace; background: rgba(0,0,0,0.6); padding: 12px 20px; border-radius: 4px; border: 1px solid ${minigameManager.biome.color}33; opacity: 0.3; transition: opacity 0.5s;">
            <div style="display: flex; gap: 30px;">
                <div>
                    <span style="font-size: 0.6rem; color: #aaa; display:block;">ENERGY AMMO</span>
                    <span id="game-hud-ammo" style="font-size: 1.2rem; font-weight: bold; color: var(--accent); text-shadow: 0 0 5px var(--accent-glow);">${minigameManager.ammoPool}</span>
                </div>
                <div>
                    <span style="font-size: 0.6rem; color: #aaa; display:block;">CARGO RETRIEVED</span>
                    <span id="game-hud-scrap" style="font-size: 1.2rem; font-weight: bold; color: var(--captured); text-shadow: 0 0 5px var(--captured);">+0 SCRAP</span>
                </div>
            </div>
            <div id="game-instructions-text" style="font-size: 0.6rem; color: #666; letter-spacing: 1px;">CONNECTING TERMINAL DISPLAY CHANNELS...</div>
        </div>

        <div id="minigame-ready-menu" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; z-index: 10008; background: rgba(0,0,5,0.7); font-family: monospace;">
            <div class="modal-content" style="border: 1px solid ${minigameManager.biome.color}; background: #000; padding: 30px; width: 90%; max-width: 440px; text-align: center; box-shadow: 0 0 40px ${minigameManager.biome.color}44; border-radius: 4px;">
                <div style="color: ${minigameManager.biome.color}; font-size: 0.65rem; letter-spacing: 4px; font-weight: bold; margin-bottom: 5px;">COMMAND PROTOCOL DATA LOG</div>
                <h2 style="font-size: 1.15rem; color: #fff; margin: 0 0 15px 0; letter-spacing: 1px;">${minigameManager.gameTitle}</h2>
                
                ${componentTimelineHtml}

                <div class="terminal-console" style="text-align: left; padding: 15px; border-color: ${minigameManager.biome.color}33; background: rgba(0,0,0,0.5); margin-bottom: 20px; line-height: 1.6; font-size: 0.75rem; color: #bbb;">
                    <div>> EXPLORATION TARGET: <span style="color:${minigameManager.biome.color}; font-weight:bold;">${minigameManager.biome.id} RECOVERY</span></div>
                    <div style="margin: 6px 0; color: #fff; font-weight: bold;">> OPERATION INTELLIGENCE READOUT:</div>
                    <div style="color: #aaa; font-size: 0.7rem; padding-left: 10px; margin-bottom: 8px; line-height: 1.45;">"${activeOp.intel}"</div>
                    <div style="border-top: 1px dashed #333; padding-top: 8px; font-size:0.7rem; color:#888;">
                        ${isCombatMode ? `> HISTORICAL PERFORMANCE FEEDBACK: <span style="color:#00ffaa; font-weight:bold;">+${Math.ceil((minigameManager.campaignUpgradeBonus-1)*100)}% INITIAL ENERGY</span>` : `> ENCOUNTER CONTEXT: SECURE SCRAP METRICS TO PIPELINE SUBSEQUENT EXTRACTION BONUS VALUES`}
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button type="button" onclick="startMinigameCombat()" style="width: 100%; padding: 13px; background: ${minigameManager.biome.color}; color: #000; font-weight: bold; border: none; font-size: 0.85rem; letter-spacing: 2px; box-shadow: 0 0 15px ${minigameManager.biome.color}; cursor: pointer; border-radius: 2px;">
                        LAUNCH DEPLOYMENT RUN
                    </button>
                    <button type="button" onclick="minigameManager.rerollCampaignTrack(${sessionMins})" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.02); border: 1px dashed #444; color: #aaa; font-size: 0.75rem; cursor: pointer; border-radius: 2px;">
                        ⚠️ RE-SCAN SECTOR (REROLL STRATEGIC OP)
                    </button>
                    <button type="button" onclick="executeAutopilotRetreat()" style="width: 100%; padding: 10px; background: transparent; border: 1px solid #333; color: #888; font-size: 0.75rem; cursor: pointer; border-radius: 2px;">
                        AUTOPILOT COURIER JUMP (60% YIELD)
                    </button>
                </div>
            </div>
        </div>

        <canvas id="minigame-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
    `;
    
    document.body.appendChild(canvasContainer);
}

minigameManager.rerollCampaignTrack = function(targetMins) {
    localStorage.removeItem(`active_campaign_track_${this.biome.id}`);
    const viewport = document.getElementById('minigame-viewport');
    if (viewport) viewport.remove();
    triggerMinigameEncounter(targetMins, 1, this.isApexEvent, this.ammoPool, this.baseScrapPayload, this.biome);
};

minigameManager.triggerScreenImpact = function(frames, color) {
    this.shakeFrames = frames || 8;
    this.flashOpacity = 0.45;
    this.flashColor = color || "#ffffff";
};

/**
 * STARTMINIGAMECOMBAT — HARDENED LAUNCH PROTOCOL
 * Initializes the game viewport, forces canvas synchronization, and injects 
 * physics/rendering interceptors for visual juice and hazard handling.
 */
window.startMinigameCombat = function() {
    console.log("Telemetry: Launching combat sequence...");
    
    // Remove UI menu overlay
    const readyMenu = document.getElementById('minigame-ready-menu');
    if (readyMenu) readyMenu.remove();
    
    // Transition HUD state
    const topHud = document.getElementById('minigame-top-hud');
    const bottomHud = document.getElementById('minigame-bottom-hud');
    const liveTracker = document.getElementById('minigame-live-tracker-overlay');
    
    if (topHud) topHud.style.opacity = "1";
    if (bottomHud) bottomHud.style.opacity = "1";
    if (liveTracker) liveTracker.style.opacity = "0.25";
    
    minigameManager.isActive = true;
    const canvas = document.getElementById('minigame-canvas');
    const ctx = canvas.getContext('2d');

    // Robust Initialization Gate: Verify game existence
    if (!minigameManager.activeGame) {
        console.error("CRITICAL ERROR: activeGame is null/undefined. Campaign getter resolution failed.");
        return;
    }

    // Force canvas synchronization before engine init
    if (typeof minigameManager.activeGame.resizeCanvas === 'function') {
        minigameManager.activeGame.resizeCanvas();
    }

    // Initialize the engine
    try {
        minigameManager.activeGame.init(canvas, ctx, minigameManager.biome, minigameManager.isApexEvent, minigameManager.ammoPool);
        console.log("Telemetry: Engine initialized successfully.");
    } catch (e) {
        console.error("Engine Initialization Exception:", e);
        return;
    }
    
    let lastScrapCount = 0;

    // Decorate Physics Update Loop (Hazard handling, impacts)
    if (minigameManager.activeGame && minigameManager.activeGame.updatePhysics) {
        const originalUpdate = minigameManager.activeGame.updatePhysics;
        
        minigameManager.activeGame.updatePhysics = function() {
            originalUpdate.call(minigameManager.activeGame);
            
            // Check for Scrap Updates and trigger juice
            let currentScrap = minigameManager.activeGame.bonusScrapEarned || 0;
            if (currentScrap > lastScrapCount) {
                minigameManager.triggerScreenImpact(10, minigameManager.biome.color);
                lastScrapCount = currentScrap;
            }
            
            // Environmental Hazard Injection (Biome specific)
            const bid = minigameManager.biome.id;
            if (minigameManager.isActive && minigameManager.frameCount % 50 === 0 && (bid === 'ICE' || bid === 'TOXIC' || bid === 'FALLOUT')) {
                minigameManager.hazards.push({
                    x: Math.random() * canvas.width,
                    y: -10,
                    speed: Math.random() * 2 + 2,
                    size: bid === 'ICE' ? 14 : 8
                });
            }
            
            // Hazard collision and management
            for (let i = minigameManager.hazards.length - 1; i >= 0; i--) {
                let haz = minigameManager.hazards[i];
                haz.y += haz.speed;
                
                if (minigameManager.activeGame.player) {
                    let px = minigameManager.activeGame.player.x || canvas.width/2;
                    let py = minigameManager.activeGame.player.y || canvas.height/2;
                    
                    if (Math.hypot(haz.x - px, haz.y - py) < (haz.size + 15)) {
                        if (minigameManager.activeGame.ammoPool > 5) minigameManager.activeGame.ammoPool -= 5;
                        minigameManager.ammoPool = minigameManager.activeGame.ammoPool;
                        
                        const hudAmmo = document.getElementById('game-hud-ammo');
                        if (hudAmmo) hudAmmo.innerText = minigameManager.ammoPool;
                        
                        minigameManager.triggerScreenImpact(14, "#ff3333");
                        minigameManager.hazards.splice(i, 1);
                        continue;
                    }
                }
                if (haz.y > canvas.height + 20) minigameManager.hazards.splice(i, 1);
            }
        };
    }

    // Decorate Draw Scene for visual effects
    if (minigameManager.activeGame && minigameManager.activeGame.drawScene) {
        const originalDraw = minigameManager.activeGame.drawScene;
        
        minigameManager.activeGame.drawScene = function() {
            ctx.save();
            
            // Apply screen shake
            if (minigameManager.shakeFrames > 0) {
                let dx = (Math.random() - 0.5) * 9;
                let dy = (Math.random() - 0.5) * 9;
                ctx.translate(dx, dy);
                minigameManager.shakeFrames--;
            }
            
            originalDraw.call(minigameManager.activeGame);
            
            // Draw Hazards
            minigameManager.hazards.forEach(haz => {
                ctx.save();
                ctx.fillStyle = minigameManager.biome.color;
                ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
                ctx.beginPath(); ctx.arc(haz.x, haz.y, haz.size/2, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            });
            
            // Flash effect
            if (minigameManager.flashOpacity > 0) {
                ctx.fillStyle = minigameManager.flashColor;
                ctx.globalAlpha = minigameManager.flashOpacity;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                minigameManager.flashOpacity -= 0.04;
            }
            
            ctx.restore();
        };
    }
};

    if (minigameManager.activeGame && minigameManager.activeGame.drawScene) {
        const originalDraw = minigameManager.activeGame.drawScene;
        
        minigameManager.activeGame.drawScene = function() {
            ctx.save();
            
            if (minigameManager.shakeFrames > 0) {
                let dx = (Math.random() - 0.5) * 9;
                let dy = (Math.random() - 0.5) * 9;
                ctx.translate(dx, dy);
                minigameManager.shakeFrames--;
            }
            
            originalDraw.call(minigameManager.activeGame);
            
            minigameManager.hazards.forEach(haz => {
                ctx.save();
                ctx.fillStyle = minigameManager.biome.color;
                ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
                ctx.beginPath(); ctx.arc(haz.x, haz.y, haz.size/2, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            });
            
            if (minigameManager.isApexEvent && minigameManager.currentPhase === 3) {
                ctx.save();
                ctx.strokeStyle = minigameManager.biome.color; ctx.lineWidth = 2;
                ctx.fillStyle = "rgba(0,0,0,0.4)";
                ctx.shadowBlur = 20; ctx.shadowColor = minigameManager.biome.color;
                
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - 160, 40);
                ctx.lineTo(canvas.width / 2 + 160, 40);
                ctx.lineTo(canvas.width / 2 + 100, 110);
                ctx.lineTo(canvas.width / 2 + 40, 110);
                ctx.lineTo(canvas.width / 2, 145);
                ctx.lineTo(canvas.width / 2 - 40, 110);
                ctx.lineTo(canvas.width / 2 - 100, 110);
                ctx.closePath();
                ctx.fill(); ctx.stroke();
                
                ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(canvas.width / 2, 75, 12 + Math.sin(minigameManager.frameCount * 0.1) * 4, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            
            if (minigameManager.flashOpacity > 0) {
                ctx.fillStyle = minigameManager.flashColor;
                ctx.globalAlpha = minigameManager.flashOpacity;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                minigameManager.flashOpacity -= 0.04;
            }
            
            ctx.restore();
        };
    }

    minigameManager.timerInterval = setInterval(() => {
        minigameManager.timer--;
        minigameManager.frameCount += 60;
        
        const clockEl = document.getElementById('game-clock');
        if (clockEl) clockEl.innerText = `${minigameManager.timer}s`;
        
        if (minigameManager.isApexEvent) {
            const phaseIndicator = document.getElementById('game-phase-indicator');
            
            if (minigameManager.timer > 60 && minigameManager.currentPhase !== 1) {
                minigameManager.currentPhase = 1;
                if (phaseIndicator) phaseIndicator.innerText = "PHASE 1/3: CORRIDOR INTRUSION // APPROACHING TARGET";
            } 
            else if (minigameManager.timer <= 60 && minigameManager.timer > 30 && minigameManager.currentPhase !== 2) {
                minigameManager.currentPhase = 2;
                if (phaseIndicator) phaseIndicator.innerText = "PHASE 2/3: FLEET DEFENSIVE SQUADRON OVERCLOCKED (+35% VELOCITY)";
                
                if (minigameManager.activeGame && minigameManager.activeGame.spawnThreatMatrix) {
                    const oldSpawner = minigameManager.activeGame.spawnThreatMatrix;
                    minigameManager.activeGame.spawnThreatMatrix = function() {
                        oldSpawner.call(minigameManager.activeGame);
                        if (minigameManager.activeGame.obstacles) {
                            minigameManager.activeGame.obstacles.forEach(obs => { obs.speed = (obs.speed || 5) * 1.35; });
                        }
                    };
                }
            } 
            else if (minigameManager.timer <= 30 && !minigameManager.bossSpawned) {
                minigameManager.currentPhase = 3;
                minigameManager.bossSpawned = true;
                if (phaseIndicator) phaseIndicator.innerText = "PHASE 3/3: SECTOR OVERLORD FLAGSHIP STATION CONNECTED // CORE READY";
                
                injectOverlordHealthBar();
            }
        }
        
        if (minigameManager.timer <= 0) {
            wrapUpActiveEncounter();
        }
    }, 1000);
}

function injectOverlordHealthBar() {
    const viewport = document.getElementById('minigame-viewport');
    if (!viewport) return;

    const bossBar = document.createElement('div');
    bossBar.id = 'apex-boss-health-frame';
    bossBar.style.cssText = `
        position: absolute; top: 165px; left: 50%; transform: translateX(-50%);
        width: 75%; max-width: 500px; height: 18px; background: rgba(0,0,0,0.95);
        border: 2px solid ${minigameManager.biome.color}; border-radius: 4px; z-index: 10006;
        box-shadow: 0 0 15px ${minigameManager.biome.color}66; padding: 2px;
        font-family: monospace; font-size: 0.55rem; text-align: center; color: #fff; box-sizing: border-box;
    `;
    
    const bossFill = document.createElement('div');
    bossFill.id = 'apex-boss-health-fill';
    bossFill.style.cssText = `
        width: 100%; height: 100%; background: ${minigameManager.biome.color};
        box-shadow: 0 0 8px ${minigameManager.biome.color}; transition: width 0.2s ease;
        display: flex; align-items: center; justify-content: center; font-weight: bold;
    `;
    bossFill.innerText = "OVERLORD FLAGSHIP BULKHEAD INTEGRITY: 100%";
    
    bossBar.appendChild(bossFill);
    viewport.appendChild(bossBar);

    if (minigameManager.activeGame && minigameManager.activeGame.updatePhysics) {
        const originalUpdatePhysics = minigameManager.activeGame.updatePhysics;
        minigameManager.activeGame.updatePhysics = function() {
            originalUpdatePhysics.call(minigameManager.activeGame);
            
            if (minigameManager.activeGame.bonusScrapEarned > 0) {
                let bossCurrentHp = Math.max(0, 100 - (minigameManager.activeGame.bonusScrapEarned / 4));
                const fill = document.getElementById('apex-boss-health-fill');
                if (fill) {
                    fill.style.width = `${bossCurrentHp}%`;
                    fill.innerText = bossCurrentHp <= 0 ? "TARGET SHATTERED // CONSTELLATION SECURED" : `OVERLORD FLAGSHIP BULKHEAD INTEGRITY: ${Math.ceil(bossCurrentHp)}%`;
                }
            }
        };
    }
}

function executeAutopilotRetreat() {
    if (minigameManager.isApexEvent) {
        localStorage.removeItem(`active_campaign_track_${minigameManager.biome.id}`);
    }

    const retreatScrapYield = Math.floor(minigameManager.baseScrapPayload * 0.6);
    if (typeof state !== 'undefined') {
        state.scrap += retreatScrapYield;
        state.energy += minigameManager.ammoPool;
    }
    if (typeof save === 'function') save();
    if (typeof updateHUD === 'function') updateHUD();
    
    const viewport = document.getElementById('minigame-viewport');
    if (viewport) viewport.remove();
    
    const summary = document.createElement('div');
    summary.className = 'modal-overlay warp-transition';
    summary.style.cssText = `display: flex; z-index: 10100; font-family: monospace; background: rgba(0,0,3,0.9);`;
    summary.innerHTML = `
        <div class="modal-content" style="border: 1px solid #ff3366; background: #000; padding: 30px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 0 40px rgba(255, 51, 102, 0.25);">
            <div style="color: #ff3366; font-size: 0.7rem; letter-spacing: 3px; font-weight: bold; margin-bottom: 5px;">TACTICAL EVASION LOGGED</div>
            <h2 class="view-main-title" style="font-size: 1.3rem; color: #fff; margin-bottom: 20px;">RETREAT READOUT</h2>
            <div class="terminal-console" style="text-align: left; padding: 15px; border-color: #ff336644; background: rgba(0,0,0,0.4); margin-bottom: 25px; line-height: 1.6; font-size: 0.75rem; color: #ccc;">
                <div>> FLIGHT MODE: <span style="color:#ff3366; font-weight:bold;">AUTOPILOT SAFE JUMP</span></div>
                <div>> SACRIFICED VALUE MARGIN: <span style="color:#888;">-40% MATERIAL FORFEIT</span></div>
                <div style="border-top: 1px dashed #ff336633; margin: 8px 0; padding-top: 8px;">> RETAINED CARGO YIELD: <span style="color:var(--captured); font-weight:bold;">+${retreatScrapYield} SCRAP</span></div>
                <div>> LOADED VOLTAGE ENERGY: <span style="color:var(--accent); font-weight:bold;">+${minigameManager.ammoPool} ENERGY</span></div>
            </div>
            <button type="button" class="action-btn" onclick="teardownMinigameOverlay(this)" style="width: 100%; padding: 12px; background: transparent; border: 1px solid #ff3366; color: #ff3366; font-weight: bold; font-size: 0.85rem; letter-spacing: 2px; cursor: pointer; border-radius: 2px;">RETURN TO BRIDGE</button>
        </div>
    `;
    document.body.appendChild(summary);
}

function wrapUpActiveEncounter() {
    minigameManager.isActive = false;
    clearInterval(minigameManager.timerInterval);
    
    if (minigameManager.activeGame) {
        minigameManager.activeGame.terminate();
        minigameManager.bonusScrapEarned = minigameManager.activeGame.bonusScrapEarned || 0;
        minigameManager.ammoPool = minigameManager.activeGame.ammoPool || 0;
    }
    
    const bid = minigameManager.biome.id;
    
    if (minigameManager.isApexEvent) {
        localStorage.removeItem(`active_campaign_track_${bid}`);
        localStorage.removeItem(`campaign_upgrade_scrap_${bid}`);
    } else if (minigameManager.bonusScrapEarned > 0) {
        localStorage.setItem(`campaign_upgrade_scrap_${bid}`, minigameManager.bonusScrapEarned);
    }
    
    const totalScrapSecured = minigameManager.baseScrapPayload + minigameManager.bonusScrapEarned;
    if (typeof state !== 'undefined') {
        state.scrap += totalScrapSecured;
        state.energy += minigameManager.ammoPool;
    }
    
    if (typeof save === 'function') save();
    if (typeof updateHUD === 'function') updateHUD();
    
    const summary = document.createElement('div');
    summary.className = 'modal-overlay warp-transition';
    summary.style.cssText = `display: flex; z-index: 10100; font-family: monospace; background: rgba(0,0,3,0.9);`;
    summary.innerHTML = `
        <div class="modal-content" style="border: 1px solid ${minigameManager.biome.color}; background: #000; padding: 30px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 0 40px ${minigameManager.biome.color}33;">
            <div style="color: ${minigameManager.biome.color}; font-size: 0.7rem; letter-spacing: 3px; font-weight: bold; margin-bottom: 5px;">EXTRACTION CONCLUDED</div>
            <h2 class="view-main-title" style="font-size: 1.4rem; color: #fff; margin-bottom: 20px;">MISSION LOG SUMMARY</h2>
            <div class="terminal-console" style="text-align: left; padding: 15px; border-color: ${minigameManager.biome.color}44; background: rgba(0,0,0,0.4); margin-bottom: 25px; line-height: 1.6; font-size: 0.75rem; color: #ccc;">
                <div>> SYSTEM EXTRACTION OUTPOST: <span style="color:${minigameManager.biome.color}; font-weight:bold;">${minigameManager.biome.id} SECURED</span></div>
                <div>> CRYO FIELD BASE RECOVERY: <span style="color:#fff;">+${minigameManager.baseScrapPayload} SCRAP</span></div>
                <div>> COMBAT ENGAGEMENT MARGIN: <span style="color:var(--captured);">+${minigameManager.bonusScrapEarned} SCRAP</span></div>
                <div style="border-top: 1px dashed #444; margin: 8px 0; padding-top: 8px;">> DYNAMIC NET YIELD SECURED: <span style="color:var(--captured); font-weight:bold;">+${totalScrapSecured} SCRAP</span></div>
                <div>> RETAINED BATTERY FLUX: <span style="color:var(--accent); font-weight:bold;">+${minigameManager.ammoPool} ENERGY</span></div>
            </div>
            <button type="button" class="success-btn" onclick="teardownMinigameOverlay(this)" style="width: 100%; padding: 12px; background: ${minigameManager.biome.color}; color: #000; font-weight: bold; border: none; font-size: 0.85rem; letter-spacing: 2px; box-shadow: 0 0 15px ${minigameManager.biome.color}; cursor: pointer; border-radius: 2px;">RETURN TO BRIDGE</button>
        </div>
    `;
    document.body.appendChild(summary);
}

function teardownMinigameOverlay(btn) {
    btn.closest('.modal-overlay').remove();
    const viewport = document.getElementById('minigame-viewport');
    if (viewport) viewport.remove();
    
    if (typeof state !== 'undefined') state.level = 1; 
    if (typeof render === 'function') render();
}
