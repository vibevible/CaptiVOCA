import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback } from 'react-native';
import SwipeCard from './SwipeCard';
import { getFormattedPreviousTime } from '../utils/reviewAlgorithm';

export default function TestQuizView({ currentItem, currentIndex, totalLength, fixedTotalLength, completedCount,  onCorrect, onIncorrect, onClose }) {
  const [userInput, setUserInput] = useState('');
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrectResult, setIsCorrectResult] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  
  // [추가] 유의어 입력 시 띄울 피드백 메시지 상태
  const [synonymMessage, setSynonymMessage] = useState('');
  const [antonymMessage, setAntonymMessage] = useState(''); // [추가] 반의어 피드백 메시지 상태

  // 앞면(문제 풀이 폼)과 뒷면(페르소나 카드) 전환을 위한 플립 상태
  const [isFlipped, setIsFlipped] = useState(false);

  const targetWord = currentItem.word;
  const currentVariant = currentItem.variants.default;
  const synonyms = currentItem.synonyms || []; // 단어장에 정의된 유의어 배열 (없으면 빈 배열)
  const antonyms = currentItem.antonyms || []; // 단어장에 정의된 반의어 배열 (없으면 빈 배열)
  const progressPercent = fixedTotalLength > 0 
    ? Math.min((completedCount / fixedTotalLength) * 100, 100) 
    : 0;
  
  const progressText = `${String(completedCount).padStart(2, '0')}/${String(fixedTotalLength).padStart(2, '0')}`;

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
                  onChangeText={(text) => {
                    setUserInput(text);
                    if (synonymMessage) setSynonymMessage(''); // 타이핑 다시 시작하면 유의어 메시지 초기화
                  }}
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
    
    console.log('사용자 입력:', cleanInput);
    console.log('정답 단어:', targetWord.toLowerCase());
    console.log('등록된 유의어 목록:', synonyms);
    console.log('등록된 반의어 목록:', antonyms);

    // 정답 체크
    if (cleanInput === targetWord.toLowerCase()) {
      setIsCorrectResult(true);
      setIsEvaluated(true);
      setSynonymMessage('');
      const nextText = !currentItem.interval ? '정답! 내일 복습' : '정답! 3일 뒤 복습';
      setFeedbackText(nextText);
      return;
    }

    // 유의어 체크
    const isSynonymMatch = synonyms.map(s => s.toLowerCase()).includes(cleanInput);
    console.log('유의어 매칭 여부:', isSynonymMatch);

    if (isSynonymMatch) {
      setSynonymMessage(`'${userInput.trim()}'도 의미가 통하는 좋은 답이에요. 이 퀴즈가 찾는 다른 단어도 떠올려 볼까요?`);
      return;
    }

    // 반의어 체크
    const isAntonymMatch = antonyms.map(a => a.toLowerCase()).includes(cleanInput);
    console.log('반의어 매칭 여부:', isAntonymMatch);

    if (isAntonymMatch) {
      setAntonymMessage(`'${userInput.trim()}'는 우리가 찾는 단어와 반대되는 뜻이에요. 다른 단어를 생각해 보세요.`);
      return;
    }

    // 완전 오답
    setIsCorrectResult(false);
    setIsEvaluated(true);
    setSynonymMessage('');
    setAntonymMessage('');
    setFeedbackText('오답! 잠시 후 복습');
  };

  const handleNextStep = () => {
    if (isCorrectResult) {
      onCorrect(currentItem);
    } else {
      onIncorrect(currentItem);
    }
    setUserInput('');
    setIsEvaluated(false);
    setIsFlipped(false);
    setFeedbackText('');
    setSynonymMessage('');
    setAntonymMessage('');
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

        {/* 퀴즈 카드 영역 */}
        <View style={styles.cardWrapperOuter}>
          <View style={[styles.cardTabBadge, isEvaluated && (isCorrectResult ? styles.badgeCorrect : styles.badgeIncorrect)]}>
            <Text style={styles.cardTabBadgeText}>{currentBadgeText}</Text>
          </View>

          <TouchableWithoutFeedback onPress={() => isEvaluated && setIsFlipped(!isFlipped)}>
            <View style={styles.cardContainerWrapper}>
              {!isFlipped ? (
                <View style={styles.quizCard}>
                  <View style={styles.topInfoBox}>
                    {renderHighlightedTranslation()}
                  </View>

                  <View style={styles.sentenceBox}>
                    {renderInlineSentence()}
                  </View>

                  {/* 유의어 입력 시 나타나는 안내 박스 */}
                  {synonymMessage ? (
                    <View style={styles.synonymAlertBox}>
                      <Text style={styles.synonymAlertText}>👾 : {synonymMessage}</Text>
                    </View>
                  ) : null}
                  {/* 반의어 입력 시 나타나는 안내 박스 */}
                  {antonymMessage ? (
                    <View style={styles.antonymAlertBox}>
                      <Text style={styles.antonymAlertText}>🚨 : {antonymMessage}</Text>
                    </View>
                  ) : null}

                  {isEvaluated && (
                    <View style={styles.flipGuideContainer}>
                      <Text style={styles.flipGuideText}>👆 카드를 터치하면 페르소나 원문 카드로 뒤집힙니다</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.flippedCardView}>
                  <SwipeCard 
                    item={currentItem} 
                    errorCount={currentItem.errorCount || 0} 
                    isNext={false} 
                    disableSwipe={true}
                    isEvaluated={true} 
                    isCorrect={isCorrectResult} 
                    feedbackText={feedbackText} 
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
  synonymAlertBox: { backgroundColor: '#e8f8f5', borderWidth: 1.5, borderColor: '#2ecc71', padding: 12, borderRadius: 12, marginTop: 12 },
  synonymAlertText: { color: '#27ae60', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  antonymAlertBox: { backgroundColor: '#f8d7da', borderWidth: 1.5, borderColor: '#e74c3c', padding: 12, borderRadius: 12, marginTop: 12 },
  antonymAlertText: { color: '#c0392b', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  flipGuideContainer: { marginTop: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f2f6', paddingTop: 10 },
  flipGuideText: { fontSize: 12, color: '#0984e3', fontWeight: '600', textAlign: 'center', marginTop: 4 },
  bottomActionContainer: { marginTop: 24, marginBottom: 10 },
  fullWidthBtn: { backgroundColor: '#111', height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  disabledBtn: { backgroundColor: '#b2bec3' },
  fullWidthBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});