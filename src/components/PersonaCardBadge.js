// src/components/PersonaCardBadge.js

// 오답 횟수에 따라 카드의 페르소나 상태를 결정하는 핵심 함수
export const getCardPersonaState = (errorCount) => {
  if (errorCount >= 10) return 'horror';
  if (errorCount >= 3) return 'seductive';
  return 'default';
};