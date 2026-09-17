import AsyncStorage from '@react-native-async-storage/async-storage';

const VOCAB_STORAGE_KEY = '@vocabulary_state_v1';

export async function saveVocabularyState(vocabList) {
  try {
    const jsonValue = JSON.stringify(vocabList);
    await AsyncStorage.setItem(VOCAB_STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save vocabulary state', e);
  }
}

export async function loadVocabularyState(defaultList) {
  try {
    // [개발 중 초기화 필요 시 아래 주석 해제]
    // await AsyncStorage.removeItem(VOCAB_STORAGE_KEY);

    const jsonValue = await AsyncStorage.getItem(VOCAB_STORAGE_KEY);
    if (jsonValue != null) {
      const parsed = JSON.parse(jsonValue);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return defaultList;
  } catch (e) {
    console.error('Failed to load vocabulary state', e);
    return defaultList;
  }
}

const PROGRESS_STATE_KEY = '@learning_step_state_v1';

// 현재 학습 단계 저장 ('skimming' | 'test' | 'completed')
export async function saveLearningStep(step) {
  try {
    await AsyncStorage.setItem(PROGRESS_STATE_KEY, step);
  } catch (e) {
    console.error('Failed to save learning step', e);
  }
}

// 현재 학습 단계 불러오기 (기본값은 'skimming')
export async function loadLearningStep() {
  try {
    const step = await AsyncStorage.getItem(PROGRESS_STATE_KEY);
    return step ? step : 'skimming';
  } catch (e) {
    console.error('Failed to load learning step', e);
    return 'skimming';
  }
}

const TEST_TOTAL_KEY = '@test_total_count_v1';

// 테스트 총 개수 저장
export async function saveTestTotalCount(count) {
  try {
    await AsyncStorage.setItem(TEST_TOTAL_KEY, JSON.stringify(count));
  } catch (e) {
    console.error('Failed to save test total count', e);
  }
}

// 테스트 총 개수 불러오기
export async function loadTestTotalCount() {
  try {
    const value = await AsyncStorage.getItem(TEST_TOTAL_KEY);
    return value ? JSON.parse(value) : 0;
  } catch (e) {
    console.error('Failed to load test total count', e);
    return 0;
  }
}