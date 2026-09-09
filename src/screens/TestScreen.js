import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TestQuizView from '../components/TestQuizView';
import initialVocabulary from '../../data/vocabulary.json';
import { calculateCorrectReview, calculateIncorrectReview } from '../utils/reviewAlgorithm';
import { saveVocabularyState, loadVocabularyState } from '../utils/storage';

export default function TestScreen({ route, navigation }) {
  const params = route?.params || {};
  const includeKnown = params.includeKnown ?? false;
  const batchSize = params.batchSize ?? 10;

  const [quizQueue, setQuizQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [initialTotalLength, setInitialTotalLength] = useState(0);
  const [completedIds, setCompletedIds] = useState(new Set());

  useEffect(() => {
    async function initQuiz() {
      try {
        const loadedData = await loadVocabularyState(initialVocabulary);
        
        // 디버깅용 로그 (F12 콘솔이나 터미널에서 각 단어의 status 확인)
        console.log('--- 스토리지에서 불러온 단어 상태들 ---', loadedData.map(d => ({ word: d.word, status: d.status })));

        let targetList = loadedData;
        
        // includeKnown이 false일 때 ('아는 단어 포함'을 끈 경우)
        if (!includeKnown) {
          // 'known'이 아닌 것만 필터링 (status가 없거나 'learning'인 것들)
          targetList = loadedData.filter(item => item.status !== 'known');
        }

        // 필터링 결과가 아예 없거나 비어버렸을 때의 안전장치
        if (targetList.length === 0) {
          targetList = loadedData; 
        }

        const finalQuizList = targetList.slice(0, batchSize);

        setQuizQueue(finalQuizList);
        const initialUniqueCount = new Set(finalQuizList.map(q => q.id)).size;
        setInitialTotalLength(initialUniqueCount);
      } catch (e) {
        console.error('퀴즈 데이터를 불러오는 중 에러 발생:', e);
      } finally {
        setIsLoading(false);
      }
    }
    initQuiz();
  }, [includeKnown, batchSize]);

  const currentItem = quizQueue[currentIndex];

  const handleCorrect = async (item) => {
    const updatedData = calculateCorrectReview ? calculateCorrectReview(item) : { ...item, errorCount: 0 };
    const updatedItem = {
      ...updatedData,
      errorCount: 0, 
    };
    
    setCompletedIds(prev => new Set(prev).add(item.id));
    
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

    if (currentIndex < newQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert('모든 복습 테스트를 완료했습니다! 🎉');
      navigation.goBack();
    }
  };

  const handleIncorrect = async (item) => {
    const updatedItem = calculateIncorrectReview(item);
    
    const newQueue = quizQueue.map(q => q.id === updatedItem.id ? updatedItem : q);
    const finalQueue = [...newQueue, updatedItem];
    
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

  // [수정] 완료된 고유 단어들의 개수를 바로 산출
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
          onClose={() => navigation.goBack()}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { justifyContent: 'center', alignItems: 'center' },
});