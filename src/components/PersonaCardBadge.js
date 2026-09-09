// 오답에 따른 카드의 페르소나 상태를 결정하는 컴포넌트

export const getCardPersonaState = (errorCount) => {
  if (errorCount >= 8) return 'horror';
  if (errorCount >= 3) return 'seductive';
  return 'default';
};