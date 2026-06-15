// [ MASTER BUILD ] The Void Pantheon Lore Dictionary
const PANTHEON_DATA = {
    1: { 
        name: "GENESIS SPHERE", color: "#00d4ff", 
        deities: [
            {
                k:'kaelenTor', n:'Kaelen-Tor', title: 'The Star-Forge', icon: '◉',
                starBuff: "Micro-Forge: Permanently increases baseline Scrap yield by +0.5% per star activated.",
                sectors: [
                    { id: 1, name: "Ignition Core", keystone: "Spark of Genesis", isBranch: false, coords: [{x:50,y:85,t:1}, {x:50,y:70,t:1}, {x:50,y:55,t:1}, {x:50,y:40,t:1}, {x:50,y:25,t:1}, {x:50,y:10,t:2}], perk: "MAGNETISM: +2% Base Yields" },
                    { id: 2, name: "Pulsar Hammer", keystone: "Rhythmic Strike", isBranch: false, coords: [{x:20,y:80,t:1}, {x:50,y:70,t:1}, {x:80,y:60,t:1}, {x:50,y:40,t:1}, {x:20,y:20,t:1}, {x:50,y:10,t:2}], perk: "TEMPERING: Forge failure rate -5%" },
                    { id: 3, name: "The Great Split", keystone: "Thermal Expansion", isBranch: true,
                        paths: [
                            { n: "Alpha: Cold-Forging", p: "Offerings cost -10% Scrap", coords: [{x:50,y:90,t:1}, {x:35,y:70,t:1}, {x:20,y:50,t:1}, {x:35,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Over-Heating", p: "Bonus Yields +10%", coords: [{x:50,y:90,t:1}, {x:65,y:70,t:1}, {x:80,y:50,t:1}, {x:65,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "SPLIT DYNAMICS: Advanced Forging Mechanics."
                    },
                    { id: 4, name: "Anvil Peak", keystone: "Structural Reinforcement", isBranch: true, 
                        paths: [
                            { n: "Alpha: Heavy Metal", p: "Salvage weight capacity +5%", coords: [{x:50,y:90,t:1}, {x:25,y:75,t:1}, {x:15,y:50,t:1}, {x:25,y:25,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Light Alloy", p: "Ship thruster speed +2%", coords: [{x:50,y:90,t:1}, {x:75,y:75,t:1}, {x:85,y:50,t:1}, {x:75,y:25,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "REINFORCEMENT: Scrap payout +5%" 
                    },
                    { id: 5, name: "Solar Crucible", keystone: "Heart of the Star", isBranch: true,
                        paths: [
                            { n: "Alpha: Magma Core", p: "Smelting time -10%", coords: [{x:50,y:90,t:1}, {x:20,y:70,t:1}, {x:20,y:50,t:1}, {x:20,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Plasma Arc", p: "Plasma damage +5%", coords: [{x:50,y:90,t:1}, {x:50,y:70,t:1}, {x:50,y:50,t:1}, {x:50,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Sigma: Dyson Shell", p: "Energy generation +15%", coords: [{x:50,y:90,t:1}, {x:80,y:70,t:1}, {x:80,y:50,t:1}, {x:80,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "FORGE-MASTER: +1% Critical Craft chance" 
                    }
                ],
                major: { n: "THE MIDAS DRIVE", cost: 50, desc: "Convert 10% of lifetime Energy into a massive one-time Scrap payout." }
            },
            {
                k:'aethelgard', n:'Aethelgard', title: 'The Weaver of Eons', icon: '✷',
                starBuff: "Temporal Shard: Mission warning alerts trigger 5 minutes earlier per star activated.",
                sectors: [
                    { id: 1, name: "Temporal Pulse", keystone: "First Breath", isBranch: false, coords: [{x:10,y:50,t:1}, {x:30,y:50,t:1}, {x:40,y:20,t:0}, {x:50,y:80,t:1}, {x:60,y:50,t:0}, {x:80,y:50,t:1}, {x:90,y:50,t:1}, {x:95,y:50,t:2}], perk: "VELOCITY: +1% Scrap on fast clears" },
                    { id: 2, name: "The Hourglass", keystone: "Falling Sands", isBranch: false, coords: [{x:25,y:20,t:1}, {x:75,y:20,t:1}, {x:50,y:50,t:1}, {x:25,y:80,t:1}, {x:75,y:80,t:1}, {x:50,y:90,t:2}], perk: "SAND-SHIFT: Warning alerts +2h" },
                    { id: 3, name: "Timeline Fork", keystone: "The Choice", isBranch: true,
                        paths: [
                            { n: "Alpha: Dilated Time", p: "Target timers -10% slower", coords: [{x:50,y:90,t:1}, {x:30,y:70,t:1}, {x:15,y:50,t:1}, {x:30,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Accelerated Eons", p: "Energy generation +5%", coords: [{x:50,y:90,t:1}, {x:70,y:70,t:1}, {x:85,y:50,t:1}, {x:70,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "CHRONO-SPLIT: Time Mechanics"
                    },
                    { id: 4, name: "The Pendulum", keystone: "Momentum Swing", isBranch: true,
                        paths: [
                            { n: "Alpha: Steady Rhythm", p: "Offline limits +2hrs", coords: [{x:50,y:15,t:1}, {x:30,y:35,t:1}, {x:20,y:55,t:1}, {x:30,y:75,t:1}, {x:50,y:90,t:2}] },
                            { n: "Omega: Violent Swing", p: "Crits deal 2x damage", coords: [{x:50,y:15,t:1}, {x:70,y:35,t:1}, {x:80,y:55,t:1}, {x:70,y:75,t:1}, {x:50,y:90,t:2}] }
                        ], perk: "MOMENTUM: Consecutive tasks grant +1% Energy" 
                    },
                    { id: 5, name: "Infinity Knot", keystone: "Eternal Loop", isBranch: true,
                        paths: [
                            { n: "Alpha: Past Memory", p: "Replay completed tasks for 50% reward", coords: [{x:50,y:90,t:1}, {x:20,y:70,t:1}, {x:20,y:50,t:1}, {x:20,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Present Focus", p: "Active tasks drain -5% energy", coords: [{x:50,y:90,t:1}, {x:50,y:70,t:1}, {x:50,y:50,t:1}, {x:50,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Sigma: Future Sight", p: "Reveal next day's market rates", coords: [{x:50,y:90,t:1}, {x:80,y:70,t:1}, {x:80,y:50,t:1}, {x:80,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "ETERNAL LOOP: Targets have 5% chance to auto-respawn" 
                    }
                ],
                major: { n: "CHRONOS SHIFT", cost: 50, desc: "Instantly advance Pilot Level by 1 without filling Capacitor." }
            },
            {
                k:'valerium', n:'Valerium', title: 'The Aegis Warden', icon: '⎔',
                starBuff: "Plating Fragment: Reduces the Energy penalty of Overdue tasks by 0.2 points per star.",
                sectors: [
                    { id: 1, name: "Bulwark Base", keystone: "Iron Will", isBranch: false, coords: [{x:20,y:80,t:1}, {x:40,y:80,t:1}, {x:60,y:80,t:1}, {x:80,y:80,t:1}, {x:50,y:50,t:1}, {x:50,y:20,t:2}], perk: "PLATING: -1 Overdue Penalty" },
                    { id: 2, name: "Aegis Wall", keystone: "Deflection Grid", isBranch: false, coords: [{x:10,y:50,t:1}, {x:30,y:50,t:1}, {x:50,y:50,t:1}, {x:70,y:50,t:1}, {x:90,y:50,t:1}, {x:50,y:20,t:2}], perk: "DEFLECTION: 5% lower Energy loss" },
                    { id: 3, name: "Shield Specialization", keystone: "Kinetic Absorption", isBranch: true,
                        paths: [
                            { n: "Alpha: Reflective Guard", p: "Penalties returned as 5% Scrap", coords: [{x:50,y:90,t:1}, {x:35,y:70,t:1}, {x:20,y:50,t:1}, {x:35,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Kinetic Sink", p: "Penalty Energy cap increased", coords: [{x:50,y:90,t:1}, {x:65,y:70,t:1}, {x:80,y:50,t:1}, {x:65,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "SHIELD MATRIX: Kinetic mechanics."
                    },
                    { id: 4, name: "Phalanx Array", keystone: "Vanguard Formation", isBranch: true,
                        paths: [
                            { n: "Alpha: Spear Wall", p: "Defensive retaliations deal damage", coords: [{x:50,y:90,t:1}, {x:25,y:75,t:1}, {x:15,y:50,t:1}, {x:25,y:25,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Turtle Shell", p: "Invulnerability window +1s", coords: [{x:50,y:90,t:1}, {x:75,y:75,t:1}, {x:85,y:50,t:1}, {x:75,y:25,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "GUARD: Shield Sub-Routines +10% strength" 
                    },
                    { id: 5, name: "Bastion Peak", keystone: "Immortal Warden", isBranch: true,
                        paths: [
                            { n: "Alpha: Iron Fortress", p: "Base armor +25%", coords: [{x:50,y:90,t:1}, {x:20,y:70,t:1}, {x:20,y:50,t:1}, {x:20,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Energy Shield", p: "Base shields +25%", coords: [{x:50,y:90,t:1}, {x:50,y:70,t:1}, {x:50,y:50,t:1}, {x:50,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Sigma: Health Regen", p: "Regenerate 1% max HP per sec", coords: [{x:50,y:90,t:1}, {x:80,y:70,t:1}, {x:80,y:50,t:1}, {x:80,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "IMMORTAL WARDEN: Energy never drops below 1" 
                    }
                ],
                major: { n: "WARDEN'S GRACE", cost: 50, desc: "Auto-generate Sub-Routine Shields on Decaying tasks." }
            }
        ] 
    },
    2: { 
        name: "THE ABYSSAL SYNDICATE", color: "#ffd700", 
        deities: [
            {
                k:'syraxis', n:'Syraxis', title: 'The Shadow-Walker', icon: '◯',
                starBuff: "Shadow Step: Offline generation rate increased by +0.5% per star.",
                sectors: [
                    { id: 1, name: "Shadow Blade", keystone: "First Strike", isBranch: false, coords: [{x:50,y:90,t:1}, {x:50,y:74,t:1}, {x:50,y:58,t:1}, {x:50,y:42,t:1}, {x:50,y:26,t:1}, {x:50,y:10,t:2}], perk: "UNDERWORLD: +2% Market Rate" },
                    { id: 2, name: "Veil of Mist", keystone: "Smoke Screen", isBranch: false, coords: [{x:20,y:80,t:1}, {x:40,y:60,t:1}, {x:20,y:40,t:1}, {x:40,y:20,t:1}, {x:20,y:10,t:1}, {x:60,y:10,t:2}], perk: "CLOAK: Hidden bounty payouts +5%" },
                    { id: 3, name: "The Silent Fork", keystone: "Assassin's Path", isBranch: true,
                        paths: [
                            { n: "Alpha: Shadow Step", p: "Mission travel cost -1 Energy", coords: [{x:50,y:90,t:1}, {x:40,y:70,t:1}, {x:30,y:50,t:1}, {x:20,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Lethal Strike", p: "Scrap crit multiplier +0.5x", coords: [{x:50,y:90,t:1}, {x:60,y:70,t:1}, {x:70,y:50,t:1}, {x:80,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "Assassin Mechanics."
                    },
                    { id: 4, name: "The Eclipse", keystone: "Total Darkness", isBranch: true, 
                        paths: [
                            { n: "Alpha: Penumbra", p: "Evade chance +5%", coords: [{x:50,y:90,t:1}, {x:20,y:75,t:1}, {x:10,y:50,t:1}, {x:20,y:25,t:1}, {x:50,y:10,t:0}, {x:50,y:30,t:0}, {x:50,y:50,t:2}] },
                            { n: "Omega: Umbra", p: "Critical strike stealth +10%", coords: [{x:50,y:90,t:1}, {x:80,y:75,t:1}, {x:90,y:50,t:1}, {x:80,y:25,t:1}, {x:50,y:10,t:0}, {x:50,y:30,t:0}, {x:50,y:50,t:2}] }
                        ], perk: "VOID-SIGHT: Rare encounters +2%" 
                    },
                    { id: 5, name: "Void Cloak", keystone: "Phantom Drive", isBranch: true,
                        paths: [
                            { n: "Alpha: Smoke Bomb", p: "Instantly escape 1 encounter per day", coords: [{x:50,y:90,t:1}, {x:20,y:70,t:1}, {x:20,y:50,t:1}, {x:20,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Shadow Clone", p: "Clone completes 1 task automatically", coords: [{x:50,y:90,t:1}, {x:50,y:70,t:1}, {x:50,y:50,t:1}, {x:50,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Sigma: Ghost Walk", p: "Movement ignores environmental hazards", coords: [{x:50,y:90,t:1}, {x:80,y:70,t:1}, {x:80,y:50,t:1}, {x:80,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "PHANTOM DRIVE: +10% Offline generation" 
                    }
                ],
                major: { n: "THE SMUGGLER'S TOLL", cost: 50, desc: "Hires a phantom-operative to drip-feed Scrap while offline." }
            },
            {
                k:'ignisKor', n:'Ignis-Kor', title: 'The Reality Shaper', icon: '▵',
                starBuff: "Quantum Fluctuation: Buff durations extended by +2 minutes per star.",
                sectors: [
                    { id: 1, name: "Primary Cube", keystone: "Base Reality", isBranch: false, coords: [{x:30,y:80,t:1}, {x:30,y:40,t:1}, {x:70,y:40,t:1}, {x:70,y:80,t:1}, {x:50,y:80,t:1}, {x:50,y:60,t:2}], perk: "STABILITY: Buffs last +15m" },
                    { id: 2, name: "Prism Lens", keystone: "Refraction Index", isBranch: false, coords: [{x:20,y:80,t:1}, {x:50,y:70,t:1}, {x:80,y:60,t:1}, {x:50,y:40,t:1}, {x:20,y:20,t:1}, {x:50,y:10,t:2}], perk: "REFRACTION: Buff strength +2%" },
                    { id: 3, name: "Reality Matrix", keystone: "The Paradigm Shift", isBranch: true,
                        paths: [
                            { n: "Alpha: Logic Loop", p: "Buff cost -25% Energy", coords: [{x:50,y:90,t:1}, {x:35,y:70,t:1}, {x:20,y:50,t:1}, {x:35,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Chaos Theory", p: "Buff strength +10% (Variable)", coords: [{x:50,y:90,t:1}, {x:65,y:70,t:1}, {x:80,y:50,t:1}, {x:65,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "Matrix Mechanics"
                    },
                    { id: 4, name: "Tesseract Frame", keystone: "Folded Space", isBranch: true,
                        paths: [
                            { n: "Alpha: Spatial Fold", p: "Instantly teleport 1x per day", coords: [{x:50,y:90,t:1}, {x:25,y:75,t:1}, {x:15,y:50,t:1}, {x:25,y:25,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Pocket Dimension", p: "Inventory stash size +50", coords: [{x:50,y:90,t:1}, {x:75,y:75,t:1}, {x:85,y:50,t:1}, {x:75,y:25,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "FOLDED SPACE: Cargo capacity +10%" 
                    },
                    { id: 5, name: "The Singularity", keystone: "Event Horizon", isBranch: true,
                        paths: [
                            { n: "Alpha: Black Hole", p: "Sucks in all nearby loose scrap", coords: [{x:50,y:90,t:1}, {x:20,y:70,t:1}, {x:20,y:50,t:1}, {x:20,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: White Hole", p: "Passively pushes enemies away", coords: [{x:50,y:90,t:1}, {x:50,y:70,t:1}, {x:50,y:50,t:1}, {x:50,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Sigma: Worm Hole", p: "Link two nodes for free fast travel", coords: [{x:50,y:90,t:1}, {x:80,y:70,t:1}, {x:80,y:50,t:1}, {x:80,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "TRUE SHAPER: 5% chance buffs never expire" 
                    }
                ],
                major: { n: "QUANTUM LOOP", cost: 50, desc: "33% chance the universe loops when crafting, refunding all Scrap." }
            },
            {
                k:'morvath', n:'Morvath', title: 'The Void Hunter', icon: '◈',
                starBuff: "Blood Trail: Bounty rewards increased by +0.5% per star.",
                sectors: [
                    { id: 1, name: "Hunter's Mark", keystone: "The Quarry", isBranch: false, coords: [{x:50,y:90,t:1}, {x:30,y:74,t:1}, {x:70,y:58,t:1}, {x:30,y:42,t:1}, {x:70,y:26,t:1}, {x:50,y:10,t:2}], perk: "BLOOD-MONEY: Bounties +2%" },
                    { id: 2, name: "Jagged Talon", keystone: "Deep Wound", isBranch: false, coords: [{x:20,y:80,t:1}, {x:45,y:65,t:1}, {x:35,y:50,t:1}, {x:65,y:35,t:1}, {x:80,y:20,t:1}, {x:50,y:10,t:2}], perk: "TRACKER: Rare spawns +1%" },
                    { id: 3, name: "The Stalk", keystone: "Predator's Patience", isBranch: true,
                        paths: [
                            { n: "Alpha: Trapper", p: "Bounty timers +4h", coords: [{x:50,y:90,t:1}, {x:35,y:70,t:1}, {x:20,y:50,t:1}, {x:35,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Slayer", p: "Bounty payout +10%", coords: [{x:50,y:90,t:1}, {x:65,y:70,t:1}, {x:80,y:50,t:1}, {x:65,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "Hunting Mechanics"
                    },
                    { id: 4, name: "Stellar Sight", keystone: "True Vision", isBranch: true,
                        paths: [
                            { n: "Alpha: Eagle Eye", p: "Scan range +200m", coords: [{x:50,y:90,t:1}, {x:25,y:75,t:1}, {x:15,y:50,t:1}, {x:25,y:25,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Thermal Optics", p: "See through light terrain", coords: [{x:50,y:90,t:1}, {x:75,y:75,t:1}, {x:85,y:50,t:1}, {x:75,y:25,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "PREDATOR: Critical bounty chance +3%" 
                    },
                    { id: 5, name: "Apex Strike", keystone: "Killing Blow", isBranch: true,
                        paths: [
                            { n: "Alpha: Rend", p: "Adds a bleed effect to crits", coords: [{x:50,y:90,t:1}, {x:20,y:70,t:1}, {x:20,y:50,t:1}, {x:20,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Crush", p: "Stuns target for 1s on hit", coords: [{x:50,y:90,t:1}, {x:50,y:70,t:1}, {x:50,y:50,t:1}, {x:50,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Sigma: Execute", p: "Insta-kill enemies below 5% HP", coords: [{x:50,y:90,t:1}, {x:80,y:70,t:1}, {x:80,y:50,t:1}, {x:80,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "OBLITERATION: Bonus Scrap on all kills" 
                    }
                ],
                major: { n: "THE APEX CONTRACT", cost: 50, desc: "Completing a Bounty grants an 'Obliteration Token' to wipe a task." }
            }
        ] 
    },
    3: { 
        name: "THE CELESTIAL VANGUARD", color: "#ff00ff", 
        deities: [
            {
                k:'ragnarath', n:'Ragnarath', title: 'The Dread-Caller', icon: '◇',
                starBuff: "Kinetic Force: Boss damage increased by +0.5% per star.",
                sectors: [
                    { id: 1, name: "Impact Crater", keystone: "Meteor Strike", isBranch: false, coords: [{x:20,y:20,t:1}, {x:20,y:50,t:0}, {x:30,y:80,t:1}, {x:50,y:90,t:1}, {x:70,y:80,t:1}, {x:80,y:50,t:0}, {x:80,y:20,t:1}, {x:50,y:50,t:2}], perk: "KINETIC: +2% Boss Damage" },
                    { id: 2, name: "Shattered Spine", keystone: "Brutal Force", isBranch: false, coords: [{x:20,y:80,t:1}, {x:50,y:70,t:1}, {x:80,y:60,t:1}, {x:50,y:40,t:1}, {x:20,y:20,t:1}, {x:50,y:10,t:2}], perk: "RAGE: Energy loss adds +1% Damage" },
                    { id: 3, name: "Dread Torrent", keystone: "Unstoppable Momentum", isBranch: true,
                        paths: [
                            { n: "Alpha: Fearful Presence", p: "Boss timers +2h", coords: [{x:50,y:90,t:1}, {x:35,y:70,t:1}, {x:20,y:50,t:1}, {x:35,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Total Ruin", p: "Boss Scrap payout +15%", coords: [{x:50,y:90,t:1}, {x:65,y:70,t:1}, {x:80,y:50,t:1}, {x:65,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "Boss Encounter Mechanics"
                    },
                    { id: 4, name: "Spiked Maw", keystone: "Devouring Jaws", isBranch: true, 
                        paths: [
                            { n: "Alpha: Iron Teeth", p: "Bite damage +10%", coords: [{x:50,y:90,t:1}, {x:25,y:75,t:1}, {x:15,y:50,t:1}, {x:25,y:25,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Toxic Saliva", p: "Bite adds poison DoT", coords: [{x:50,y:90,t:1}, {x:75,y:75,t:1}, {x:85,y:50,t:1}, {x:75,y:25,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "HARVEST: Boss kills grant +5 Offering" 
                    },
                    { id: 5, name: "Apocalypse Gate", keystone: "The End Times", isBranch: true,
                        paths: [
                            { n: "Alpha: Hellfire", p: "Drop meteors during combat", coords: [{x:50,y:90,t:1}, {x:20,y:70,t:1}, {x:20,y:50,t:1}, {x:20,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Brimstone", p: "Leave burning trails", coords: [{x:50,y:90,t:1}, {x:50,y:70,t:1}, {x:50,y:50,t:1}, {x:50,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Sigma: Abaddon", p: "Summon a minor demon ally", coords: [{x:50,y:90,t:1}, {x:80,y:70,t:1}, {x:80,y:50,t:1}, {x:80,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "DREAD-LORD: Orbital Strike cooldown -24h" 
                    }
                ],
                major: { n: "THE ORBITAL STRIKE", cost: 50, desc: "Once a week, instantly obliterate a Boss Target." }
            },
            {
                k:'luminara', n:'Luminara', title: 'The Cosmic Veil', icon: '✕',
                starBuff: "Ion Shielding: Hostile encounter energy drain reduced by 0.5% per star.",
                sectors: [
                    { id: 1, name: "Soft Halo", keystone: "Gentle Light", isBranch: false, coords: [{x:50,y:90,t:1}, {x:30,y:70,t:0}, {x:50,y:50,t:1}, {x:70,y:40,t:0}, {x:50,y:30,t:1}, {x:30,y:20,t:1}, {x:70,y:15,t:1}, {x:50,y:10,t:2}], perk: "RESISTANCE: Ion drain -2%" },
                    { id: 2, name: "Solar Flare", keystone: "Blinding Flash", isBranch: false, coords: [{x:20,y:80,t:1}, {x:50,y:70,t:1}, {x:80,y:60,t:1}, {x:50,y:40,t:1}, {x:20,y:20,t:1}, {x:50,y:10,t:2}], perk: "RADIANCE: Encounter rewards +5%" },
                    { id: 3, name: "Glow Prism", keystone: "Light Refraction", isBranch: true,
                        paths: [
                            { n: "Alpha: Healing Light", p: "Encounter Energy loss -25%", coords: [{x:50,y:90,t:1}, {x:35,y:70,t:1}, {x:20,y:50,t:1}, {x:35,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Searing Veil", p: "Encounter Scrap +15%", coords: [{x:50,y:90,t:1}, {x:65,y:70,t:1}, {x:80,y:50,t:1}, {x:65,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "Prism Dynamics"
                    },
                    { id: 4, name: "Stellar Ribbon", keystone: "Cosmic Flow", isBranch: true,
                        paths: [
                            { n: "Alpha: Smooth Current", p: "Travel speed +10%", coords: [{x:50,y:90,t:1}, {x:25,y:75,t:1}, {x:15,y:50,t:1}, {x:25,y:25,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Riptide", p: "Dash covers 2x distance", coords: [{x:50,y:90,t:1}, {x:75,y:75,t:1}, {x:85,y:50,t:1}, {x:75,y:25,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "WAVE-FORM: Fast travel cost -5% Scrap" 
                    },
                    { id: 5, name: "Cosmic Crown", keystone: "Queen of Stars", isBranch: true,
                        paths: [
                            { n: "Alpha: Royal Guard", p: "Summon 2 energy shields", coords: [{x:50,y:90,t:1}, {x:20,y:70,t:1}, {x:20,y:50,t:1}, {x:20,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Royal Decree", p: "Enemies drop 10% more scrap", coords: [{x:50,y:90,t:1}, {x:50,y:70,t:1}, {x:50,y:50,t:1}, {x:50,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Sigma: Royal Ascent", p: "XP gain increased by 5%", coords: [{x:50,y:90,t:1}, {x:80,y:70,t:1}, {x:80,y:50,t:1}, {x:80,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "VEIL-BORN: 10% chance to dodge encounters" 
                    }
                ],
                major: { n: "THE VEIL OF LIGHT", cost: 50, desc: "Damage has a 33% chance to be converted into Bonus Energy." }
            },
            {
                k:'xerxes', n:'Xerxes', title: 'The Harvester of Suns', icon: '⛶',
                starBuff: "Gravitational Pull: Rare encounter spawn chance increased by 0.5% per star.",
                sectors: [
                    { id: 1, name: "Siphon Root", keystone: "Deep Drain", isBranch: false, coords: [{x:10,y:20,t:1}, {x:90,y:20,t:1}, {x:50,y:30,t:0}, {x:30,y:50,t:1}, {x:70,y:60,t:1}, {x:45,y:80,t:1}, {x:50,y:95,t:2}], perk: "DETECTION: Rare spawns +2%" },
                    { id: 2, name: "Hungry Maw", keystone: "Endless Appetite", isBranch: false, coords: [{x:20,y:80,t:1}, {x:50,y:70,t:1}, {x:80,y:60,t:1}, {x:50,y:40,t:1}, {x:20,y:20,t:1}, {x:50,y:10,t:2}], perk: "SIPHON: Secure rewards +5%" },
                    { id: 3, name: "The Web", keystone: "Sticky Trap", isBranch: true,
                        paths: [
                            { n: "Alpha: Silk Weaver", p: "Rare Encounter timers +6h", coords: [{x:50,y:90,t:1}, {x:35,y:70,t:1}, {x:20,y:50,t:1}, {x:35,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Venom Gland", p: "Rare Encounter Scrap +25%", coords: [{x:50,y:90,t:1}, {x:65,y:70,t:1}, {x:80,y:50,t:1}, {x:65,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "Web Trapping Mechanics"
                    },
                    { id: 4, name: "Funnel Core", keystone: "Singularity Point", isBranch: true,
                        paths: [
                            { n: "Alpha: Dense Gravity", p: "Slows enemies by 5%", coords: [{x:50,y:90,t:1}, {x:25,y:75,t:1}, {x:15,y:50,t:1}, {x:25,y:25,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Repulsion Field", p: "Pushes projectiles away", coords: [{x:50,y:90,t:1}, {x:75,y:75,t:1}, {x:85,y:50,t:1}, {x:75,y:25,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "GRAVITY: Magnetism pull range +20%" 
                    },
                    { id: 5, name: "Solar Scythe", keystone: "The Harvest", isBranch: true,
                        paths: [
                            { n: "Alpha: Wide Arc", p: "Cleave radius +50%", coords: [{x:50,y:90,t:1}, {x:20,y:70,t:1}, {x:20,y:50,t:1}, {x:20,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Omega: Razor Edge", p: "Cleave damage +25%", coords: [{x:50,y:90,t:1}, {x:50,y:70,t:1}, {x:50,y:50,t:1}, {x:50,y:30,t:1}, {x:50,y:10,t:2}] },
                            { n: "Sigma: Quick Reap", p: "Attack speed +10%", coords: [{x:50,y:90,t:1}, {x:80,y:70,t:1}, {x:80,y:50,t:1}, {x:80,y:30,t:1}, {x:50,y:10,t:2}] }
                        ], perk: "SUN-EATER: Fully clear Sector for permanent +25% boost" 
                    }
                ],
                major: { n: "THE SUN-EATER", cost: 50, desc: "Fully clearing a Sector permanently boosts that Sector's rewards." }
            }
        ] 
    }
};
