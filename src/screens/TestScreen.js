import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TestQuizView from '../components/TestQuizView';
import initialVocabulary from '../../data/vocabulary.json';
import { calculateCorrectReview, calculateIncorrectReview } from '../utils/reviewAlgorithm';
import { saveVocabularyState, loadVocabularyState, saveLearningStep, saveTestTotalCount } from '../utils/storage';

export default function TestScreen({ navigation }) {
  const [quizQueue, setQuizQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [initialTotalLength, setInitialTotalLength] = useState(0);
  const [completedIds, setCompletedIds] = useState(new Set());

  useEffect(() => {
    async function initQuiz() {
      try {
        const loadedData = await loadVocabularyState(initialVocabulary);
        
        // 스키밍 때 'known'이 아닌 단어들을 테스트 대상(targetList)으로 설정
        let targetList = loadedData.filter(item => item.status !== 'known');
        if (targetList.length === 0) {
          targetList = loadedData; // 안전장치
        }

        setQuizQueue(targetList);
        setInitialTotalLength(targetList.length);

      } catch (e) {
        console.error('테스트 데이터를 불러오는 중 에러 발생:', e);
      } finally {
        setIsLoading(false);
      }
    }
    initQuiz();
  }, []);

  const currentItem = quizQueue[currentIndex];

  const handleCorrect = async (item) => {
    const updatedData = calculateCorrectReview ? calculateCorrectReview(item) : { ...item, errorCount: 0 };
    const updatedItem = {
      ...updatedData,
      status: 'known', // 테스트를 맞추면 확실한 아는 단어로 마스터 처리
      errorCount: 0, 
    };
    
    const newCompletedIds = new Set(completedIds).add(item.id);
    setCompletedIds(newCompletedIds);
    
    const newQueue = quizQueue
      .map(q => q.id === updatedItem.id ? updatedItem : q)
      .filter((q, idx) => {
        if (q.id === updatedItem.id) {
          return idx <= currentIndex;
        }
        return true;
      });

    setQuizQueue(newQueue);
    
    await saveVocabularyState(newQueue);

    // 💡 실시간으로 진행률 비율을 계산해서 저장하거나 홈 화면에서 쓸 수 있게 함
    // 여기서는 큐가 다 끝나면 'completed'로 전환
    if (currentIndex < newQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await saveLearningStep('completed');
      alert('모든 테스트를 완료했습니다! 🎉');
      navigation.goBack();
    }
  };

  const handleIncorrect = async (item) => {
    const updatedItem = calculateIncorrectReview(item);
    
    const newQueue = quizQueue.map(q => q.id === updatedItem.id ? updatedItem : q);
    const finalQueue = [...newQueue, updatedItem]; // 틀린 건 뒤로 다시 배치
    
    setQuizQueue(finalQueue);
    await saveVocabularyState(finalQueue);
    
    setCurrentIndex(currentIndex + 1);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  const completedCount = completedIds.size;

  return (
    <SafeAreaView style={styles.container}>
      {currentItem ? (
        <TestQuizView 
          currentItem={currentItem} 
          currentIndex={currentIndex}
          fixedTotalLength={initialTotalLength} 
          completedCount={completedCount}        
          onCorrect={handleCorrect} 
          onIncorrect={handleIncorrect}
          onClose={async () => {
            // 테스트 도중 나가더라도 현재까지의 상태를 반영해 저장
            navigation.goBack();
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { justifyContent: 'center', alignItems: 'center' },
});