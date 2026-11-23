// ===== Enemy Database (doc PART 9/10, 21.2) =====
// speed = cells per second. range in cells. attackSpeed = seconds between attacks.
RK.Data.enemies = {
  ZOM_NORMAL: { id: 'ZOM_NORMAL', name: 'Normal Zombie Kuma', role: 'Melee', asset: 'ZOM_NORMAL',
    hp: 200, atk: 22, def: 0, speed: 0.22, range: 0, attackSpeed: 1.0, scale: 1.25, reward: { gold: 2 } },
  ZOM_NURSE: { id: 'ZOM_NURSE', name: 'Fast Zombie (Nurse)', role: 'Fast', asset: 'ZOM_NURSE',
    hp: 130, atk: 14, def: 0, speed: 0.46, range: 0, attackSpeed: 0.8, scale: 1.2, reward: { gold: 2 } },
  ZOM_HEAVY: { id: 'ZOM_HEAVY', name: 'Heavy Zombie Kuma', role: 'Tank', asset: 'ZOM_HEAVY',
    hp: 760, atk: 60, def: 5, speed: 0.13, range: 0, attackSpeed: 1.6, scale: 1.55, reward: { gold: 6 } },
  ZOM_CONE: { id: 'ZOM_CONE', name: 'Cone Armor Zombie', role: 'Melee', asset: 'ZOM_CONE',
    hp: 200, armorHp: 260, armorReduction: 0.2, atk: 22, def: 0, speed: 0.22, range: 0, attackSpeed: 1.0, scale: 1.3, reward: { gold: 3 } },
  ZOM_BUCKET: { id: 'ZOM_BUCKET', name: 'Bucket Shield Zombie', role: 'Melee', asset: 'ZOM_BUCKET',
    hp: 200, shieldHp: 560, shieldReduction: 0.3, atk: 22, def: 0, speed: 0.2, range: 0, attackSpeed: 1.0, scale: 1.3, reward: { gold: 4 } },

  // ---------- Ranged (doc PART 10) ----------
  RZ_ROCK: { id: 'RZ_ROCK', name: 'Rock Zombie', role: 'Ranged', asset: 'RZ_ROCK',
    hp: 170, atk: 22, def: 0, speed: 0.2, range: 3.5, attackSpeed: 2.6, scale: 1.3,
    projectile: { asset: 'PROJ_ROCK', speed: 4.5, damageType: 'normal' }, reward: { gold: 3 } },
  RZ_BUILDER: { id: 'RZ_BUILDER', name: 'Builder Zombie', role: 'Ranged', asset: 'RZ_BUILDER',
    hp: 190, atk: 42, def: 2, speed: 0.18, range: 3.2, attackSpeed: 3.8, scale: 1.3,
    projectile: { asset: 'PROJ_BRICK', speed: 4, damageType: 'heavy' }, reward: { gold: 4 } },
  RZ_CHEF: { id: 'RZ_CHEF', name: 'Chef Zombie', role: 'Ranged', asset: 'RZ_CHEF',
    hp: 170, atk: 14, def: 0, speed: 0.2, range: 3.4, attackSpeed: 2.8, scale: 1.3,
    projectile: { asset: 'PROJ_EGG', speed: 4.2, damageType: 'normal', status: { type: 'stun', strength: 1, duration: 0.7 } }, reward: { gold: 4 } },
  RZ_FARMER: { id: 'RZ_FARMER', name: 'Farmer Zombie', role: 'Ranged', asset: 'RZ_FARMER',
    hp: 180, atk: 18, def: 0, speed: 0.2, range: 3.4, attackSpeed: 2.8, scale: 1.3,
    projectile: { asset: 'PROJ_TOMATO', speed: 4.2, damageType: 'normal', status: { type: 'slow', strength: 0.35, duration: 3, chance: 0.5 } }, reward: { gold: 4 } },
  RZ_TRASH: { id: 'RZ_TRASH', name: 'Trash Zombie', role: 'Ranged', asset: 'RZ_TRASH',
    hp: 160, atk: 9, def: 0, speed: 0.22, range: 3.0, attackSpeed: 1.0, scale: 1.3,
    projectile: { asset: 'PROJ_CAN', speed: 5, damageType: 'normal' }, reward: { gold: 4 } },
  RZ_TOXIC: { id: 'RZ_TOXIC', name: 'Toxic Zombie', role: 'Ranged', asset: 'RZ_TOXIC',
    hp: 170, atk: 10, def: 0, speed: 0.2, range: 3.5, attackSpeed: 3.0, scale: 1.3,
    projectile: { asset: 'PROJ_POISON_BOTTLE', speed: 4, damageType: 'poison', status: { type: 'poison', strength: 6, duration: 4 } }, reward: { gold: 5 } },

  // ---------- Boss (Phase 3 uses it; data ready) ----------
  BOSS_GIANT_ZOMBIE_KUMA: { id: 'BOSS_GIANT_ZOMBIE_KUMA', name: 'Giant Zombie Kuma', role: 'Boss', asset: 'BOSS_GIANT_ZOMBIE_KUMA',
    hp: 4200, atk: 120, def: 8, speed: 0.08, range: 0, attackSpeed: 2.2, scale: 2.3, isBoss: true, hitsAllInCell: true, reward: { gold: 60 } }
};

// Projectile visuals for the bear side
RK.Data.projectiles = {
  DONUT_NORMAL: { asset: 'DONUT_NORMAL', size: 46 }
};
