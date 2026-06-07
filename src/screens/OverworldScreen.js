import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { AREAS, getRandomEncounter } from '../data/pokemon';
import { createPokemon } from '../utils/pokemonFactory';
import HPBar from '../components/HPBar';
import PokemonSprite from '../components/PokemonSprite';

const TYPE_COLORS = {
  Normal:'#a8a878', Fire:'#e2621b', Water:'#4a90d9', Grass:'#5db85a',
  Electric:'#f8c800', Ice:'#98d8d8', Fighting:'#c03028', Poison:'#a040a0',
  Ground:'#e0c068', Flying:'#a890f0', Psychic:'#f85888', Bug:'#a8b820',
  Rock:'#b8a038', Ghost:'#705898', Dragon:'#7038f8', Dark:'#705848', Steel:'#b8b8d0',
};

export default function OverworldScreen({ navigation }) {
  const { playerName, party, bag, currentArea, setCurrentArea, save, replaceParty } = useGame();
  const [showAreaPicker, setShowAreaPicker] = useState(false);

  const leadMon = party[0];
  const partyAlive = party.some(p => p.currentHP > 0);

  const leadHPPct = leadMon ? leadMon.currentHP / leadMon.stats.hp : 0;
  const leadHPColor = leadHPPct > 0.5 ? '#44dd44' : leadHPPct > 0.25 ? '#f8c800' : '#f83800';

  const areaKeys = Object.keys(AREAS);
  const maxPartyLevel = party.length > 0 ? Math.max(...party.map(p => p.level)) : 1;

  function handleExplore() {
    if (!partyAlive) {
      Alert.alert('No healthy Pokemon!', 'All your Pokemon have fainted. Rest at the Pokemon Center.', [
        { text: 'Heal (rest)', onPress: healAll },
        { text: 'Cancel' },
      ]);
      return;
    }
    const enc = getRandomEncounter(currentArea);
    if (!enc) return;
    const wildMon = createPokemon(enc.dexId, enc.level);
    navigation.navigate('Battle', { wildPokemon: wildMon });
  }

  function healAll() {
    const healed = party.map(p => ({
      ...p,
      currentHP: p.stats.hp,
      status: null,
      statusTurns: 0,
      moves: p.moves.map(m => ({ ...m, currentPP: m.maxPP })),
    }));
    replaceParty(healed);
    Alert.alert('Pokemon Center', 'Your Pokemon have been healed!');
  }

  async function handleSave() {
    const ok = await save();
    Alert.alert(ok ? 'Game Saved!' : 'Save Failed', ok ? 'Progress saved.' : 'Could not save.');
  }

  const areaInfo = AREAS[currentArea];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.playerName}>Trainer: {playerName}</Text>
          <Text style={styles.areaLabel}>{currentArea}</Text>
        </View>
        <View style={styles.bagInfo}>
          <Text style={styles.bagText}>◎ {bag.pokeballs}</Text>
        </View>
      </View>

      {/* Lead Pokemon card */}
      {leadMon && (
        <View style={styles.leadCard}>
          <PokemonSprite dexId={leadMon.dexId} isFront={true} size={72} />
          <View style={styles.leadInfo}>
            <Text style={styles.leadName}>{leadMon.name} <Text style={styles.leadLevel}>Lv.{leadMon.level}</Text></Text>
            <View style={styles.leadTypes}>
              {leadMon.types.map(t => (
                <View key={t} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[t] ?? '#888' }]}>
                  <Text style={styles.typeText}>{t}</Text>
                </View>
              ))}
            </View>
            <HPBar current={leadMon.currentHP} max={leadMon.stats.hp} showNumbers />
            <Text style={styles.leadHP}>HP: {leadMon.currentHP}/{leadMon.stats.hp}</Text>
          </View>
        </View>
      )}

      {/* Area picker row */}
      <View style={styles.areaRow}>
        <TouchableOpacity style={styles.areaBtn} onPress={() => setShowAreaPicker(true)}>
          <Text style={styles.areaBtnText}>📍 {currentArea}</Text>
          <Text style={styles.areaBtnArrow}>▼</Text>
        </TouchableOpacity>
        <Text style={styles.areaRange}>Lv {areaInfo?.minLevel}–{areaInfo?.maxLevel}</Text>
      </View>

      {/* Main action */}
      <TouchableOpacity style={styles.exploreBtn} onPress={handleExplore} activeOpacity={0.85}>
        <Text style={styles.exploreBtnIcon}>🌿</Text>
        <Text style={styles.exploreBtnText}>Walk in Tall Grass</Text>
        <Text style={styles.exploreBtnSub}>Random wild encounter!</Text>
      </TouchableOpacity>

      {/* Secondary buttons */}
      <View style={styles.secondaryRow}>
        <TouchableOpacity style={styles.secBtn} onPress={() => navigation.navigate('Party')}>
          <Text style={styles.secBtnIcon}>🏆</Text>
          <Text style={styles.secBtnText}>Party</Text>
          <Text style={styles.secBtnSub}>{party.length}/6</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secBtn, styles.healBtn]}
          onPress={() => Alert.alert('Pokemon Center', 'Heal all Pokemon to full HP?', [
            { text: 'Heal!', onPress: healAll },
            { text: 'Cancel' },
          ])}
        >
          <Text style={styles.secBtnIcon}>+</Text>
          <Text style={styles.secBtnText}>Rest</Text>
          <Text style={styles.secBtnSub}>Heal all</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secBtn} onPress={handleSave}>
          <Text style={styles.secBtnIcon}>💾</Text>
          <Text style={styles.secBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Area picker modal */}
      <Modal visible={showAreaPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Choose Area</Text>
            <FlatList
              data={areaKeys}
              keyExtractor={k => k}
              renderItem={({ item: key }) => {
                const area = AREAS[key];
                const locked = maxPartyLevel < area.unlockLevel;
                return (
                  <TouchableOpacity
                    style={[styles.areaOption, currentArea === key && styles.areaOptionActive, locked && styles.areaOptionLocked]}
                    onPress={() => { if (!locked) { setCurrentArea(key); setShowAreaPicker(false); } }}
                    disabled={locked}
                  >
                    <Text style={[styles.areaOptionName, locked && { color: '#555' }]}>{key}</Text>
                    <Text style={[styles.areaOptionLevel, locked && { color: '#444' }]}>
                      {locked ? `🔒 Req. Lv ${area.unlockLevel}` : `Lv ${area.minLevel}–${area.maxLevel}`}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowAreaPicker(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#1a1a2e', paddingHorizontal: 16 },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  playerName:       { color: '#f8c800', fontSize: 16, fontWeight: '700' },
  areaLabel:        { color: '#aaa', fontSize: 12 },
  bagInfo:          { backgroundColor: '#2a2a45', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  bagText:          { color: '#fff', fontSize: 16, fontWeight: '700' },
  leadCard:         { backgroundColor: '#141428', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#2a2a55' },
  leadInfo:         { flex: 1, marginLeft: 12 },
  leadName:         { color: '#fff', fontSize: 18, fontWeight: '800' },
  leadLevel:        { color: '#aaa', fontSize: 14, fontWeight: '400' },
  leadTypes:        { flexDirection: 'row', gap: 6, marginVertical: 4 },
  leadHP:           { color: '#aaa', fontSize: 11, marginTop: 2 },
  typeBadge:        { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  typeText:         { color: '#fff', fontSize: 10, fontWeight: '700' },
  areaRow:          { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  areaBtn:          { flex: 1, flexDirection: 'row', backgroundColor: '#0d0d1f', borderRadius: 10, borderWidth: 1, borderColor: '#333', paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'space-between' },
  areaBtnText:      { color: '#fff', fontSize: 14 },
  areaBtnArrow:     { color: '#aaa', fontSize: 12 },
  areaRange:        { color: '#f8c800', fontSize: 13, fontWeight: '700' },
  exploreBtn: {
    backgroundColor: '#1a6b1a',
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2c9c2c',
  },
  exploreBtnIcon:   { fontSize: 32, marginBottom: 4 },
  exploreBtnText:   { color: '#fff', fontSize: 22, fontWeight: '800' },
  exploreBtnSub:    { color: '#a8e8a8', fontSize: 12, marginTop: 2 },
  secondaryRow:     { flexDirection: 'row', gap: 10 },
  secBtn: {
    flex: 1,
    backgroundColor: '#141428',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a55',
  },
  healBtn:          { borderColor: '#2a5522', backgroundColor: '#0d1f0d' },
  secBtnIcon:       { fontSize: 22 },
  secBtnText:       { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 4 },
  secBtnSub:        { color: '#888', fontSize: 11 },
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox:         { backgroundColor: '#1a1a2e', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  modalTitle:       { color: '#f8c800', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  areaOption:       { paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#222', flexDirection: 'row', justifyContent: 'space-between' },
  areaOptionActive: { backgroundColor: '#2a2a45' },
  areaOptionLocked: { opacity: 0.5 },
  areaOptionName:   { color: '#fff', fontSize: 16, fontWeight: '600' },
  areaOptionLevel:  { color: '#aaa', fontSize: 13 },
  modalClose:       { backgroundColor: '#333', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  modalCloseText:   { color: '#fff', fontSize: 16, fontWeight: '700' },
});
