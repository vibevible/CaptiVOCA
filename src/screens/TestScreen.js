import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TestQuizView from '../components/TestQuizView';
import initialVocabulary from '../../data/vocabulary.json';
import { calculateCorrectReview, calculateIncorrectReview } from '../utils/reviewAlgorithm';
import { saveVocabularyState, loadVocabularyState } from '../utils/storage';

export default function TestScreen({ navigation }) {
  const [quizQueue, setQuizQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // [추가] 고정된 초기 고유 단어 총 개수 저장
  const [initialTotalLength, setInitialTotalLength] = useState(0);

  useEffect(() => {
    async function initQuiz() {
      try {
        const loadedData = await loadVocabularyState(initialVocabulary);
        const reviewList = loadedData.filter(item => (item.errorCount || 0) > 0 || item.status === 'learning');
        const finalQuizList = reviewList.length > 0 ? reviewList : loadedData;

        setQuizQueue(finalQuizList);
        setInitialTotalLength(finalQuizList.length); // 최초 고유 단어 개수 고정
      } catch (e) {
        console.error('퀴즈 데이터를 불러오는 중 에러 발생:', e);
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
      errorCount: 0, 
    };
    
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

  // [핵심 계산] 현재 큐에 남아있는 '고유 단어'의 개수를 세어 완료된 단어 수 계산
  const uniqueRemainingCount = new Set(quizQueue.map(q => q.id)).size;
  const completedCount = Math.max(0, initialTotalLength - uniqueRemainingCount);

  return (
    <SafeAreaView style={styles.container}>
      {currentItem ? (
        <TestQuizView 
          currentItem={currentItem} 
          currentIndex={currentIndex}
          fixedTotalLength={initialTotalLength} // 고정된 총 단어 수
          completedCount={completedCount}        // 완료된 고유 단어 수
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