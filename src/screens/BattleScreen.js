import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { calcDamage, checkAccuracy, tryCatch, tryEscape, applyStatStage, statusLabel } from '../utils/battleCalc';
import { calcXPForLevel, levelUpPokemon } from '../utils/pokemonFactory';
import HPBar from '../components/HPBar';
import PokemonSprite from '../components/PokemonSprite';

const TYPE_COLORS = {
  Normal:'#a8a878', Fire:'#e2621b', Water:'#4a90d9', Grass:'#5db85a',
  Electric:'#f8c800', Ice:'#98d8d8', Fighting:'#c03028', Poison:'#a040a0',
  Ground:'#e0c068', Flying:'#a890f0', Psychic:'#f85888', Bug:'#a8b820',
  Rock:'#b8a038', Ghost:'#705898', Dragon:'#7038f8', Dark:'#705848', Steel:'#b8b8d0',
};

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

// Returns a random move (avoiding moves with 0 PP)
function pickWildMove(pokemon) {
  const usable = pokemon.moves.filter(m => m.currentPP > 0);
  if (usable.length === 0) return pokemon.moves[0]; // struggle fallback
  return usable[Math.floor(Math.random() * usable.length)];
}

function applyEndOfTurnStatus(pokemon) {
  let msgs = [];
  let mon = { ...pokemon };
  if (mon.status === 'burn' || mon.status === 'poison') {
    const dmg = Math.max(1, Math.floor(mon.stats.hp / 8));
    mon.currentHP = Math.max(0, mon.currentHP - dmg);
    msgs.push(`${mon.name} is hurt by ${mon.status === 'burn' ? 'its burn' : 'poison'}! (${dmg} dmg)`);
  }
  if (mon.status === 'sleep') {
    mon.statusTurns = (mon.statusTurns ?? 0) + 1;
    if (mon.statusTurns >= 3) { mon.status = null; mon.statusTurns = 0; msgs.push(`${mon.name} woke up!`); }
  }
  if (mon.status === 'freeze') {
    if (Math.random() < 0.2) { mon.status = null; msgs.push(`${mon.name} thawed out!`); }
  }
  return { mon, msgs };
}

export default function BattleScreen({ navigation, route }) {
  const { party, replaceParty, bag, usePokeball } = useGame();
  const { wildPokemon } = route.params;

  // Find lead (first alive party member)
  const leadIdx = party.findIndex(p => p.currentHP > 0);
  const [partyState, setPartyState] = useState(() => party.map(deepClone));
  const [activeIdx, setActiveIdx] = useState(leadIdx >= 0 ? leadIdx : 0);
  const [wildMon, setWildMon] = useState(() => deepClone(wildPokemon));
  const [escapeAttempts, setEscapeAttempts] = useState(0);

  // Message queue
  const [messages, setMessages] = useState([`A wild ${wildPokemon.name} appeared!`]);
  const [msgIdx, setMsgIdx] = useState(0);

  // Phase: 'reading' | 'menu' | 'fight' | 'bag' | 'pokemon' | 'end'
  const [phase, setPhase] = useState('reading');
  const [pendingPhase, setPendingPhase] = useState('menu');
  const [battleOver, setBattleOver] = useState(false);
  const [endResult, setEndResult] = useState(null); // 'win'|'caught'|'run'|'lost'

  const playerMon = partyState[activeIdx];
  const spriteShake = useRef(new Animated.Value(0)).current;

  function shakeSprite() {
    Animated.sequence([
      Animated.timing(spriteShake, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(spriteShake, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(spriteShake, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(spriteShake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function pushMessages(newMsgs, next) {
    setMessages(newMsgs);
    setMsgIdx(0);
    setPendingPhase(next);
    setPhase('reading');
  }

  function advanceMessage() {
    if (msgIdx < messages.length - 1) {
      setMsgIdx(i => i + 1);
    } else {
      if (pendingPhase === 'end') {
        finalizeBattle();
      } else {
        setPhase(pendingPhase);
        setMessages([]);
        setMsgIdx(0);
      }
    }
  }

  function finalizeBattle() {
    // Sync partyState back to global context
    replaceParty(partyState.map(deepClone));
    setBattleOver(true);
  }

  // --- Action handlers ---

  function handleFight(move) {
    if (move.currentPP === 0) return;
    setPhase('animating');

    let msgs = [];
    let newPlayer = deepClone(playerMon);
    let newWild = deepClone(wildMon);

    // --- Player turn ---
    // Paralysis skip
    if (newPlayer.status === 'paralysis' && Math.random() < 0.25) {
      msgs.push(`${newPlayer.name} is paralyzed and can't move!`);
    } else if (newPlayer.status === 'sleep') {
      msgs.push(`${newPlayer.name} is fast asleep!`);
    } else if (newPlayer.status === 'freeze') {
      msgs.push(`${newPlayer.name} is frozen solid!`);
    } else {
      msgs.push(`${newPlayer.name} used ${move.name}!`);
      // Deduct PP
      const mIdx = newPlayer.moves.findIndex(m => m.id === move.id);
      if (mIdx >= 0) newPlayer.moves[mIdx].currentPP = Math.max(0, move.currentPP - 1);

      if (move.category === 'Status') {
        // Apply status effect
        const eff = move.effect;
        if (eff) {
          if (eff.kind === 'stat') {
            newWild = applyStatStage(newWild, eff.stat, eff.stages);
            const dir = eff.stages > 0 ? 'rose' : 'fell';
            msgs.push(`${newWild.name}'s ${eff.stat.toUpperCase()} ${dir}!`);
          } else if (eff.kind === 'status') {
            if (!newWild.status) {
              newWild.status = eff.status;
              msgs.push(`${newWild.name} fell ${eff.status === 'sleep' ? 'asleep' : `into ${eff.status}`}!`);
            } else {
              msgs.push("But it had no effect!");
            }
          } else if (eff.kind === 'leech_seed') {
            msgs.push(`${newWild.name} was seeded!`);
          }
        } else {
          msgs.push("But nothing happened!");
        }
      } else {
        // Accuracy check
        if (!checkAccuracy(move, newPlayer, newWild)) {
          msgs.push(`${newWild.name} avoided the attack!`);
        } else {
          const result = calcDamage(newPlayer, newWild, move);
          if (result.typeMultiplier === 0) {
            msgs.push("It had no effect!");
          } else {
            if (result.isCrit) msgs.push("A critical hit!");
            if (result.typeText) msgs.push(result.typeText);
            newWild.currentHP = Math.max(0, newWild.currentHP - result.damage);
            msgs.push(`${newWild.name} took ${result.damage} damage!`);

            if (result.drain && result.drainHeal > 0) {
              newPlayer.currentHP = Math.min(newPlayer.stats.hp, newPlayer.currentHP + result.drainHeal);
              msgs.push(`${newPlayer.name} restored ${result.drainHeal} HP!`);
            }

            // Apply move effect
            const eff = move.effect;
            if (eff && newWild.currentHP > 0) {
              const roll = eff.chance ? Math.random() * 100 < eff.chance : true;
              if (roll) {
                if (eff.kind === 'status' && !newWild.status) {
                  newWild.status = eff.status;
                  msgs.push(`${newWild.name} was ${eff.status === 'paralysis' ? 'paralyzed' : eff.status === 'burn' ? 'burned' : eff.status + 'ed'}!`);
                } else if (eff.kind === 'stat') {
                  newWild = applyStatStage(newWild, eff.stat, eff.stages);
                  const dir = eff.stages > 0 ? 'rose' : 'fell';
                  msgs.push(`${newWild.name}'s ${eff.stat.toUpperCase()} ${dir}!`);
                }
              }
            }
          }
        }
      }

      if (newWild.currentHP <= 0) {
        msgs.push(`${newWild.name} fainted!`);
        // XP gain
        const xpGained = Math.max(1, Math.floor((newWild.xpYield * newWild.level) / 7));
        msgs.push(`${newPlayer.name} gained ${xpGained} XP!`);
        newPlayer.currentXP = (newPlayer.currentXP ?? 0) + xpGained;

        // Level ups
        while (newPlayer.currentXP >= newPlayer.xpToNext && newPlayer.level < 100) {
          newPlayer = levelUpPokemon(newPlayer);
          msgs.push(`${newPlayer.name} grew to level ${newPlayer.level}!`);
        }

        setWildMon(newWild);
        setPartyState(prev => {
          const next = [...prev];
          next[activeIdx] = newPlayer;
          return next;
        });
        pushMessages(msgs, 'end');
        setEndResult('win');
        return;
      }
    }

    // --- Wild turn ---
    const wildMove = pickWildMove(newWild);
    if (newWild.status === 'paralysis' && Math.random() < 0.25) {
      msgs.push(`${newWild.name} is paralyzed and can't move!`);
    } else if (newWild.status === 'sleep') {
      msgs.push(`${newWild.name} is fast asleep!`);
    } else if (newWild.status === 'freeze') {
      msgs.push(`${newWild.name} is frozen solid!`);
    } else if (wildMove.category === 'Status') {
      // Wild uses status move
      const wildMoveIdx = newWild.moves.findIndex(m => m.id === wildMove.id);
      if (wildMoveIdx >= 0) newWild.moves[wildMoveIdx].currentPP = Math.max(0, wildMove.currentPP - 1);
      msgs.push(`${newWild.name} used ${wildMove.name}!`);
      const eff = wildMove.effect;
      if (eff?.kind === 'stat' && eff.target === 'foe') {
        newPlayer = applyStatStage(newPlayer, eff.stat, eff.stages);
        msgs.push(`${newPlayer.name}'s ${eff.stat.toUpperCase()} fell!`);
      } else {
        msgs.push("But nothing happened!");
      }
    } else {
      msgs.push(`${newWild.name} used ${wildMove.name}!`);
      const wildMoveIdx = newWild.moves.findIndex(m => m.id === wildMove.id);
      if (wildMoveIdx >= 0) newWild.moves[wildMoveIdx].currentPP = Math.max(0, wildMove.currentPP - 1);

      if (wildMove.power && !checkAccuracy(wildMove, newWild, newPlayer)) {
        msgs.push(`${newPlayer.name} avoided the attack!`);
      } else if (wildMove.power) {
        const result = calcDamage(newWild, newPlayer, wildMove);
        if (result.typeMultiplier === 0) {
          msgs.push("It had no effect!");
        } else {
          if (result.isCrit) msgs.push("A critical hit!");
          if (result.typeText) msgs.push(result.typeText);
          newPlayer.currentHP = Math.max(0, newPlayer.currentHP - result.damage);
          msgs.push(`${newPlayer.name} took ${result.damage} damage!`);

          const eff = wildMove.effect;
          if (eff && newPlayer.currentHP > 0) {
            const roll = eff.chance ? Math.random() * 100 < eff.chance : true;
            if (roll && eff.kind === 'status' && !newPlayer.status) {
              newPlayer.status = eff.status;
              msgs.push(`${newPlayer.name} was ${eff.status}!`);
            }
          }
        }
      }
    }

    // --- End of turn status effects ---
    const playerEOT = applyEndOfTurnStatus(newPlayer);
    newPlayer = playerEOT.mon;
    msgs.push(...playerEOT.msgs);

    const wildEOT = applyEndOfTurnStatus(newWild);
    newWild = wildEOT.mon;
    msgs.push(...wildEOT.msgs);

    if (newPlayer.currentHP <= 0) {
      msgs.push(`${newPlayer.name} fainted!`);
      const nextAlive = partyState.findIndex((p, i) => i !== activeIdx && p.currentHP > 0);
      if (nextAlive >= 0) {
        setPartyState(prev => { const n=[...prev]; n[activeIdx]=newPlayer; return n; });
        setWildMon(newWild);
        setActiveIdx(nextAlive);
        msgs.push(`Go, ${partyState[nextAlive].name}!`);
        pushMessages(msgs, 'menu');
      } else {
        msgs.push("You have no more Pokemon left...");
        msgs.push("You blacked out!");
        setPartyState(prev => {
          const n = [...prev];
          n[activeIdx] = newPlayer;
          return n;
        });
        setWildMon(newWild);
        pushMessages(msgs, 'end');
        setEndResult('lost');
      }
      return;
    }

    if (newWild.currentHP <= 0) {
      msgs.push(`${newWild.name} fainted!`);
      setWildMon(newWild);
      setPartyState(prev => { const n=[...prev]; n[activeIdx]=newPlayer; return n; });
      pushMessages(msgs, 'end');
      setEndResult('win');
      return;
    }

    shakeSprite();
    setWildMon(newWild);
    setPartyState(prev => { const n=[...prev]; n[activeIdx]=newPlayer; return n; });
    pushMessages(msgs, 'menu');
  }

  function handleBag() {
    if (bag.pokeballs <= 0) {
      pushMessages(["You're out of Poke Balls!"], 'menu');
      return;
    }
    usePokeball();
    const caught = tryCatch(wildMon);
    const msgs = [`You threw a Poke Ball...`];
    if (caught) {
      msgs.push(`...`);
      msgs.push(`Gotcha! ${wildMon.name} was caught!`);
      setEndResult('caught');
      pushMessages(msgs, 'end');
    } else {
      msgs.push(`${wildMon.name} broke free!`);
      pushMessages(msgs, 'menu');
    }
  }

  function handleRun() {
    const player = partyState[activeIdx];
    const newAttempts = escapeAttempts + 1;
    setEscapeAttempts(newAttempts);
    const fled = tryEscape(player.stats.spd, wildMon.stats.spd, newAttempts);
    if (fled) {
      setEndResult('run');
      pushMessages(["Got away safely!"], 'end');
    } else {
      pushMessages(["Can't escape!"], 'menu');
    }
  }

  function handlePokemonSwitch(idx) {
    if (idx === activeIdx) return;
    const target = partyState[idx];
    if (target.currentHP <= 0) return;
    setActiveIdx(idx);
    setPhase('menu');
  }

  // After battle is over
  useEffect(() => {
    if (battleOver) {
      if (endResult === 'caught') {
        const newParty = [...partyState];
        if (newParty.length < 6) {
          const caughtMon = deepClone(wildMon);
          caughtMon.currentHP = Math.max(1, Math.floor(wildMon.stats.hp * 0.3));
          newParty.push(caughtMon);
        }
        replaceParty(newParty);
      } else {
        replaceParty(partyState.map(p => {
          if (endResult === 'lost') {
            // Heal to 30% on blackout
            return { ...p, currentHP: Math.max(1, Math.floor(p.stats.hp * 0.3)), status: null };
          }
          return p;
        }));
      }
      navigation.goBack();
    }
  }, [battleOver]);

  // --- Render helpers ---

  const hpColor = (mon) => {
    const pct = mon.currentHP / mon.stats.hp;
    return pct > 0.5 ? '#44dd44' : pct > 0.25 ? '#f8c800' : '#f83800';
  };

  function renderStatusBadge(mon) {
    if (!mon.status) return null;
    const label = statusLabel(mon.status);
    const colors = { burn:'#e2621b', poison:'#a040a0', paralysis:'#f8c800', sleep:'#7088a0', freeze:'#98d8d8', confusion:'#f85888' };
    return (
      <View style={[styles.statusBadge, { backgroundColor: colors[mon.status] ?? '#888' }]}>
        <Text style={styles.statusText}>{label}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Wild Pokemon info (top) */}
      <View style={styles.wildBox}>
        <View style={styles.wildInfo}>
          <View style={styles.monNameRow}>
            <Text style={styles.monName}>{wildMon.name}</Text>
            {renderStatusBadge(wildMon)}
          </View>
          <Text style={styles.monLevel}>Lv. {wildMon.level}</Text>
          <View style={styles.hpRow}>
            <Text style={styles.hpLabel}>HP</Text>
            <View style={styles.hpBarWrap}>
              <HPBar current={wildMon.currentHP} max={wildMon.stats.hp} />
            </View>
          </View>
          <View style={styles.typesRow}>
            {wildMon.types.map(t => (
              <View key={t} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[t] ?? '#888' }]}>
                <Text style={styles.typeText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
        <Animated.View style={{ transform: [{ translateX: spriteShake }] }}>
          <PokemonSprite dexId={wildMon.dexId} isFront={true} size={90} />
        </Animated.View>
      </View>

      {/* Player Pokemon info (bottom-left) */}
      <View style={styles.playerBox}>
        <PokemonSprite dexId={playerMon.dexId} isFront={false} size={90} />
        <View style={styles.playerInfo}>
          <View style={styles.monNameRow}>
            <Text style={styles.monName}>{playerMon.name}</Text>
            {renderStatusBadge(playerMon)}
          </View>
          <Text style={styles.monLevel}>Lv. {playerMon.level}</Text>
          <View style={styles.hpRow}>
            <Text style={styles.hpLabel}>HP</Text>
            <View style={styles.hpBarWrap}>
              <HPBar current={playerMon.currentHP} max={playerMon.stats.hp} />
            </View>
          </View>
          <Text style={[styles.hpNumbers, { color: hpColor(playerMon) }]}>
            {playerMon.currentHP}/{playerMon.stats.hp}
          </Text>
          {/* XP bar */}
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, {
              width: `${Math.min(100, Math.floor(
                ((playerMon.currentXP - calcXPForLevel(playerMon.level)) /
                 (playerMon.xpToNext - calcXPForLevel(playerMon.level))) * 100
              ))}%`
            }]} />
          </View>
        </View>
      </View>

      {/* Battle interface */}
      <View style={styles.interfaceBox}>
        {phase === 'reading' && (
          <TouchableOpacity style={styles.msgBox} onPress={advanceMessage} activeOpacity={0.7}>
            <Text style={styles.msgText}>{messages[msgIdx]}</Text>
            {msgIdx < messages.length - 1
              ? <Text style={styles.tapHint}>▼ tap</Text>
              : <Text style={styles.tapHint}>▼ tap to continue</Text>
            }
          </TouchableOpacity>
        )}

        {phase === 'menu' && (
          <View style={styles.menuWrap}>
            <Text style={styles.menuPrompt}>What will {playerMon.name} do?</Text>
            <View style={styles.menuGrid}>
              {[
                { label: 'FIGHT',   icon: '⚔️',  onPress: () => setPhase('fight') },
                { label: 'BAG',     icon: '🎒',  onPress: handleBag },
                { label: 'POKEMON', icon: '🏆',  onPress: () => setPhase('pokemon') },
                { label: 'RUN',     icon: '👟',  onPress: handleRun },
              ].map(btn => (
                <TouchableOpacity key={btn.label} style={styles.menuBtn} onPress={btn.onPress}>
                  <Text style={styles.menuBtnIcon}>{btn.icon}</Text>
                  <Text style={styles.menuBtnLabel}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.bagCount}>Poke Balls: {bag.pokeballs}</Text>
          </View>
        )}

        {phase === 'fight' && (
          <View style={styles.fightWrap}>
            <View style={styles.moveGrid}>
              {playerMon.moves.map(move => (
                <TouchableOpacity
                  key={move.id}
                  style={[styles.moveBtn, { borderColor: TYPE_COLORS[move.type] ?? '#555' }, move.currentPP === 0 && styles.moveBtnDepleted]}
                  onPress={() => handleFight(move)}
                  disabled={move.currentPP === 0}
                >
                  <View style={styles.moveTop}>
                    <Text style={styles.moveName}>{move.name}</Text>
                    <View style={[styles.moveTypeBadge, { backgroundColor: TYPE_COLORS[move.type] ?? '#888' }]}>
                      <Text style={styles.moveTypeText}>{move.type}</Text>
                    </View>
                  </View>
                  <Text style={[styles.movePP, move.currentPP === 0 && { color: '#f83800' }]}>
                    PP {move.currentPP}/{move.maxPP}
                  </Text>
                  {move.power > 0 && <Text style={styles.movePower}>PWR {move.power}</Text>}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.backBtn} onPress={() => setPhase('menu')}>
              <Text style={styles.backBtnText}>← BACK</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'pokemon' && (
          <View style={styles.pokemonWrap}>
            <Text style={styles.switchTitle}>Switch Pokemon</Text>
            {partyState.map((mon, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.switchRow,
                  i === activeIdx && styles.switchRowActive,
                  mon.currentHP === 0 && styles.switchRowFainted,
                ]}
                onPress={() => handlePokemonSwitch(i)}
                disabled={i === activeIdx || mon.currentHP === 0}
              >
                <Text style={styles.switchName}>{mon.name} Lv{mon.level}</Text>
                <Text style={[styles.switchHP, mon.currentHP === 0 && { color: '#f83800' }]}>
                  {mon.currentHP}/{mon.stats.hp}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.backBtn} onPress={() => setPhase('menu')}>
              <Text style={styles.backBtnText}>← BACK</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'animating' && (
          <View style={styles.msgBox}>
            <Text style={styles.msgText}>...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#1a1a2e' },
  wildBox: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#e8f5e9', padding: 12, marginHorizontal: 0,
    borderBottomWidth: 3, borderBottomColor: '#1a1a2e',
  },
  wildInfo:     { flex: 1 },
  playerBox: {
    flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',
    backgroundColor: '#d0e8ff', padding: 12,
    borderBottomWidth: 3, borderBottomColor: '#1a1a2e',
  },
  playerInfo:   { flex: 1, marginLeft: 8 },
  monNameRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monName:      { fontSize: 17, fontWeight: '800', color: '#111' },
  monLevel:     { fontSize: 12, color: '#555', marginBottom: 2 },
  hpRow:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hpLabel:      { fontSize: 11, fontWeight: '700', color: '#333', width: 20 },
  hpBarWrap:    { flex: 1 },
  hpNumbers:    { fontSize: 12, fontWeight: '700', textAlign: 'right', marginTop: 1 },
  xpTrack:      { height: 4, backgroundColor: '#999', borderRadius: 2, overflow: 'hidden', marginTop: 3 },
  xpFill:       { height: '100%', backgroundColor: '#4080ff', borderRadius: 2 },
  typesRow:     { flexDirection: 'row', gap: 4, marginTop: 4 },
  typeBadge:    { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5 },
  typeText:     { color: '#fff', fontSize: 9, fontWeight: '700' },
  statusBadge:  { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  statusText:   { color: '#fff', fontSize: 9, fontWeight: '700' },
  interfaceBox: { flex: 1, backgroundColor: '#0d0d1f' },
  msgBox: {
    flex: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 2, borderTopColor: '#333',
  },
  msgText:      { color: '#fff', fontSize: 18, fontWeight: '600', lineHeight: 26 },
  tapHint:      { color: '#888', fontSize: 12, marginTop: 10, textAlign: 'right' },
  menuWrap:     { flex: 1, padding: 12 },
  menuPrompt:   { color: '#fff', fontSize: 15, marginBottom: 10, fontWeight: '600' },
  menuGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  menuBtn: {
    width: '47%', backgroundColor: '#1a2a5e', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#334',
  },
  menuBtnIcon:  { fontSize: 22, marginBottom: 4 },
  menuBtnLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
  bagCount:     { color: '#aaa', fontSize: 12, marginTop: 10, textAlign: 'center' },
  fightWrap:    { flex: 1, padding: 10 },
  moveGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moveBtn: {
    width: '47%', backgroundColor: '#141428', borderRadius: 12,
    padding: 10, borderWidth: 2,
  },
  moveBtnDepleted: { opacity: 0.4 },
  moveTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  moveName:     { color: '#fff', fontSize: 13, fontWeight: '700', flex: 1 },
  moveTypeBadge:{ paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  moveTypeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  movePP:       { color: '#aaa', fontSize: 11 },
  movePower:    { color: '#f8c800', fontSize: 11, marginTop: 2 },
  backBtn:      { backgroundColor: '#333', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 10 },
  backBtnText:  { color: '#fff', fontSize: 14, fontWeight: '700' },
  pokemonWrap:  { flex: 1, padding: 12 },
  switchTitle:  { color: '#f8c800', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#141428', borderRadius: 10, padding: 12, marginBottom: 6,
    borderWidth: 1, borderColor: '#333',
  },
  switchRowActive:  { borderColor: '#f8c800', backgroundColor: '#2a2a10' },
  switchRowFainted: { opacity: 0.4 },
  switchName:   { color: '#fff', fontSize: 14, fontWeight: '600' },
  switchHP:     { color: '#44dd44', fontSize: 13, fontWeight: '700' },
});
