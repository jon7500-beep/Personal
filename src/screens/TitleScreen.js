import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hasSave } from '../utils/storage';
import { useGame } from '../context/GameContext';

export default function TitleScreen({ navigation }) {
  const [checking, setChecking] = useState(true);
  const [saveExists, setSaveExists] = useState(false);
  const { load } = useGame();

  useEffect(() => {
    hasSave().then(exists => {
      setSaveExists(exists);
      setChecking(false);
    });
  }, []);

  async function handleContinue() {
    const ok = await load();
    if (ok) navigation.replace('Overworld');
  }

  function handleNewGame() {
    navigation.replace('StarterSelect');
  }

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#f8c800" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleBlock}>
        <Text style={styles.titleShadow}>POKEMON</Text>
        <Text style={styles.title}>POKEMON</Text>
        <Text style={styles.subtitle}>Adventure Game</Text>
      </View>

      <View style={styles.pokeballDeco}>
        <Text style={styles.ballTop}>◗</Text>
      </View>

      <View style={styles.buttons}>
        {saveExists && (
          <TouchableOpacity style={styles.btn} onPress={handleContinue}>
            <Text style={styles.btnText}>CONTINUE</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.btn, styles.btnRed]} onPress={handleNewGame}>
          <Text style={styles.btnText}>NEW GAME</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Tap a button to begin your adventure!</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  container:   { flex: 1, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 24 },
  titleBlock:  { alignItems: 'center', marginTop: 20 },
  titleShadow: { position: 'absolute', top: 4, left: 4, fontSize: 56, fontWeight: '900', color: '#cc0000', letterSpacing: 4 },
  title:       { fontSize: 56, fontWeight: '900', color: '#f8c800', letterSpacing: 4 },
  subtitle:    { fontSize: 16, color: '#aaa', marginTop: 4, letterSpacing: 2 },
  pokeballDeco:{ alignItems: 'center' },
  ballTop:     { fontSize: 100, color: '#cc0000', lineHeight: 110 },
  buttons:     { width: '100%', gap: 12 },
  btn: {
    backgroundColor: '#2a4480',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4466bb',
  },
  btnRed:      { backgroundColor: '#880000', borderColor: '#cc2222' },
  btnText:     { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 2 },
  footer:      { color: '#555', fontSize: 12, marginBottom: 8 },
});
