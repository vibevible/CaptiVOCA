import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeCard from '../components/SwipeCard';
import vocabularyData from '../../data/vocabulary.json';

export default function StudyScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0); 
  const [studyCount, setStudyCount] = useState(0);
  
  // [추가] 스키밍 완료 여부를 관리하는 상태
  const [isCompleted, setIsCompleted] = useState(false);

  const handleNextCard = (isKnown) => {
    if (isKnown) {
      setKnownCount(prev => prev + 1);
    } else {
      setStudyCount(prev => prev + 1);
    }

    if (currentIndex < vocabularyData.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // [수정] alert 대신 완료 상태를 true로 전환
      setIsCompleted(true);
    }
  };

  const totalCount = vocabularyData.length;
  const currentItem = vocabularyData[currentIndex];
  const nextItem = currentIndex + 1 < totalCount ? vocabularyData[currentIndex + 1] : null;

  // 스키밍 완료 시 보여줄 화면
  if (isCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        {/* 상단바는 그대로 유지 */}
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

        {/* 중앙 완료 안내 카드 */}
        <View style={styles.cardArea}>
          <View style={styles.completionCardOnly}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>스키밍 완료!</Text>
            <Text style={styles.completionSubtitle}>
              알고 있어요: {knownCount}개 / 학습할 단어: {studyCount}개
            </Text>
          </View>
        </View>

        {/* 평소 카드 아래에 있던 액션 버튼 스타일을 그대로 적용한 하단 바 */}
        <View style={styles.bottomActionRow}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.actionBtnText}>메인으로 나가기</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.darkActionButton]} 
            onPress={() => navigation.replace('Test')}
          >
            <Text style={[styles.actionBtnText, styles.whiteText]}>복습 테스트 시작</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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

      {/* 카드 스택 영역 */}
      <View style={styles.cardArea}>
        {nextItem && (
          <View style={[styles.cardWrapper, { zIndex: 1 }]}>
            <SwipeCard 
              item={nextItem} 
              isNext={true} 
            />
          </View>
        )}

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
        ) : null}
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
  completedContainer: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  completionCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 4,
  },
  completionEmoji: { fontSize: 48, marginBottom: 12 },
  completionTitle: { fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  completionSubtitle: { fontSize: 15, color: '#666', marginBottom: 32, textAlign: 'center' },
  completionBtnGroup: { width: '100%', gap: 12 },
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