// ===== Global game configuration (edit numbers here, no engine changes needed) =====
window.RK = window.RK || {};
RK.Data = RK.Data || {};

RK.Data.config = {
  version: '0.1.0-phase1',
  saveVersion: 1,
  screen: { width: 1672, height: 941 },       // logical resolution (matches the battlefield art)
  fixedStep: 1 / 60,                           // simulation step (seconds)
  donut: {
    normalValue: 50,          // donuts added per normal donut picked up (tuned by playtest bot; doc 5.4 'Donut Value')
    lifetime: 15,             // seconds a donut stays on the field (doc 5.3)
    blinkBefore: 3,           // starts blinking this many seconds before it disappears
    maxOnField: 30,           // performance cap (doc 5.3)
    tapRadius: 52             // touch radius in logical px
  },
  combat: {
    minimumDamage: 1,         // doc 11.2 Minimum Damage
    critChance: 0.05,
    critMultiplier: 1.5,
    heavyDamageThreshold: 60  // shows red damage number at/above this value
  },
  limits: { maxProjectiles: 200, maxDamageNumbers: 80, maxZombies: 120 },
  baseHP: 1000,
  // Factory upgrade table (doc 5.4). cost = donuts to upgrade INTO that level.
  factoryLevels: [
    null,
    { level: 1, productionTime: 20, donutsPerCycle: 1, upgradeCost: 0,   asset: 'FACTORY_LV1' },
    { level: 2, productionTime: 16, donutsPerCycle: 1, upgradeCost: 75,  asset: 'FACTORY_LV2' },
    { level: 3, productionTime: 13, donutsPerCycle: 2, upgradeCost: 125, asset: 'FACTORY_LV3' },
    { level: 4, productionTime: 9,  donutsPerCycle: 2, upgradeCost: 175, asset: 'FACTORY_LV4' },
    { level: 5, productionTime: 6,  donutsPerCycle: 3, upgradeCost: 250, asset: 'FACTORY_LV5' }
  ],
  firstProductionDelay: 6     // first donut comes sooner so the opening isn't dead time
};
