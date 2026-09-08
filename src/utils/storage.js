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
    // [임시 강제 초기화 코드] 
    // 개발 중 데이터가 꼬였을 때 아래 주석을 풀고 앱을 한 번 켰다가 다시 주석 처리하면 싹 초기화됩니다!
    await AsyncStorage.removeItem(VOCAB_STORAGE_KEY);

    const jsonValue = await AsyncStorage.getItem(VOCAB_STORAGE_KEY);
    if (jsonValue != null) {
      const parsed = JSON.parse(jsonValue);
      // 저장된 데이터가 있고, 최신 데이터셋의 단어 개수나 구조와 맞다면 그대로 사용
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