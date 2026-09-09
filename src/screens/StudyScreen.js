import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SwipeCard from '../components/SwipeCard';
import initialVocabulary from '../../data/vocabulary.json';
import { saveVocabularyState, loadVocabularyState } from '../utils/storage';

export default function StudyScreen({ navigation }) {
  const [vocabularyData, setVocabularyData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0); 
  const [studyCount, setStudyCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 퀴즈 즉석 설정 상태
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [includeKnown, setIncludeKnown] = useState(false);
  const [batchSize, setBatchSize] = useState(10);

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

    // [디버깅 로그] 업데이트 후 데이터에 known이 잘 들어갔는지 확인
    console.log(`[업데이트된 항목 확인]`, updatedItem)

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
          {!showConfigModal ? (
            <View style={styles.completionCardOnly}>
              <Text style={styles.completionEmoji}>🎉</Text>
              <Text style={styles.completionTitle}>스키밍 완료!</Text>
              <Text style={styles.completionSubtitle}>
                알고 있어요: {knownCount}개 / 학습할 단어: {studyCount}개
              </Text>
            </View>
          ) : (
            <View style={styles.configBox}>
              <Text style={styles.configTitle}>⚙️ 퀴즈 즉석 설정</Text>
              
              <View style={styles.configRow}>
                <Text style={styles.configLabel}>아는 단어(스키밍 완료)도 퀴즈에 포함</Text>
                <Switch 
                  value={includeKnown} 
                  onValueChange={setIncludeKnown}
                  trackColor={{ false: '#cbd5e1', true: '#111' }}
                />
              </View>

              <View style={styles.configColumn}>
                <Text style={styles.configLabel}>한 번에 풀 퀴즈 개수: <Text style={styles.boldText}>{batchSize}개</Text></Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity 
                    style={styles.stepBtn}
                    // 최소 10개, 혹은 남은 단어 수 중 작은 값으로 제한
                    onPress={() => setBatchSize(prev => Math.max(10, prev - 10))}
                  >
                    <Text style={styles.stepBtnText}>- 10</Text>
                  </TouchableOpacity>

                  <Text style={styles.stepValue}>{Math.min(batchSize, studyCount)}개</Text>

                  <TouchableOpacity 
                    style={styles.stepBtn}
                    // 최대 학습할 단어 수(studyCount)를 넘지 않도록 제한
                    onPress={() => setBatchSize(prev => Math.min(studyCount, prev + 10))}
                  >
                    <Text style={styles.stepBtnText}>+ 10</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.bottomActionRow}>
          {!showConfigModal ? (
            <>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.actionBtnText}>메인으로 나가기</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.darkActionButton]} 
                onPress={() => setShowConfigModal(true)}
              >
                <Text style={[styles.actionBtnText, styles.whiteText]}>퀴즈 시작하기</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => setShowConfigModal(false)}
              >
                <Text style={styles.actionBtnText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.darkActionButton, styles.emphasizedBtn]} 
                onPress={() => {
                  navigation.replace("Test", { includeKnown, batchSize });
                }}
              >
                <Text style={[styles.actionBtnText, styles.whiteText, styles.emphasizedText]}>🚀 시작하기</Text>
              </TouchableOpacity>
            </>
          )}
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
  
  emphasizedBtn: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  emphasizedText: { color: '#fff' }
});