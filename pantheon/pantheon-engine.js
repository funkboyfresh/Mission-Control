/**
 * PANTHEON-ENGINE.JS
 * RPG Calculation and Save Migration 
 */

// Calculates UI Spire Height based on maximum depth achieved
function getPantheonProgress(deityKey, towerId) {
    const unlocked = state.pantheon[deityKey] || [];
    if (typeof unlocked === 'number') return Math.min(unlocked, 30); 

    const tower = PANTHEON_DATA[towerId];
    const deity = tower.deities.find(d => d.k === deityKey);
    if (!deity) return 0;

    let maxProgress = 0;
    let majorUnlocked = unlocked.includes('MAJOR');

    for (let sIdx = 0; sIdx < deity.sectors.length; sIdx++) {
        const sec = deity.sectors[sIdx];
        const paths = sec.isBranch ? sec.paths : [{coords: sec.coords}];
        let keystoneUnlocked = false;
        let maxDepthInSector = 0;

        paths.forEach(pathObj => {
            let depth = 0;
            pathObj.coords.forEach(n => {
                if (n.t !== 0 && unlocked.includes(`s${sIdx}_x${n.x}_y${n.y}`)) {
                    depth++;
                    if (n.t === 2) keystoneUnlocked = true;
                }
            });
            if (depth > maxDepthInSector) maxDepthInSector = depth;
        });

        if (keystoneUnlocked) {
            maxProgress = (sIdx + 1) * 6;
        } else {
            maxProgress = (sIdx * 6) + maxDepthInSector;
            break; // Stop counting if we haven't beaten this sector yet
        }
    }

    if (majorUnlocked) maxProgress = 30;
    return maxProgress;
}

// Converts old integer saves to the new Array Graph
function migratePantheonSave(deityKey, towerId, oldLevel) {
    const unlocked = [];
    const tower = PANTHEON_DATA[towerId];
    const deity = tower.deities.find(d => d.k === deityKey);

    if (oldLevel >= 30) unlocked.push('MAJOR');

    deity.sectors.forEach((sec, sIdx) => {
        const paths = sec.isBranch ? sec.paths : [{coords: sec.coords}];
        let depthCounter = 0;
        
        paths[0].coords.forEach(n => {
            if (n.t !== 0) depthCounter++;
            const absoluteLevel = (sIdx * 6) + depthCounter;
            if (oldLevel >= absoluteLevel) {
                unlocked.push(`s${sIdx}_x${n.x}_y${n.y}`);
            }
        });
    });
    return unlocked;
}

// Processes Offerings and Unlocks Nodes
function investOffering(deityKey, towerId, sectorIndex, pathIndex, targetNodeIndex) {
    let unlocked = state.pantheon[deityKey] || [];
    if (typeof unlocked === 'number') unlocked = migratePantheonSave(deityKey, towerId, unlocked);

    if (sectorIndex === 'MAJOR') {
        if (state.offerings >= 50) {
            state.offerings -= 50;
            if (!unlocked.includes('MAJOR')) unlocked.push('MAJOR');
            state.pantheon[deityKey] = unlocked;
            if (typeof triggerHaptic === 'function') triggerHaptic([50, 100, 50]);
            if (typeof save === 'function') save();
            renderAscensionTower(towerId);
        } else {
            alert(`THE VOID DEMANDS MORE OFFERINGS. (50 REQ)`);
        }
        return;
    }

    // Lock index to integer math to prevent String collision bugs
    sectorIndex = parseInt(sectorIndex);

    const data = PANTHEON_DATA[towerId];
    const deity = data.deities.find(d => d.k === deityKey);
    const sector = deity.sectors[sectorIndex];
    const paths = sector.isBranch ? sector.paths : [{coords: sector.coords}];
    const pathCoords = paths[pathIndex].coords;
    const targetNode = pathCoords[targetNodeIndex];

    const isKeystone = targetNode.t === 2;
    let cost = isKeystone ? 5 : 1;

    if (state.offerings >= cost) {
        state.offerings -= cost;

        // Unlocks the target node and all waypoints leading up to it
        for (let i = targetNodeIndex; i >= 0; i--) {
            const n = pathCoords[i];
            const nId = `s${sectorIndex}_x${n.x}_y${n.y}`;
            if (!unlocked.includes(nId)) unlocked.push(nId);
            else break; // Stop tracing back once we hit a lit node
        }

        state.pantheon[deityKey] = unlocked;

        if (typeof triggerHaptic === 'function') triggerHaptic([50, 100, 50]);
        if (typeof save === 'function') save();

        renderAscensionTower(towerId);
        openConstellation(deityKey, towerId, sectorIndex);
    } else {
        alert(`THE VOID DEMANDS MORE OFFERINGS. (${cost} REQ)`);
    }
}
