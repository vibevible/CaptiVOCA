import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeCard from '../components/SwipeCard';
import initialVocabulary from '../../data/vocabulary.json';
import { saveVocabularyState, loadVocabularyState } from '../utils/storage';
import { saveLearningStep, saveTestTotalCount } from '../utils/storage';

export default function StudyScreen({ navigation }) {
  const [vocabularyData, setVocabularyData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [knownCount, setKnownCount] = useState(0); 
  const [studyCount, setStudyCount] = useState(0);
  const [testCount, setTestCount] = useState(0);

  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTutorial, setIsTutorial] = useState(false);

  // 퀴즈 즉석 설정 상태
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [includeKnown, setIncludeKnown] = useState(false);
  const [batchSize, setBatchSize] = useState(10);

  // 1. 현재 설정(아는 단어 포함 여부)에 따른 전체 테스트 가능 최대 단어 수 계산
  const maxAvailableCount = includeKnown 
    ? vocabularyData.length           // 아는 단어 포함이면 전체 단어 수
    : studyCount;                     // 미포함이면 학습할 단어 수만
  
  // 2. batchSize가 최대 개수를 넘지 않도록 안전장치 반영
  const effectiveBatchSize = Math.min(batchSize, Math.max(10, maxAvailableCount));

  // 컴포넌트 마운트 시 저장소에서 데이터 불러오기
  useEffect(() => {
    async function initStudy() {
      try {
        const loadedData = await loadVocabularyState(initialVocabulary);
        setVocabularyData(loadedData);
        // 초기 배치 사이즈 기본값을 전체 데이터 개수나 적절한 단위로 맞출 수도 있습니다 (최소 10단위)
        if (loadedData.length < 10) {
          setBatchSize(loadedData.length);
        }
      } catch (e) {
        console.error('스키밍 데이터를 불러오는 중 에러 발생:', e);
      } finally {
        setIsLoading(false);
      }
    }
    initStudy();
  }, []);

  const currentItem = vocabularyData[currentIndex];

  // 카드를 넘길 때(알고 있어요 / 학습할게요) 상태를 업데이트하고 저장
  const handleNextCard = async (isKnown) => {
    if (!currentItem) return;

    console.log(`[스키밍 처리] 단어: ${currentItem.word}, 선택값(isKnown): ${isKnown}`);

    // 1. 현재 카드의 상태 업데이트 (알고 있어요면 known, 학습할게요면 learning)
    const updatedItem = {
      ...currentItem,
      status: isKnown ? 'known' : 'learning',
      errorCount: isKnown ? 0 : (currentItem.errorCount || 1), // 알고 있으면 에러 초기화, 아니면 유지/부여
    };

    // 전체 데이터 배열에서 해당 카드만 업데이트
    const updatedData = vocabularyData.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );

    setVocabularyData(updatedData);
    await saveVocabularyState(updatedData); // 즉시 스토리지에 저장!

    if (isKnown) {
      setKnownCount(prev => prev + 1);
    } else {
      setStudyCount(prev => prev + 1);
    }

    if (currentIndex < vocabularyData.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  const totalCount = vocabularyData.length;
  const nextItem = currentIndex + 1 < totalCount ? vocabularyData[currentIndex + 1] : null;

  // 스키밍 완료 화면
  if (isCompleted) {
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

        <View style={styles.cardArea}>
          <View style={styles.completionCardOnly}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>스키밍 완료!</Text>
            <Text style={styles.completionSubtitle}>
              알고 있어요: {knownCount}개 / 학습할 단어: {studyCount}개
            </Text>
          </View>
        </View>

        <View style={styles.bottomActionRow}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={async () => {
              // 💡 1. 이번 세션에서 테스트해야 할 총 단어 개수를 최초 계산
              const targetList = vocabularyData.filter(item => item.status !== 'known');
              const initialCount = targetList.length > 0 ? targetList.length : vocabularyData.length;

              // 💡 2. 최초 총 개수를 스토리지에 박아둠 (이후 TestScreen에서 덮어쓰지 않음)
              await saveTestTotalCount(initialCount);
              await saveLearningStep('test');
              navigation.goBack();
            }}
          >
            <Text style={styles.actionBtnText}>메인으로 나가기</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.darkActionButton, styles.emphasizedBtn]} 
            onPress={async () => {
              // 💡 1. 이번 세션에서 테스트해야 할 총 단어 개수를 최초 계산
              const targetList = vocabularyData.filter(item => item.status !== 'known');
              const initialCount = targetList.length > 0 ? targetList.length : vocabularyData.length;

              // 💡 2. 최초 총 개수를 스토리지에 박아둠 (이후 TestScreen에서 덮어쓰지 않음)
              await saveTestTotalCount(initialCount);
              await saveLearningStep('test');

              navigation.replace("Test");
            }}
          >
            <Text style={[styles.actionBtnText, styles.whiteText, styles.emphasizedText]}>테스트 시작하기</Text>
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

      <View style={styles.cardArea}>
        {nextItem && (
          <View style={[styles.cardWrapper, { zIndex: 1 }]}>
            <SwipeCard item={nextItem} isNext={true} />
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
  center: { justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  backIcon: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  menuIcon: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  counterBadgeGroup: { flexDirection: 'row', gap: 8 },
  counterBadge: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center', gap: 4 },
  greenBadge: { backgroundColor: '#111', borderColor: '#111' },
  whiteText: { color: '#fff', fontWeight: 'bold' },
  cardArea: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  cardWrapper: { position: 'absolute', width: '100%', alignItems: 'center', justifyContent: 'center' },
  completionCardOnly: { width: '90%', backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  
  configBox: { width: '90%', backgroundColor: '#fff', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2, gap: 20 },
  configTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 4, textAlign: 'center' },
  configRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  configColumn: { gap: 10 },
  configLabel: { fontSize: 14, fontWeight: '600', color: '#334155' },
  boldText: { fontWeight: 'bold', color: '#0f172a' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#f8fafc', padding: 8, borderRadius: 12 },
  stepBtn: { backgroundColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  stepBtnText: { fontWeight: 'bold', color: '#334155' },
  stepValue: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', minWidth: 30, textAlign: 'center' },

  bottomActionRow: { flexDirection: 'row', padding: 20, gap: 12, backgroundColor: '#f4f5f7' },
  actionButton: { flex: 1, backgroundColor: '#fff', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  darkActionButton: { backgroundColor: '#111', borderColor: '#111' },
  actionBtnText: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  
  emphasizedBtn: { backgroundColor: '#FF2D6F', borderColor: '#FF2D6F' },
  emphasizedText: { color: '#fff' }
});