import { POKEMON } from '../data/pokemon';
import { MOVES } from '../data/moves';

function calcStat(base, level, isHP) {
  if (isHP) return Math.floor((base * 2 * level) / 100) + level + 10;
  return Math.floor((base * 2 * level) / 100) + 5;
}

export function calcXPForLevel(level) {
  return Math.floor(Math.pow(level, 3)); // medium-fast
}

export function createPokemon(dexId, level) {
  const base = POKEMON[dexId];
  if (!base) throw new Error(`Unknown dexId: ${dexId}`);

  const stats = {
    hp:    calcStat(base.baseStats.hp,    level, true),
    atk:   calcStat(base.baseStats.atk,   level, false),
    def:   calcStat(base.baseStats.def,   level, false),
    spAtk: calcStat(base.baseStats.spAtk, level, false),
    spDef: calcStat(base.baseStats.spDef, level, false),
    spd:   calcStat(base.baseStats.spd,   level, false),
  };

  const moves = base.moves.map(id => ({ ...MOVES[id], currentPP: MOVES[id].pp }));

  return {
    dexId,
    name: base.name,
    types: [...base.types],
    level,
    stats,
    currentHP: stats.hp,
    status: null,       // 'burn'|'poison'|'paralysis'|'sleep'|'freeze'|'confusion'
    statusTurns: 0,
    moves,
    catchRate: base.catchRate,
    xpYield: base.xpYield,
    currentXP: calcXPForLevel(level),
    xpToNext:  calcXPForLevel(level + 1),
    stages: { atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0, acc: 0, eva: 0 },
  };
}

export function levelUpPokemon(pokemon) {
  const base = POKEMON[pokemon.dexId];
  const newLevel = pokemon.level + 1;

  const newStats = {
    hp:    calcStat(base.baseStats.hp,    newLevel, true),
    atk:   calcStat(base.baseStats.atk,   newLevel, false),
    def:   calcStat(base.baseStats.def,   newLevel, false),
    spAtk: calcStat(base.baseStats.spAtk, newLevel, false),
    spDef: calcStat(base.baseStats.spDef, newLevel, false),
    spd:   calcStat(base.baseStats.spd,   newLevel, false),
  };

  const hpGain = newStats.hp - pokemon.stats.hp;

  return {
    ...pokemon,
    level: newLevel,
    stats: newStats,
    currentHP: Math.min(pokemon.currentHP + hpGain, newStats.hp),
    currentXP: calcXPForLevel(newLevel),
    xpToNext:  calcXPForLevel(newLevel + 1),
  };
}
