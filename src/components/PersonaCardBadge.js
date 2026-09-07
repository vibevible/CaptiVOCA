import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const getCardPersonaState = (errorCount) => {
  if (errorCount >= 10) return 'horror';
  if (errorCount >= 3) return 'seductive';
  return 'default';
};

export default function PersonaCardBadge({ state }) {
  if (state === 'default') return null;

  const isHorror = state === 'horror';
  return (
    <View style={[styles.badge, isHorror ? styles.horrorBadge : styles.seductiveBadge]}>
      <Text style={styles.badgeText}>
        {isHorror ? '💀 10회 이상 오답: 호러 모드' : '💋 3회 이상 오답: 매혹 모드'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  seductiveBadge: { backgroundColor: '#ff4757' },
  horrorBadge: { backgroundColor: '#2f3542' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});