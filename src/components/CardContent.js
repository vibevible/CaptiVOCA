import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

function getModeStyle(state) {
  switch (state) {
    case 'seductive':
      return {
        label: '매혹 모드',
        badgeStyle: styles.badgeSeductive,
        textStyle: styles.badgeTextLight,
      };
    case 'horror':
      return {
        label: '공포 모드',
        badgeStyle: styles.badgeHorror,
        textStyle: styles.badgeTextLight,
      };
    default:
      return {
        label: '기본 모드',
        badgeStyle: styles.badgeDefault,
        textStyle: styles.badgeTextDark,
      };
  }
}

export default function CardContent({ item, personaState, currentContent }) {
  const modeInfo = getModeStyle(personaState)

  return (
    <View style={styles.container}>
      <Image source={{ uri: currentContent.imageUrl }} style={styles.image} />
      
      <View style={styles.contentContainer}>
        <View style={styles.wordRow}>
          <Text style={styles.word}>{item.word}</Text>
          <Text style={styles.audioIcon}>🔊</Text>
        </View>
        <Text style={styles.phonetic}>[{item.phonetic || 'fɔːrkæst'}]</Text>
        <Text style={styles.meaning}>{item.partOfSpeech} {item.meaning}</Text>
        
        <View style={styles.sentenceBox}>
          <View style={styles.sentenceRow}>
            <Text style={styles.sentence}>{currentContent.sentence}</Text>
            <Text style={styles.audioIcon}>🔊</Text>
          </View>
          <Text style={styles.translation}>{currentContent.translation}</Text>
        </View>

        <View style={styles.tagRow}>
          <Text style={styles.tagText}>{item.part} · {item.level}</Text>
          <View style={[styles.modeBadge, modeInfo.badgeStyle]}>
            <Text style={[styles.modeBadgeText, modeInfo.textStyle]}>{modeInfo.label}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  word: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
  },
  audioIcon: {
    fontSize: 16,
  },
  phonetic: {
    fontSize: 13,
    color: '#888',
    marginTop: -4,
  },
  meaning: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginTop: 4,
  },
  sentenceBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 12,
    borderRadius: 12,
  },
  sentenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentence: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
    flex: 1,
  },
  translation: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 12,
    color: '#888',
  },
  modeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  badgeDefault: {
    backgroundColor: '#dfe6e9',
  },
  badgeSeductive: {
    backgroundColor: '#e681a1', // 매혹 모드 배지 배경 (빨강)
  },
  badgeHorror: {
    backgroundColor: '#c56bf1', // 공포 모드 배지 배경 (보라)
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  badgeTextDark: {
    color: '#2d3436',
  },
  badgeTextLight: {
    color: '#ffffff',
  },
});