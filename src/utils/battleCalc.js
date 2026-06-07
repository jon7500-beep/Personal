import { getTypeEffectiveness, getEffectivenessText } from '../data/typeChart';

const STAGE_MULT = [0.25, 0.28, 0.33, 0.4, 0.5, 0.66, 1, 1.5, 2, 2.5, 3, 3.5, 4];

function stageMultiplier(stage) {
  return STAGE_MULT[Math.max(0, Math.min(12, stage + 6))];
}

export function calcDamage(attacker, defender, move) {
  if (!move.power || move.category === 'Status') return { damage: 0, typeMultiplier: 1, typeText: null, isCrit: false };

  const isPhys = move.category === 'Physical';
  let atk = isPhys ? attacker.stats.atk : attacker.stats.spAtk;
  let def = isPhys ? defender.stats.def  : defender.stats.spDef;

  atk *= stageMultiplier(isPhys ? attacker.stages.atk : attacker.stages.spAtk);
  def *= stageMultiplier(isPhys ? defender.stages.def  : defender.stages.spDef);

  if (attacker.status === 'burn' && isPhys) atk *= 0.5;
  if (defender.status === 'paralysis') def *= 1; // no def change for paralysis

  const typeMultiplier = getTypeEffectiveness(move.type, defender.types);
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;
  const critChance = move.highCrit ? 1 / 8 : 1 / 16;
  const isCrit = Math.random() < critChance;
  const critMult = isCrit ? 1.5 : 1;
  const rng = (Math.floor(Math.random() * 16) + 85) / 100;

  const raw = Math.floor(
    (((2 * attacker.level * move.power * atk) / def / 50) + 2)
    * stab * typeMultiplier * critMult * rng
  );

  let damage = Math.max(typeMultiplier === 0 ? 0 : 1, raw);

  let drainHeal = 0;
  if (move.drain) drainHeal = Math.floor(damage / 2);

  return {
    damage,
    drainHeal,
    typeMultiplier,
    typeText: getEffectivenessText(typeMultiplier),
    isCrit,
  };
}

export function checkAccuracy(move, attacker, defender) {
  if (move.accuracy == null) return true;
  const accMult = stageMultiplier(attacker.stages.acc);
  const evaMult = stageMultiplier(-defender.stages.eva);
  return Math.random() * 100 < move.accuracy * accMult * evaMult;
}

export function tryCatch(pokemon, ballBonus = 1) {
  const hpFraction = pokemon.currentHP / pokemon.stats.hp;
  const statusBonus = (pokemon.status === 'sleep' || pokemon.status === 'freeze') ? 2
                    : pokemon.status ? 1.5 : 1;
  const rate = pokemon.catchRate * ballBonus * statusBonus * (1 - hpFraction * 0.7);
  const shakes = Math.floor(rate);
  // Shake check × 4 (simplified to single roll)
  return Math.random() * 255 < shakes;
}

export function tryEscape(playerSpd, wildSpd, escapeAttempts) {
  if (playerSpd >= wildSpd) return true;
  const odds = Math.floor((playerSpd * 128) / wildSpd) + 30 * escapeAttempts;
  return Math.random() * 256 < odds;
}

export function applyStatStage(pokemon, stat, stages) {
  const cur = pokemon.stages[stat] ?? 0;
  const next = Math.max(-6, Math.min(6, cur + stages));
  return { ...pokemon, stages: { ...pokemon.stages, [stat]: next } };
}

export function statusLabel(status) {
  const map = { burn: 'BRN', poison: 'PSN', paralysis: 'PAR', sleep: 'SLP', freeze: 'FRZ', confusion: 'CNF' };
  return map[status] ?? '';
}
