import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const { width } = Dimensions.get('window');

// 페르소나 상태에 따른 카드 배경색 매핑
function getCardBackgroundColor(personaState) {
  switch (personaState) {
    case 'seductive':
      return styles.bgSeductive; // 옅은 빨강 톤
    case 'horror':
      return styles.bgHorror;    // 옅은 보라 톤
    default:
      return styles.bgDefault;   // 기본 흰색
  }
}

export default function CardEdge({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  isNext = false, 
  disableSwipe = false,
  isEvaluated = false,       
  isCorrect = true,          
  personaState = 'default'   // 페르소나 상태 전달받기
}) {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .enabled(!isNext && !disableSwipe) 
    .onChange((event) => {
      translationX.value = event.translationX;
      translationY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationX > 100) {
        if (onSwipeRight) scheduleOnRN(onSwipeRight);
        translationX.value = withSpring(width * 1.5, { velocity: event.velocityX, damping: 60, stiffness: 160 });
      } else if (event.translationX < -100) {
        if (onSwipeLeft) scheduleOnRN(onSwipeLeft);
        translationX.value = withSpring(-width * 1.5, { velocity: event.velocityX, damping: 60, stiffness: 160 });
      } else {
        translationX.value = withSpring(0);
        translationY.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { rotate: `${(translationX.value / width) * 15}deg` },
    ],
  }));

  const leftOverlayStyle = useAnimatedStyle(() => ({
    opacity: translationX.value < 0 ? Math.min(Math.abs(translationX.value) / 100, 1) : 0,
  }));

  const rightOverlayStyle = useAnimatedStyle(() => ({
    opacity: translationX.value > 0 ? Math.min(translationX.value / 100, 1) : 0,
  }));

  const edgeBorderStyle = isEvaluated ? [
    styles.evaluatedCard,
    isCorrect ? styles.correctBorder : styles.incorrectBorder
  ] : null;

  const cardBgStyle = getCardBackgroundColor(personaState);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, cardBgStyle, edgeBorderStyle, animatedCardStyle]}>

        {children}

        {!isNext && !disableSwipe && !isEvaluated && (
          <>
            <Animated.View style={[styles.overlay, styles.leftOverlay, leftOverlayStyle]}>
              <View style={styles.overlayContent}>
                <Text style={styles.overlayIcon}>🗑️</Text>
                <Text style={styles.overlayTitle}>아는 단어</Text>
                <Text style={styles.overlaySub}>라이브러리에 숨겨둘게요.</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.overlay, styles.rightOverlay, rightOverlayStyle]}>
              <View style={styles.overlayContent}>
                <Text style={styles.overlayIcon}>✅</Text>
                <Text style={styles.overlayTitle}>학습할 단어</Text>
                <Text style={styles.overlaySub}>플래시카드에서 만나요.</Text>
              </View>
            </Animated.View>
          </>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    height: 540,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
    alignSelf: 'center',
    position: 'relative',
  },
  // 배경 색상 테마 정의
  bgDefault: {
    backgroundColor: '#ffffff',
  },
  bgSeductive: {
    backgroundColor: '#fff5f5', // 아주 옅은 붉은빛 배경
  },
  bgHorror: {
    backgroundColor: '#fbf5ff',   // 아주 옅은 보라빛 배경
  },
  evaluatedCard: {
    borderWidth: 3, 
  },
  correctBorder: {
    borderColor: '#2ecc71', 
  },
  incorrectBorder: {
    borderColor: '#e74c3c', 
  },
  resultBadge: {
    position: 'absolute',
    top: 12,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    zIndex: 20,
  },
  badgeCorrectBg: { backgroundColor: '#2ecc71' },
  badgeIncorrectBg: { backgroundColor: '#e74c3c' },
  resultBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 99,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    borderRadius: 24,
  },
  leftOverlay: { backgroundColor: 'rgba(90, 95, 100, 0.95)' },
  rightOverlay: { backgroundColor: 'rgba(56, 142, 60, 0.95)' },
  overlayContent: { alignItems: 'center' },
  overlayIcon: { fontSize: 48, marginBottom: 16 },
  overlayTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  overlaySub: { fontSize: 16, color: '#e2e8f0' },
});