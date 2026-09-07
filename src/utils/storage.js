// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const VOCAB_STORAGE_KEY = '@vocabulary_state_v1';

// 단어 전체 상태 저장하기
export async function saveVocabularyState(vocabList) {
  try {
    const jsonValue = JSON.stringify(vocabList);
    await AsyncStorage.setItem(VOCAB_STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save vocabulary state', e);
  }
}

// 저장된 단어 상태 불러오기 (없거나 비어있으면 기본값 반환)
export async function loadVocabularyState(defaultList) {
  try {
    const jsonValue = await AsyncStorage.getItem(VOCAB_STORAGE_KEY);
    if (jsonValue != null) {
      const parsed = JSON.parse(jsonValue);
      // 저장된 배열은 있으나 내부가 비어있다면 기본 데이터 반환
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