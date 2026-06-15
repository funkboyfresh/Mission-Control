const ENCOUNTER_TYPES = [
    // 1. ENVIRONMENTAL (20)
    'Corrosive Nebula', 'Solar Flare', 'Ion Storm', 'Asteroid Field', 'Gravitational Anomaly', 'Dark Matter Reef', 'Supernova Shockwave', 'Quantum Micro-Fracture', 'Hyper-Velocity Dust', 'Sub-Space Sinkhole', 'Electromagnetic Pulse', 'Radiation Belt', 'Frozen Gas Cloud', 'Micrometeoroid Shower', 'Unstable Wormhole', 'Neutron Star Pull', 'Cometary Tail', 'Void Pocket', 'Atmospheric Friction', 'Gamma Ray Burst',
    
    // 2. TACTICAL COMBAT (20)
    'Pirate Ambush', 'Mercenary Blockade', 'Automated Defense', 'Cloaked Stalker', 'Mutineer Boarding', 'System Patrol', 'Bounty Hunter', 'Carrier Strike', 'Weapon Platform', 'Guerrilla Raid', 'Stellar Siege', 'Supply Line Raid', 'Frigate Skirmish', 'Minefield Navigation', 'Escort Interception', 'Shadow Fleet Pursuit', 'Orbital Bombardment', 'Rebel Insurgency', 'Dreadnought Duel', 'Stealth Infiltration',
    
    // 3. OPERATIONS (20)
    'Resource Extraction', 'Deep Space Relay', 'Distress Beacon', 'Stellar Cartography', 'Orbital Construction', 'Comet Harvesting', 'Satellite Deployment', 'Fuel Siphoning', 'Survey Drone Launch', 'Planetary Landing', 'Cargo Hooking', 'Engine Tuning', 'Antenna Alignment', 'Shield Calibration', 'Reactor Purge', 'Sensor Sweep', 'Navigation Update', 'Emergency Patching', 'Scrap Metal Recovery', 'Drill Calibration',
    
    // 4. SOCIAL & DIPLOMATIC (20)
    'Merchant Caravan', 'Civilian Evacuation', 'Diplomatic Escort', 'Stranded Smuggler', 'Refugee Flotilla', 'Inspection Boarding', 'Medical Supply Run', 'Rogue AI Diplomat', 'VIP Extraction', 'Interstellar Regatta', 'Trade Negotiation', 'Cultural Exchange', 'Peace Treaty', 'Pilgrimage Fleet', 'Black Market Deal', 'Prisoner Exchange', 'Tourist Transport', 'Science Expedition', 'Relief Effort', 'Ambassador Transit',

    // 5. INTERNAL CRISIS (20)
    'Warp Core Leak', 'Hydroponics Overgrowth', 'Gravity Inversion', 'Rogue Repair Bot', 'Toxic Air Leak', 'Fire in Sector 4', 'Mainframe Overheat', 'Water Reclamation Failure', 'Medical Bay Outage', 'Airlock Malfunction', 'Power Grid Surge', 'Inertial Dampener Fail', 'Hull Stress Fracture', 'Cryo-Pod Failure', 'Shield Harmonic Drift', 'Computer Virus', 'Oxygen Depletion', 'Internal Sabotage', 'Battery Explosion', 'Bridge Lockout',

    // 6. COSMIC ANOMALIES (20)
    'Temporal Loop', 'Dimensional Bleed', 'Sentient Nebula', 'Non-Euclidean Space', 'Psychic Resonance', 'Mirrored Reality', 'Time Dilation', 'Crystalline Echo', 'Dark Energy Knot', 'Parallel Bridge', 'Chroniton Spike', 'Ethereal Entity', 'Gravity Wave', 'Spatial Fold', 'Void Whisper', 'Reality Tear', 'Phantom Signal', 'Probability Field', 'Singularity Pulse', 'Matter Mirror',

    // 7. LOGISTICS & CARGO (20)
    'Volatile Cargo', 'Fuel Contamination', 'Customs Evasion', 'Atmospheric Leak', 'Cryo-Malfunction', 'Overweight Load', 'Cargo Shift', 'Illegal Contraband', 'Perishable Goods', 'Luxury Escort', 'Industrial Parts', 'Heavy Machinery', 'Art Collection', 'Livestock Transit', 'Radioactive Waste', 'Medical Samples', 'Data Drive Transport', 'Ore Delivery', 'Weapon Shipment', 'Classified Tech',

    // 8. XENOBIOLOGY (20)
    'Bio-Mimetic Swarm', 'Sentient Spores', 'Hull Parasites', 'Giant Amoeba', 'Exotic Flora', 'Crystalline Life', 'Brain-Slug Infestation', 'Psychotropic Pollen', 'Void Whale', 'Viral Outbreak', 'Mutated Specimen', 'Egg Nest Discovery', 'DNA Corruption', 'Symbiotic Bond', 'Neural Parasite', 'Pheromone Cloud', 'Hive Mind Contact', 'Ancient Spore', 'Biological Signature', 'Alien Specimen',

    // 9. ARCHAEOLOGY (20)
    'Derelict Salvage', 'Ancient Ruins', 'Ghost Ship', 'Artifact Excavation', 'Forbidden Tech', 'Tomb World', 'Legacy Database', 'Monolith Discovery', 'Primitive Colony', 'Lost Voyager', 'Ruined Megastructure', 'Sunken City', 'Temple of Stars', 'Scripture Decryption', 'Buried Engine', 'Ancient AI Vault', 'Genetic Archive', 'Statue Collection', 'Obsidian Spire', 'Relic Retrieval',

    // 10. CYBERNETICS (20)
    'Cyber-Infiltration', 'AI Takeover', 'Sensor Jamming', 'Data Corruption', 'Firewall Breach', 'Logic Bomb', 'Encryption Key', 'Signal Ghost', 'Ghost in the Machine', 'Network Lockdown', 'Satellite Hack', 'Comm-Link Sever', 'Malware Node', 'Hard Drive Wipe', 'Digital Sabotage', 'Protocol Override', 'Mainframe Purge', 'Botnet Attack', 'Hardware Glitch', 'System Reboot',

    // 11. PSYCHOLOGICAL FRONTIERS (20)
    'Mass Hallucination', 'Morale Collapse', 'Cognitive Dissonance', 'Sleep Deprivation', 'Sensory Overload', 'Isolation Panic', 'False Memory', 'Paranoia Pulse', 'Phantom Crewman', 'Dream Infiltration', 'Neural Echo', 'Psychic Static', 'Ego Dissolution', 'Panic Cascade', 'Vertigo Spike', 'Apathy Drift', 'Obsessive Loop', 'Subconscious Rift', 'Memory Leak', 'Identity Flux',

    // 12. HIGH-TECH INDUSTRIALISM (20)
    'Factory Ship Sync', 'Automated Refinery', 'Megastructure Weld', 'Power Conduit Leak', 'Assembly Line Jam', 'Processing Overload', 'Industrial Sabotage', 'Coolant Pressure', 'Ore Smelter Flare', 'Hydro-Electric Surge', 'Nanobot Assembly', 'Drone Swarm Log', 'Turbine Misalignment', 'Chemical Spill', 'Ventilation Block', 'Piston Failure', 'Mag-Lev Drift', 'Control Valve Leak', 'Exhaust Flare', 'Filter Saturation',

    // 13. FRINGE SCIENCE (20)
    'Experimental Weapon', 'Zero-G Lab Burst', 'Antimatter Instability', 'Tachyon Burst', 'Singularity Drill', 'Gravity Engine Stutter', 'Quantum Phase Shift', 'Dark Matter Lab', 'Teleportation Glitch', 'Bio-Genetic Forge', 'Neural Interface', 'Kinetic Battery', 'Plasma Rail Alignment', 'Shield Over-Charge', 'Energy Siphon', 'Void Fusion', 'Matter Synthesizer', 'Clockwork Engine', 'Infinite Energy', 'Radioactive Decay',

    // 14. ORBITAL TRAFFIC (20)
    'Traffic Congestion', 'Docking Misalignment', 'Customs Queue', 'Navigation Beacon', 'Fueling Station', 'Orbital Debris', 'Cargo Transfer', 'Shuttle Collision', 'Beacon Blackout', 'Gate Calibration', 'Space-Lane Merge', 'Tugboat Assist', 'Parking Violation', 'Communication Lag', 'Signal Interference', 'Pilot Error', 'Landing Pad Lock', 'Air Traffic Lock', 'Flight Path Drift', 'Arrival Delay',

    // 15. NATURAL WONDERS (20)
    'Pulsar Aurora', 'Nebula Transit', 'Ring Surfing', 'Stellar Nursery', 'Binary Star Rise', 'Comet Tail Ride', 'Gas Giant Eye', 'Void Bloom', 'Luminous Reef', 'Gravity Wave Surf', 'Crystal Moon', 'Magnetic Dance', 'Stellar Flare', 'Galaxy Rim View', 'Cosmic Fountain', 'Light Pillar', 'Eternal Sunset', 'Prismatic Dust', 'Echoing Star', 'Frozen Sun',

    // 16. ESPIONAGE & STEALTH (20)
    'Covert Data Drop', 'Silent Running', 'Sensor Net Evasion', 'Tailing Target', 'Encrypted Burst', 'Cloaking Glitch', 'Shadow Maneuver', 'Infiltration Loop', 'Information Theft', 'Deep Cover Scan', 'Listening Post', 'Signal Scrambler', 'Bait and Switch', 'Dead Drop Sync', 'Ghost Protocol', 'Sub-Space Whisper', 'Black Box Rescue', 'Optical Camouflage', 'Night-Cycle Op', 'Asset Extraction',

    // 17. MERCENARY LIFE (20)
    'Contract Dispute', 'Bounty Tracking', 'Escort Duty', 'Security Detail', 'Debt Collection', 'Asset Protection', 'Force Multiplier', 'Tactical Guard', 'Extraction Point', 'Payment Delay', 'Loyalty Test', 'Hidden Agenda', 'Weapon Sourcing', 'Target Acquisition', 'Intel Gathering', 'Sector Recon', 'Hired Muscle', 'Shadow Operation', 'Vanguard Charge', 'Final Stand',

    // 18. COLONY LIFE (20)
    'Frontier Dispute', 'Terraforming Jam', 'Local Festival', 'Water Shortage', 'Crop Blight', 'Colony Riot', 'Medical Emergency', 'Resource Discovery', 'Infrastructure Fail', 'Election Day', 'Founding Ceremony', 'Trade Fair', 'Construction Milestone', 'Outpost Defense', 'Settler Arrival', 'Cultural Clash', 'Heritage Day', 'New Era Protocol', 'Isolation End', 'Prosperity Peak',

    // 19. UNIVERSAL MYSTERIES (20)
    'Other-Galaxy Signal', 'Ancient Star-Gate', 'Missing Fleet', 'Void Construct', 'Echo from Beyond', 'Forgotten Satellite', 'Cosmic Vault', 'Origin Signal', 'Watcher Drone', 'Universal Echo', 'Legendary Drifter', 'Timeless Monolith', 'Ghost of the Void', 'Silent Engine', 'Astral Projection', 'Infinite Library', 'Lost Civilization', 'Stellar Graveyard', 'Omega Particle', 'Genesis Seed',

    // 20. FLEET MANEUVERS (20)
    'Formation Flying', 'Grand Refueling', 'Allied Liaison', 'Fleet Jump', 'Strategic Pivot', 'Supply Chain Log', 'War Room Sync', 'Battle Prep', 'Combat Drill', 'Repair Triage', 'Logistics Chain', 'Admiral Review', 'Task Force Alpha', 'Strike Group Beta', 'Vanguard Delta', 'Rear Guard Guard', 'Support Wing', 'Scout Vanguard', 'Central Command', 'Final Assembly'
];
