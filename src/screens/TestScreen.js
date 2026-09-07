import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import TestQuizView from '../components/TestQuizView';
import initialVocabulary from '../../data/vocabulary.json';
import { calculateCorrectReview, calculateIncorrectReview } from '../utils/reviewAlgorithm';
import { saveVocabularyState, loadVocabularyState } from '../utils/storage';

export default function TestScreen({ navigation }) {
  const [quizQueue, setQuizQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 화면 진입 시 저장소에서 단어 상태 불러오기
  useEffect(() => {
    async function initQuiz() {
      const loadedData = await loadVocabularyState(initialVocabulary);
      setQuizQueue(loadedData);
    }
    initQuiz();
  }, []);

  const currentItem = quizQueue[currentIndex];

  const handleCorrect = async (item) => {
    // 맞췄으므로 에러 카운트를 0으로 초기화하여 기본 모드로 되돌림
    const updatedItem = {
      ...item,
      errorCount: 0, 
      // 추가적으로 필요한 복습 주기 계산 로직이 있다면 이어서 작성
    };
    
    // 이후 기존의 큐 필터링 및 인덱스 이동 로직 수행
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
    
    // 오답인 경우 큐 맨 뒤에 동적으로 추가하고 상태 업데이트
    const newQueue = quizQueue.map(q => q.id === updatedItem.id ? updatedItem : q);
    const finalQueue = [...newQueue, updatedItem];
    
    setQuizQueue(finalQueue);
    await saveVocabularyState(finalQueue);
    
    if (currentIndex < quizQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentItem ? (
        <TestQuizView 
          currentItem={currentItem} 
          currentIndex={currentIndex}
          totalLength={quizQueue.length}
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
});