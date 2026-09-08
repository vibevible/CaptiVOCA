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
  const [initialTotalLength, setInitialTotalLength] = useState(0);
  
  // [추가] 정답을 맞춰서 완전히 끝낸 고유 단어의 ID들을 담는 Set 상태
  const [completedIds, setCompletedIds] = useState(new Set());

  useEffect(() => {
    async function initQuiz() {
      try {
        const loadedData = await loadVocabularyState(initialVocabulary);
        const reviewList = loadedData.filter(item => (item.errorCount || 0) > 0 || item.status === 'learning');
        const finalQuizList = reviewList.length > 0 ? reviewList : loadedData;

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
  }, []);

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