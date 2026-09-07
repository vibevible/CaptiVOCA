import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback } from 'react-native';
import SwipeCard from './SwipeCard';
import { getFormattedPreviousTime } from '../utils/reviewAlgorithm';

export default function TestQuizView({ currentItem, currentIndex, totalLength, onCorrect, onIncorrect, onClose }) {
  const [userInput, setUserInput] = useState('');
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrectResult, setIsCorrectResult] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  
  // 앞면(문제 풀이 폼)과 뒷면(페르소나 카드) 전환을 위한 플립 상태
  const [isFlipped, setIsFlipped] = useState(false);

  const targetWord = currentItem.word;
  const currentVariant = currentItem.variants.default;

  const progressPercent = Math.min(((currentIndex + 1) / totalLength) * 100, 100);
  const progressText = `${String(currentIndex + 1).padStart(2, '0')}/${String(totalLength).padStart(2, '0')}`;

  const defaultBadgeText = currentItem.lastReviewedAt 
    ? `${currentItem.level || '700점'} · ${getFormattedPreviousTime(currentItem.lastReviewedAt)}`
    : `${currentItem.level || '700점'} · 새로운 단어`;

  const currentBadgeText = isEvaluated ? feedbackText : defaultBadgeText;

  const renderHighlightedTranslation = () => {
    const translation = currentVariant.translation;
    const highlight = currentVariant.highlightWord;

    if (!highlight || !translation.includes(highlight)) {
      return <Text style={styles.translationQuiz}>{translation}</Text>;
    }

    const parts = translation.split(highlight);
    return (
      <Text style={styles.translationQuiz}>
        {parts[0]}
        <Text style={styles.highlightText}>{highlight}</Text>
        {parts[1]}
      </Text>
    );
  };

  const renderInlineSentence = () => {
    const sentence = currentVariant.sentence;
    const regex = new RegExp(`(${targetWord})`, 'gi');
    const parts = sentence.split(regex);

    return (
      <View style={styles.inlineSentenceRow}>
        {parts.map((part, index) => {
          if (part.toLowerCase() === targetWord.toLowerCase()) {
            if (!isEvaluated) {
              return (
                <TextInput
                  key={index}
                  style={styles.inlineInputBox}
                  value={userInput}
                  onChangeText={setUserInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="_____ "
                  placeholderTextColor="#b2bec3"
                />
              );
            } else {
              return (
                <View key={index} style={[styles.inlineInputBox, isCorrectResult ? styles.correctBox : styles.incorrectBox]}>
                  <Text style={[styles.inlineInputText, isCorrectResult ? styles.correctText : styles.incorrectText]}>
                    {userInput || targetWord}
                  </Text>
                </View>
              );
            }
          }
          return (
            <Text key={index} style={styles.sentenceWord}>
              {part}
            </Text>
          );
        })}
      </View>
    );
  };

  const handleSubmitCheck = () => {
    if (!userInput.trim()) return;
    const cleanInput = userInput.trim().toLowerCase();
    const correct = cleanInput === targetWord.toLowerCase();

    setIsCorrectResult(correct);
    setIsEvaluated(true);

    if (correct) {
      const nextText = !currentItem.interval ? '정답! 내일 복습' : '정답! 3일 뒤 복습';
      setFeedbackText(nextText);
    } else {
      setFeedbackText('오답! 잠시 후 복습');
    }
  };

  const handleNextStep = () => {
    if (isCorrectResult) {
      onCorrect(currentItem);
    } else {
      onIncorrect(currentItem);
    }
    setUserInput('');
    setIsEvaluated(false);
    setIsFlipped(false); // 다음 문제로 갈 때는 앞면으로 초기화
    setFeedbackText('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* 상단바 & 프로그래스 바 */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtnWrapper}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>

          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            <Text style={styles.progressText}>{progressText}</Text>
          </View>
        </View>

        {/* 퀴즈 카드 영역 (탭하면 앞뒤로 플립 토글) */}
        <View style={styles.cardWrapperOuter}>
          <View style={[styles.cardTabBadge, isEvaluated && (isCorrectResult ? styles.badgeCorrect : styles.badgeIncorrect)]}>
            <Text style={styles.cardTabBadgeText}>{currentBadgeText}</Text>
          </View>

          {/* 정답을 맞힌 이후에만 카드를 탭해서 뒤집을 수 있게 하거나, 언제든 플립 가능하게 처리 */}
          <TouchableWithoutFeedback onPress={() => isEvaluated && setIsFlipped(!isFlipped)}>
            <View style={styles.cardContainerWrapper}>
              {!isFlipped ? (
                /* [앞면] 기존 문제 풀이 폼 */
                <View style={styles.quizCard}>
                  <View style={styles.topInfoBox}>
                    {renderHighlightedTranslation()}
                  </View>

                  <View style={styles.sentenceBox}>
                    {renderInlineSentence()}
                  </View>

                  {isEvaluated && (
                    <View style={styles.flipGuideContainer}>
                      <Text style={styles.flipGuideText}>👆 카드를 터치하면 페르소나 원문 카드로 뒤집힙니다</Text>
                    </View>
                  )}
                </View>
              ) : (
                /* [뒷면] 스와이프 기능이 제거된 고정형 SwipeCard (페르소나 카드) */
                <View style={styles.flippedCardView}>
                  <SwipeCard 
                    item={currentItem} 
                    errorCount={currentItem.errorCount || 0} 
                    isNext={false} 
                    disableSwipe={true}
                    isEvaluated={true}               // 테스트 결과 모드 활성화
                    isCorrect={isCorrectResult}      // 맞았는지 틀렸는지에 따라 테두리 색상 변경
                    feedbackText={feedbackText}      // '정답! 내일 복습' 또는 '오답! 잠시 후 복습' 뱃지 표시
                  />
                  <Text style={styles.flipGuideText}>👆 터치하면 다시 문제 화면으로 돌아갑니다</Text>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>

        {/* 하단 버튼 */}
        <View style={styles.bottomActionContainer}>
          {!isEvaluated ? (
            <TouchableOpacity 
              style={[styles.fullWidthBtn, !userInput.trim() && styles.disabledBtn]} 
              onPress={handleSubmitCheck}
              disabled={!userInput.trim()}
            >
              <Text style={styles.fullWidthBtnText}>확인</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.fullWidthBtn} onPress={handleNextStep}>
              <Text style={styles.fullWidthBtnText}>다음 문제로</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#f8f9fa', justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  closeBtnWrapper: { padding: 4 },
  closeBtn: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  progressBarBackground: { flex: 1, height: 32, backgroundColor: '#e4e7eb', borderRadius: 16, overflow: 'hidden', position: 'relative', justifyContent: 'center' },
  progressBarFill: { position: 'absolute', top: 0, left: 0, bottom: 0, backgroundColor: '#ffeaa7', borderRadius: 16 },
  progressText: { textAlign: 'center', fontSize: 13, fontWeight: 'bold', color: '#2d3436', zIndex: 2 },
  cardWrapperOuter: { position: 'relative', marginTop: 10 },
  cardTabBadge: { position: 'absolute', top: -16, left: 20, backgroundColor: '#485460', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, zIndex: 10 },
  badgeCorrect: { backgroundColor: '#27ae60' },
  badgeIncorrect: { backgroundColor: '#c0392b' },
  cardTabBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cardContainerWrapper: { width: '100%' },
  quizCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, paddingTop: 32, borderWidth: 2, borderColor: '#b2bec3', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  flippedCardView: { alignItems: 'center', width: '100%' },
  topInfoBox: { marginBottom: 24 },
  translationQuiz: { fontSize: 18, color: '#2d3436', lineHeight: 26, fontWeight: '600' },
  highlightText: { color: '#27ae60', fontWeight: 'bold' },
  sentenceBox: { marginBottom: 10 },
  inlineSentenceRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  sentenceWord: { fontSize: 22, fontWeight: '700', color: '#1e272e', lineHeight: 36, marginRight: 6 },
  inlineInputBox: { backgroundColor: '#e8f8f5', borderWidth: 1.5, borderColor: '#55efc4', borderRadius: 8, paddingHorizontal: 10, height: 40, fontSize: 18, fontWeight: '700', color: '#00b894', minWidth: 100, textAlign: 'center', marginHorizontal: 4, marginVertical: 4 },
  inlineInputText: { fontSize: 18, fontWeight: '700', textAlign: 'center', lineHeight: 34 },
  correctBox: { backgroundColor: '#d4edda', borderColor: '#28a745' },
  incorrectBox: { backgroundColor: '#f8d7da', borderColor: '#dc3545' },
  correctText: { color: '#155724' },
  incorrectText: { color: '#721c24' },
  flipGuideContainer: { marginTop: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f2f6', paddingTop: 10 },
  flipGuideText: { fontSize: 12, color: '#0984e3', fontWeight: '600', textAlign: 'center', marginTop: 4 },
  bottomActionContainer: { marginTop: 24, marginBottom: 10 },
  fullWidthBtn: { backgroundColor: '#111', height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  disabledBtn: { backgroundColor: '#b2bec3' },
  fullWidthBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});