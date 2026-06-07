// baseStats: hp, atk, def, spAtk, spDef, spd
// moves: array of move IDs (from moves.js) — starting moveset
// catchRate: 1-255 (higher = easier)
// xpYield: base XP given when defeated

export const POKEMON = {
  1: {
    id: 1, name: 'Bulbasaur', types: ['Grass', 'Poison'],
    baseStats: { hp: 45, atk: 49, def: 45, spAtk: 65, spDef: 65, spd: 45 },
    moves: [1, 2, 3, 4], catchRate: 45, xpYield: 64,
  },
  4: {
    id: 4, name: 'Charmander', types: ['Fire'],
    baseStats: { hp: 39, atk: 52, def: 43, spAtk: 60, spDef: 50, spd: 65 },
    moves: [7, 2, 8, 9], catchRate: 45, xpYield: 62,
  },
  7: {
    id: 7, name: 'Squirtle', types: ['Water'],
    baseStats: { hp: 44, atk: 48, def: 65, spAtk: 50, spDef: 64, spd: 43 },
    moves: [1, 12, 13, 14], catchRate: 45, xpYield: 63,
  },
  // -- Wild Pokemon --
  10: {
    id: 10, name: 'Caterpie', types: ['Bug'],
    baseStats: { hp: 45, atk: 30, def: 35, spAtk: 20, spDef: 20, spd: 45 },
    moves: [1, 29], catchRate: 255, xpYield: 39,
  },
  13: {
    id: 13, name: 'Weedle', types: ['Bug', 'Poison'],
    baseStats: { hp: 40, atk: 35, def: 30, spAtk: 20, spDef: 20, spd: 50 },
    moves: [26, 29], catchRate: 255, xpYield: 39,
  },
  16: {
    id: 16, name: 'Pidgey', types: ['Normal', 'Flying'],
    baseStats: { hp: 40, atk: 45, def: 40, spAtk: 35, spDef: 35, spd: 56 },
    moves: [1, 31, 35], catchRate: 255, xpYield: 50,
  },
  19: {
    id: 19, name: 'Rattata', types: ['Normal'],
    baseStats: { hp: 30, atk: 56, def: 35, spAtk: 25, spDef: 35, spd: 72 },
    moves: [1, 12, 36], catchRate: 255, xpYield: 51,
  },
  23: {
    id: 23, name: 'Ekans', types: ['Poison'],
    baseStats: { hp: 35, atk: 60, def: 44, spAtk: 40, spDef: 54, spd: 55 },
    moves: [44, 37, 26, 27], catchRate: 255, xpYield: 58,
  },
  25: {
    id: 25, name: 'Pikachu', types: ['Electric'],
    baseStats: { hp: 35, atk: 55, def: 40, spAtk: 50, spDef: 50, spd: 90 },
    moves: [52, 2, 18, 19], catchRate: 190, xpYield: 112,
  },
  35: {
    id: 35, name: 'Clefairy', types: ['Normal'],
    baseStats: { hp: 70, atk: 45, def: 48, spAtk: 60, spDef: 65, spd: 35 },
    moves: [51, 2, 1, 17], catchRate: 150, xpYield: 113,
  },
  37: {
    id: 37, name: 'Vulpix', types: ['Fire'],
    baseStats: { hp: 38, atk: 41, def: 40, spAtk: 50, spDef: 65, spd: 65 },
    moves: [8, 12, 18, 10], catchRate: 190, xpYield: 60,
  },
  39: {
    id: 39, name: 'Jigglypuff', types: ['Normal'],
    baseStats: { hp: 115, atk: 45, def: 20, spAtk: 45, spDef: 25, spd: 20 },
    moves: [46, 51, 1], catchRate: 170, xpYield: 76,
  },
  41: {
    id: 41, name: 'Zubat', types: ['Poison', 'Flying'],
    baseStats: { hp: 40, atk: 45, def: 35, spAtk: 30, spDef: 40, spd: 55 },
    moves: [33, 47], catchRate: 255, xpYield: 54,
  },
  43: {
    id: 43, name: 'Oddish', types: ['Grass', 'Poison'],
    baseStats: { hp: 45, atk: 50, def: 55, spAtk: 75, spDef: 65, spd: 30 },
    moves: [51, 41, 6], catchRate: 255, xpYield: 64,
  },
  46: {
    id: 46, name: 'Paras', types: ['Bug', 'Grass'],
    baseStats: { hp: 35, atk: 70, def: 55, spAtk: 45, spDef: 55, spd: 25 },
    moves: [7, 29, 26, 45], catchRate: 190, xpYield: 70,
  },
  50: {
    id: 50, name: 'Diglett', types: ['Ground'],
    baseStats: { hp: 10, atk: 55, def: 25, spAtk: 35, spDef: 45, spd: 95 },
    moves: [7, 49, 53], catchRate: 255, xpYield: 81,
  },
  52: {
    id: 52, name: 'Meowth', types: ['Normal'],
    baseStats: { hp: 40, atk: 45, def: 35, spAtk: 40, spDef: 40, spd: 90 },
    moves: [7, 2, 36, 18], catchRate: 255, xpYield: 69,
  },
  54: {
    id: 54, name: 'Psyduck', types: ['Water'],
    baseStats: { hp: 50, atk: 52, def: 48, spAtk: 65, spDef: 50, spd: 55 },
    moves: [7, 25, 14], catchRate: 190, xpYield: 80,
  },
  56: {
    id: 56, name: 'Mankey', types: ['Fighting'],
    baseStats: { hp: 40, atk: 80, def: 35, spAtk: 35, spDef: 45, spd: 70 },
    moves: [7, 37, 43, 32], catchRate: 190, xpYield: 74,
  },
  60: {
    id: 60, name: 'Poliwag', types: ['Water'],
    baseStats: { hp: 40, atk: 50, def: 40, spAtk: 40, spDef: 40, spd: 90 },
    moves: [14, 42, 15], catchRate: 255, xpYield: 60,
  },
  63: {
    id: 63, name: 'Abra', types: ['Psychic'],
    baseStats: { hp: 25, atk: 20, def: 15, spAtk: 105, spDef: 55, spd: 90 },
    moves: [25, 24], catchRate: 200, xpYield: 73,
  },
  74: {
    id: 74, name: 'Geodude', types: ['Rock', 'Ground'],
    baseStats: { hp: 40, atk: 80, def: 100, spAtk: 30, spDef: 30, spd: 20 },
    moves: [1, 34, 28], catchRate: 255, xpYield: 73,
  },
  92: {
    id: 92, name: 'Gastly', types: ['Ghost', 'Poison'],
    baseStats: { hp: 30, atk: 35, def: 30, spAtk: 100, spDef: 35, spd: 80 },
    moves: [33, 25, 47], catchRate: 190, xpYield: 95,
  },
  100: {
    id: 100, name: 'Voltorb', types: ['Electric'],
    baseStats: { hp: 40, atk: 30, def: 50, spAtk: 55, spDef: 55, spd: 100 },
    moves: [19, 48, 17, 20], catchRate: 190, xpYield: 66,
  },
  104: {
    id: 104, name: 'Cubone', types: ['Ground'],
    baseStats: { hp: 50, atk: 50, def: 95, spAtk: 40, spDef: 50, spd: 35 },
    moves: [1, 34, 50], catchRate: 190, xpYield: 87,
  },
  109: {
    id: 109, name: 'Koffing', types: ['Poison'],
    baseStats: { hp: 40, atk: 65, def: 95, spAtk: 60, spDef: 45, spd: 35 },
    moves: [1, 27, 48, 41], catchRate: 190, xpYield: 114,
  },
  129: {
    id: 129, name: 'Magikarp', types: ['Water'],
    baseStats: { hp: 20, atk: 10, def: 55, spAtk: 15, spDef: 20, spd: 80 },
    moves: [40], catchRate: 255, xpYield: 20,
  },
};

export const AREAS = {
  'Route 1': {
    label: 'Route 1',
    minLevel: 2, maxLevel: 5, unlockLevel: 1,
    encounters: [
      { dexId: 16, weight: 45 },
      { dexId: 19, weight: 45 },
      { dexId: 10, weight: 5 },
      { dexId: 13, weight: 5 },
    ],
  },
  'Viridian Forest': {
    label: 'Viridian Forest',
    minLevel: 4, maxLevel: 9, unlockLevel: 5,
    encounters: [
      { dexId: 10, weight: 30 },
      { dexId: 13, weight: 30 },
      { dexId: 16, weight: 20 },
      { dexId: 25, weight: 15 },
      { dexId: 46, weight: 5 },
    ],
  },
  'Mt. Moon': {
    label: 'Mt. Moon',
    minLevel: 8, maxLevel: 14, unlockLevel: 10,
    encounters: [
      { dexId: 41, weight: 40 },
      { dexId: 74, weight: 30 },
      { dexId: 35, weight: 20 },
      { dexId: 46, weight: 10 },
    ],
  },
  'Cerulean Route': {
    label: 'Cerulean Route',
    minLevel: 14, maxLevel: 22, unlockLevel: 15,
    encounters: [
      { dexId: 54, weight: 30 },
      { dexId: 60, weight: 30 },
      { dexId: 129, weight: 20 },
      { dexId: 39, weight: 15 },
      { dexId: 63, weight: 5 },
    ],
  },
  'Power Plant': {
    label: 'Power Plant',
    minLevel: 24, maxLevel: 35, unlockLevel: 25,
    encounters: [
      { dexId: 100, weight: 40 },
      { dexId: 25, weight: 30 },
      { dexId: 52, weight: 20 },
      { dexId: 63, weight: 10 },
    ],
  },
};

export function getRandomEncounter(areaName) {
  const area = AREAS[areaName];
  if (!area) return null;
  const total = area.encounters.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * total;
  for (const enc of area.encounters) {
    roll -= enc.weight;
    if (roll <= 0) {
      const level = area.minLevel + Math.floor(Math.random() * (area.maxLevel - area.minLevel + 1));
      return { dexId: enc.dexId, level };
    }
  }
  const last = area.encounters[area.encounters.length - 1];
  return { dexId: last.dexId, level: area.minLevel };
}
