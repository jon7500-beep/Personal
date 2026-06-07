import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { createPokemon } from '../utils/pokemonFactory';
import PokemonSprite from '../components/PokemonSprite';

const STARTERS = [
  { dexId: 1,  name: 'Bulbasaur',  color: '#5db85a', types: 'Grass / Poison', desc: 'Steady grower. Leech Seed drains foes.' },
  { dexId: 4,  name: 'Charmander', color: '#e2621b', types: 'Fire',            desc: 'Speedy attacker. Burns opponents.' },
  { dexId: 7,  name: 'Squirtle',   color: '#4a90d9', types: 'Water',           desc: 'Tough defender. Great early coverage.' },
];

const TYPE_COLORS = { Grass: '#5db85a', Poison: '#a040a0', Fire: '#e2621b', Water: '#4a90d9', Normal: '#a8a878' };

export default function StarterSelectScreen({ navigation }) {
  const { setPlayerName, addToParty, save } = useGame();
  const [name, setName] = useState('');
  const [chosen, setChosen] = useState(null);
  const [step, setStep] = useState('name'); // 'name' | 'pick'

  function handleNameNext() {
    const trimmed = name.trim();
    if (!trimmed) { Alert.alert('Name required', 'Please enter your trainer name.'); return; }
    setPlayerName(trimmed);
    setStep('pick');
  }

  async function handleConfirm() {
    if (chosen == null) { Alert.alert('Pick a starter!', 'Choose your first Pokemon.'); return; }
    const starter = createPokemon(chosen, 5);
    addToParty(starter);
    await save();
    navigation.replace('Overworld');
  }

  if (step === 'name') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>What's your name?</Text>
        <Text style={styles.sub}>Professor Oak wants to know!</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter trainer name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
          maxLength={12}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleNameNext}
        />
        <TouchableOpacity style={styles.nextBtn} onPress={handleNameNext}>
          <Text style={styles.nextBtnText}>NEXT →</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Choose Your Starter!</Text>
      <Text style={styles.sub}>Pick the Pokemon that will begin your journey.</Text>

      <ScrollView contentContainerStyle={styles.starterList} showsVerticalScrollIndicator={false}>
        {STARTERS.map(s => (
          <TouchableOpacity
            key={s.dexId}
            style={[
              styles.card,
              { borderColor: s.color },
              chosen === s.dexId && { backgroundColor: '#2a2a45', borderWidth: 3 },
            ]}
            onPress={() => setChosen(s.dexId)}
            activeOpacity={0.8}
          >
            <PokemonSprite dexId={s.dexId} isFront={true} size={80} />
            <View style={styles.cardInfo}>
              <Text style={[styles.cardName, { color: s.color }]}>{s.name}</Text>
              <View style={styles.typesRow}>
                {s.types.split(' / ').map(t => (
                  <View key={t} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[t] ?? '#888' }]}>
                    <Text style={styles.typeText}>{t}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.cardDesc}>{s.desc}</Text>
            </View>
            {chosen === s.dexId && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.nextBtn, !chosen && styles.btnDisabled]}
        onPress={handleConfirm}
        disabled={!chosen}
      >
        <Text style={styles.nextBtnText}>START ADVENTURE →</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#1a1a2e', paddingHorizontal: 16, paddingTop: 8 },
  header:      { fontSize: 26, fontWeight: '800', color: '#f8c800', textAlign: 'center', marginBottom: 4 },
  sub:         { fontSize: 13, color: '#aaa', textAlign: 'center', marginBottom: 16 },
  input: {
    backgroundColor: '#0d0d1f',
    borderWidth: 2,
    borderColor: '#4466bb',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
    marginTop: 12,
  },
  starterList: { paddingBottom: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#141428',
    borderRadius: 14,
    borderWidth: 2,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  cardInfo:    { flex: 1, marginLeft: 12 },
  cardName:    { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  typesRow:    { flexDirection: 'row', gap: 6, marginBottom: 6 },
  typeBadge:   { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  typeText:    { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardDesc:    { color: '#ccc', fontSize: 12 },
  checkmark:   { fontSize: 24, color: '#44dd44', marginLeft: 8 },
  nextBtn: {
    backgroundColor: '#cc0000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  btnDisabled: { backgroundColor: '#444' },
  nextBtnText: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 1 },
});
