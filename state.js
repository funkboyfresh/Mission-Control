const HORIZONS = ['TRAJECTORY', 'HORIZON', 'IMMINENT'];
const AUTO_PALETTE = ['#00e5ff', '#ffd700', '#ff00ff', '#00ff88', '#ff3366', '#a200ff', '#00ffcc', '#ff9900'];

const defaultSectors = [
    { id: 'sec_career', name: 'CAREER', color: '#00e5ff', seed: {x: 0.3, y: 0.3} },
    { id: 'sec_finance', name: 'FINANCIAL', color: '#ffd700', seed: {x: 0.7, y: 0.3} },
    { id: 'sec_personal', name: 'PERSONAL', color: '#ff00ff', seed: {x: 0.5, y: 0.7} }
];

let state = {
    level: 1, 
    sectorId: null, 
    horizon: null, 
    activeMissionId: null,
    playerLevel: parseInt(localStorage.getItem('playerLevel')) || 1,
    offerings: parseInt(localStorage.getItem('offerings')) || 0,
    energy: parseInt(localStorage.getItem('energy')) || 0,
    hapticsEnabled: localStorage.getItem('hapticsEnabled') !== 'false',
    sectors: JSON.parse(localStorage.getItem('sectors')) || [...defaultSectors],
    missions: JSON.parse(localStorage.getItem('missions')) || {},
    shipPos: { x: 50, y: 50 },
    scrap: localStorage.getItem('scrap') !== null ? parseInt(localStorage.getItem('scrap')) : 500,
    shipParts: JSON.parse(localStorage.getItem('shipParts')) || {
        magnet: 1, reactor: 1, habitat: 1, hull: 1, shields: 1,
        comms: 1, thrusters: 1, sinks: 1, sensors: 1, cells: 1
    },
    pantheon: JSON.parse(localStorage.getItem('pantheon')) || {
        kaelenTor: 0, aethelgard: 0, valerium: 0,
        syraxis: 0, ignisKor: 0, morvath: 0,
        ragnarath: 0, luminara: 0, xerxes: 0,
        choices: {
            kaelenTor: 0, aethelgard: 0, valerium: 0,
            syraxis: 0, ignisKor: 0, morvath: 0,
            ragnarath: 0, luminara: 0, xerxes: 0
        }
    }
};

let editModeId = null;
let defaultHorizonContext = null;
let isHorizonFixed = false;
let tempSubtasks = [];
let editingSectors = [];
