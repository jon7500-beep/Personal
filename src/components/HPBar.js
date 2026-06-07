import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HPBar({ current, max, showNumbers = false, compact = false }) {
  const pct = max > 0 ? Math.max(0, current / max) : 0;
  const color = pct > 0.5 ? '#44dd44' : pct > 0.25 ? '#f8c800' : '#f83800';

  return (
    <View style={compact ? styles.compactWrap : styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: color }]} />
      </View>
      {showNumbers && (
        <Text style={styles.numbers}>{current}/{max}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 2 },
  compactWrap: {},
  track: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#555',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  numbers: {
    color: '#fff',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 1,
  },
});
