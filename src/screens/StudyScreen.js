import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import SwipeCard from '../components/SwipeCard';
import vocabularyData from '../../data/vocabulary.json';

export default function StudyScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0); 
  const [studyCount, setStudyCount] = useState(0); 

  const handleNextCard = (isKnown) => {
    if (isKnown) {
      setKnownCount(prev => prev + 1);
    } else {
      setStudyCount(prev => prev + 1);
    }

    if (currentIndex < vocabularyData.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      alert('모든 단어 스키밍을 완료했습니다!');
      navigation.goBack();
    }
  };

  const totalCount = vocabularyData.length;
  const currentItem = vocabularyData[currentIndex];
  const nextItem = currentIndex + 1 < totalCount ? vocabularyData[currentIndex + 1] : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>〈</Text>
        </TouchableOpacity>

        <View style={styles.counterBadgeGroup}>
          <View style={styles.counterBadge}>
            <Text>🗑️ {knownCount}</Text>
          </View>
          <View style={[styles.counterBadge, styles.greenBadge]}>
            <Text style={styles.whiteText}>✅ {studyCount} / {totalCount}</Text>
          </View>
        </View>

        <Text style={styles.menuIcon}>⋮</Text>
      </View>

      {/* 카드 스택 영역 (완전히 포개진 구조) */}
      <View style={styles.cardArea}>
        {/* 1. 아래에 완전히 가려져 있는 다음 카드 (zIndex: 1) */}
        {nextItem && (
          <View style={[styles.cardWrapper, { zIndex: 1 }]}>
            <SwipeCard 
              item={nextItem} 
              isNext={true} 
            />
          </View>
        )}

        {/* 2. 맨 위에 완전히 덮고 있는 현재 카드 (zIndex: 2) */}
        {currentItem ? (
          <View style={[styles.cardWrapper, { zIndex: 2 }]}>
            <SwipeCard 
              key={currentItem.id || currentIndex} 
              item={currentItem} 
              isNext={false}
              onSwipeLeft={() => handleNextCard(true)}   
              onSwipeRight={() => handleNextCard(false)} 
              errorCount={currentItem.errorCount || 0}
            />
          </View>
        ) : (
          <Text>학습 완료!</Text>
        )}
      </View>

      <View style={styles.bottomActionRow}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleNextCard(true)}
        >
          <Text style={styles.actionBtnText}>알고 있어요</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.darkActionButton]} 
          onPress={() => handleNextCard(false)}
        >
          <Text style={[styles.actionBtnText, styles.whiteText]}>학습할게요</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f5f7' },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 12,
  },
  backIcon: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  menuIcon: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  counterBadgeGroup: { flexDirection: 'row', gap: 8 },
  counterBadge: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greenBadge: { backgroundColor: '#111', borderColor: '#111' },
  whiteText: { color: '#fff', fontWeight: 'bold' },
  cardArea: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  cardWrapper: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActionRow: { 
    flexDirection: 'row', 
    padding: 20, 
    gap: 12,
    backgroundColor: '#f4f5f7',
  },
  actionButton: { 
    flex: 1, 
    backgroundColor: '#fff', 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  darkActionButton: { 
    backgroundColor: '#111',
    borderColor: '#111',
  },
  actionBtnText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#111', 
  },
});