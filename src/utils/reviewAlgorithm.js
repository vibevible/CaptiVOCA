// src/utils/reviewAlgorithm.js

// 1. 정답을 맞혔을 때: 복습 간격을 늘리고 'known(아는 단어)' 상태로 전환 + 에러 카운트 초기화
export function calculateCorrectReview(item) {
  const now = new Date();
  const currentInterval = item.interval || 0; // 분 단위

  let nextIntervalMinutes = 0;
  let nextReviewText = '';

  // 간격 단계별 확장 (Spaced Repetition 기본 로직)
  if (currentInterval === 0) {
    nextIntervalMinutes = 1440; // 1일 뒤
    nextReviewText = '내일 복습';
  } else if (currentInterval < 1440) {
    nextIntervalMinutes = 4320; // 3일 뒤
    nextReviewText = '3일 뒤 복습';
  } else {
    nextIntervalMinutes = 10080; // 일주일 뒤
    nextReviewText = '일주일 뒤 복습';
  }

  return {
    ...item,
    status: 'known', // 정답을 맞췄으므로 아는 단어로 분류
    interval: nextIntervalMinutes,
    lastReviewedAt: now.toISOString(),
    nextReviewText: nextReviewText,
    errorCount: 0, // [추가] 정답을 맞히는 순간 오답 카운트 초기화 -> 카드 모드가 '기본 모드'로 돌아감
  };
}

// 2. 틀렸을 때: 헷갈리는 단어로 분류하고 '잠시 후 복습' (큐 맨 뒤로) + 에러 카운트 증가
export function calculateIncorrectReview(item) {
  const now = new Date();

  return {
    ...item,
    status: 'learning', // 헷갈리는 단어/학습 중 상태로 분류
    interval: 0, // 주기 초기화
    lastReviewedAt: now.toISOString(),
    nextReviewText: '잠시 후 복습',
    errorCount: (item.errorCount || 0) + 1, // 틀릴 때마다 카운트 증가 (3회 -> 매혹, 10회 -> 호러)
  };
}

// 3. 단어가 다시 등장했을 때 이전 테스트 시기 계산 (ex. "5분 전", "방금 전")
export function getFormattedPreviousTime(lastReviewedAt) {
  if (!lastReviewedAt) return '새로운 단어';

  const now = new Date();
  const past = new Date(lastReviewedAt);
  const diffMinutes = Math.floor((now - past) / (1000 * 60));

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}