# 🛸 MISSION CONTROL — DEVELOPMENT LOG & WISHLIST

## 🛠️ Sector 1: The Hangar Refit Overhaul (Active Staging)
- [ ] **Unified Hangar Refit UI Panel:** Expand the current cosmetic Hangar into a full-scale modification interface on the dashboard, allowing pilots to spend lifetime-accumulated Scrap to purchase new ship hardware.
- [ ] **Simultaneous Visual-Statistical Upgrade Pipeline:** Wire transactions so that purchasing an upgrade deducts your Scrap bank, updates `state.shipParts` instantly on the bridge view, and injects permanent stat multipliers (e.g., `ammoPoolBonus`, `impactDeflection`) into the engine.
- [ ] **Dynamic Minigame Sprite Integration:** Modify the 60m/90m canvas engines to actively scan the slotted `state.shipParts` array, rendering unique vector ship graphics that mirror your exact Hangar layout during break runs.
- [ ] **Functional Hitbox Scaling:** Link equipped Hangar hardware directly to active gameplay physics. For example, buying and slotting a heavy brutalist wedge armor plating must physically scale up your shield crash hitboxes during combat blocks.

## ⚔️ Sector 2: Break Encounter Mechanical Tuning (Minigame Polish)
- [ ] **Active Overlord Boss AI:** Upgrade Phase 3 (the final 30 seconds of an Apex 90-minute run) from a static wireframe fortress asset overlay into a dangerous combat entity that actively fires bullet-hell projectile patterns or sweeps screen-slicing laser lines.
- [ ] **Environmental Physics Overclocks:** Move beyond standard basic hazard particles and code authentic physics anomalies mapped to `minigameManager.biome.id` (e.g., true friction loss and sliding inertia drift when floating through an `ICE` sector map).
- [ ] **Apex Event Redecoration:** Ensure that if an Apex gauntlet is active, collectable score nodes contextually re-skin into stolen flagship reactor cores or intercepted telemetry arrays.

## 🔊 Sector 3: Technical Immersion & Juice
- [ ] **Web Audio API Space Synthesizer:** Program a zero-asset sound manager using native browser audio oscillators to mathematically generate low-pass explosions, collection blips, and boss alert sirens without bloating the directory with heavy audio assets.
- [ ] **Dynamic Frame Flashes:** Intercept canvas updates to trigger vibrant, neon background screen whiteouts when major chain reactions (such as in `fusionCascade`) detonate.

## 🗺️ Sector 4: Macro Bridge Calibration (Levels 1–4 Synchronization)
- [ ] **Task Lifecycle Synchronization:** Verify that updating task checkboxes or modular sub-routines inside the Level 4 Target Lock view perfectly pipelines power increments up to your core ship fuel cells.
- [ ] **Voronoi Viewport Optimization:** Audit the D3.js zoom matrices to ensure transition animations remain perfectly fluid when drilling down from Level 1 Galactic Sectors directly down into Level 3 Star Constellations.


##  Sector 5: GAMES TO ADD
- [ ] Frogger Clone - what's the pairing?
- [ ] Galaga Clone - what's the pairing?
