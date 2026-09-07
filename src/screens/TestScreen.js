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
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  // 화면 진입 시 저장소에서 단어 상태를 불러오고 복습 대상만 필터링
  useEffect(() => {
    async function initQuiz() {
      try {
        const loadedData = await loadVocabularyState(initialVocabulary);
        
        // [중요] 복습이 필요한 단어들만 골라냅니다 (errorCount가 있거나 학습이 필요한 단어 등)
        // 만약 전체 단어로 테스트를 시작하고 싶다면 이 필터 조건을 조정하세요.
        const reviewList = loadedData.filter(item => (item.errorCount || 0) > 0 || item.status === 'learning');
        
        // 만약 복습 대상이 하나도 없다면 전체 단어로 테스트를 시작하게 안전장치 추가
        const finalQuizList = reviewList.length > 0 ? reviewList : loadedData;

        setQuizQueue(finalQuizList);
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
    // 정답 처리 및 복습 주기 적용 + 에러 카운트 0으로 초기화
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

  // 로딩 중일 때 빈 화면 대신 로딩 인디케이터 표시
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  console.log('현재 큐 길이:', quizQueue.length);
  console.log('현재 퀴즈 인덱스:', currentIndex);

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
      ) : (
        <View style={[styles.container, styles.center]}>
          {/* 큐가 비어있을 때의 예외 처리 화면 */}
          <View style={{ alignItems: 'center' }}>
            {/* 텍스트나 완료 버튼 배치 가능 */}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { justifyContent: 'center', alignItems: 'center' },
});