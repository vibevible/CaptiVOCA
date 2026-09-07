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

// 저장된 단어 상태 불러오기 (없으면 기본값 반환)
export async function loadVocabularyState(defaultList) {
  try {
    const jsonValue = await AsyncStorage.getItem(VOCAB_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultList;
  } catch (e) {
    console.error('Failed to load vocabulary state', e);
    return defaultList;
  }
}