import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { calcXPForLevel } from '../utils/pokemonFactory';
import HPBar from '../components/HPBar';
import PokemonSprite from '../components/PokemonSprite';

const TYPE_COLORS = {
  Normal:'#a8a878', Fire:'#e2621b', Water:'#4a90d9', Grass:'#5db85a',
  Electric:'#f8c800', Ice:'#98d8d8', Fighting:'#c03028', Poison:'#a040a0',
  Ground:'#e0c068', Flying:'#a890f0', Psychic:'#f85888', Bug:'#a8b820',
  Rock:'#b8a038', Ghost:'#705898', Dragon:'#7038f8', Dark:'#705848', Steel:'#b8b8d0',
};

function StatBar({ value, max = 250, label }) {
  const pct = Math.min(1, value / max);
  const color = pct > 0.66 ? '#44dd44' : pct > 0.33 ? '#f8c800' : '#f83800';
  return (
    <View style={sb.row}>
      <Text style={sb.label}>{label}</Text>
      <View style={sb.track}>
        <View style={[sb.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: color }]} />
      </View>
      <Text style={sb.value}>{value}</Text>
    </View>
  );
}

const sb = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  label: { color: '#aaa', fontSize: 11, width: 48 },
  track: { flex: 1, height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden', marginHorizontal: 6 },
  fill:  { height: '100%', borderRadius: 3 },
  value: { color: '#fff', fontSize: 11, width: 28, textAlign: 'right' },
});

export default function PartyScreen({ navigation }) {
  const { party, replaceParty } = useGame();
  const [selected, setSelected] = useState(null);

  const mon = selected != null ? party[selected] : null;

  function healAll() {
    const healed = party.map(p => ({
      ...p,
      currentHP: p.stats.hp,
      status: null,
      statusTurns: 0,
      moves: p.moves.map(m => ({ ...m, currentPP: m.maxPP })),
    }));
    replaceParty(healed);
  }

  const xpProgress = (mon) => {
    if (!mon) return 0;
    const base = calcXPForLevel(mon.level);
    const next = mon.xpToNext;
    const cur = mon.currentXP;
    if (next === base) return 100;
    return Math.round(((cur - base) / (next - base)) * 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Party</Text>
        <TouchableOpacity onPress={healAll}>
          <Text style={styles.healBtn}>Heal All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {party.map((p, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.card, p.currentHP === 0 && styles.cardFainted]}
            onPress={() => setSelected(i)}
            activeOpacity={0.85}
          >
            <PokemonSprite dexId={p.dexId} isFront={true} size={64} />
            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.monName}>{p.name}</Text>
                <Text style={styles.monLevel}>Lv.{p.level}</Text>
                {p.status && (
                  <View style={[styles.statusBadge, { backgroundColor: '#a040a0' }]}>
                    <Text style={styles.statusText}>{p.status.toUpperCase().slice(0,3)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.typesRow}>
                {p.types.map(t => (
                  <View key={t} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[t] ?? '#888' }]}>
                    <Text style={styles.typeText}>{t}</Text>
                  </View>
                ))}
              </View>
              <HPBar current={p.currentHP} max={p.stats.hp} showNumbers />
              <Text style={styles.hpNums}>{p.currentHP}/{p.stats.hp} HP</Text>
            </View>
          </TouchableOpacity>
        ))}

        {party.length === 0 && (
          <Text style={styles.emptyText}>Your party is empty!</Text>
        )}
      </ScrollView>

      {/* Pokemon detail modal */}
      <Modal visible={mon != null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {mon && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <PokemonSprite dexId={mon.dexId} isFront={true} size={100} />
                  <View style={styles.modalName}>
                    <Text style={styles.modalMonName}>{mon.name}</Text>
                    <Text style={styles.modalLevel}>Level {mon.level}</Text>
                    <View style={styles.typesRow}>
                      {mon.types.map(t => (
                        <View key={t} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[t] ?? '#888' }]}>
                          <Text style={styles.typeText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>HP</Text>
                  <HPBar current={mon.currentHP} max={mon.stats.hp} showNumbers />
                  <Text style={styles.xpText}>XP to next level: {xpProgress(mon)}%</Text>
                  <View style={styles.xpTrack}>
                    <View style={[styles.xpFill, { width: `${xpProgress(mon)}%` }]} />
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Stats</Text>
                  <StatBar label="Atk"   value={mon.stats.atk}   />
                  <StatBar label="Def"   value={mon.stats.def}   />
                  <StatBar label="SpAtk" value={mon.stats.spAtk} />
                  <StatBar label="SpDef" value={mon.stats.spDef} />
                  <StatBar label="Speed" value={mon.stats.spd}   />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Moves</Text>
                  {mon.moves.map(mv => (
                    <View key={mv.id} style={styles.moveRow}>
                      <View style={[styles.moveTypeDot, { backgroundColor: TYPE_COLORS[mv.type] ?? '#888' }]} />
                      <Text style={styles.moveName}>{mv.name}</Text>
                      <Text style={styles.moveMeta}>{mv.category} · {mv.power ? `PWR ${mv.power}` : 'Status'}</Text>
                      <Text style={[styles.movePP, mv.currentPP === 0 && { color: '#f83800' }]}>
                        {mv.currentPP}/{mv.maxPP}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#1a1a2e' },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  back:           { color: '#aaa', fontSize: 16 },
  title:          { color: '#f8c800', fontSize: 18, fontWeight: '800' },
  healBtn:        { color: '#44dd44', fontSize: 15, fontWeight: '700' },
  list:           { padding: 12, gap: 10, paddingBottom: 24 },
  card: {
    flexDirection: 'row', backgroundColor: '#141428', borderRadius: 14,
    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a55',
  },
  cardFainted:    { opacity: 0.5 },
  cardInfo:       { flex: 1, marginLeft: 10 },
  nameRow:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  monName:        { color: '#fff', fontSize: 17, fontWeight: '800' },
  monLevel:       { color: '#aaa', fontSize: 13 },
  statusBadge:    { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  statusText:     { color: '#fff', fontSize: 9, fontWeight: '700' },
  typesRow:       { flexDirection: 'row', gap: 5, marginBottom: 6 },
  typeBadge:      { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5 },
  typeText:       { color: '#fff', fontSize: 9, fontWeight: '700' },
  hpNums:         { color: '#aaa', fontSize: 11, marginTop: 2 },
  emptyText:      { color: '#555', textAlign: 'center', marginTop: 40, fontSize: 16 },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox:       { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHeader:    { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  modalName:      { flex: 1, marginLeft: 16 },
  modalMonName:   { color: '#fff', fontSize: 24, fontWeight: '900' },
  modalLevel:     { color: '#aaa', fontSize: 14, marginBottom: 6 },
  section:        { marginBottom: 16 },
  sectionTitle:   { color: '#f8c800', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 },
  xpText:         { color: '#aaa', fontSize: 11, marginTop: 4 },
  xpTrack:        { height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  xpFill:         { height: '100%', backgroundColor: '#4080ff', borderRadius: 3 },
  moveRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141428', borderRadius: 10, padding: 10, marginBottom: 6 },
  moveTypeDot:    { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  moveName:       { color: '#fff', fontSize: 14, fontWeight: '700', flex: 1 },
  moveMeta:       { color: '#888', fontSize: 11, marginRight: 8 },
  movePP:         { color: '#aaa', fontSize: 12, fontWeight: '700', minWidth: 32, textAlign: 'right' },
  closeBtn:       { backgroundColor: '#333', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  closeBtnText:   { color: '#fff', fontSize: 16, fontWeight: '700' },
});
