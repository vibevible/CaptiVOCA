import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import initialVocabulary from '../../data/vocabulary.json';
import { loadVocabularyState, loadLearningStep, loadTestTotalCount } from '../utils/storage';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('토익');
  const [activeTab, setActiveTab] = useState('홈');

  const baseStartDate = new Date(2026, 8, 7); 
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 8, 7));

  const [vocabularyData, setVocabularyData] = useState([]);
  const [stepState, setStepState] = useState('skimming'); // 'skimming' | 'test' | 'completed'

  // 통계 및 프로그래스 계산
  const totalCount = vocabularyData.length;
  const knownCount = vocabularyData.filter(item => item.status === 'known').length;

  const [testTotal, setTestTotal] = useState(0);

  // 홈 화면에 들어올 때마다 저장된 명시적 학습 단계를 불러옴
  useFocusEffect(
    useCallback(() => {
      async function fetchStatus() {
        try {
          const loadedData = await loadVocabularyState(initialVocabulary);
          setVocabularyData(loadedData);

          const currentStep = await loadLearningStep();
          setStepState(currentStep);

          // 💡 저장된 테스트 총 모수 불러오기
          const savedTestTotal = await loadTestTotalCount();
          setTestTotal(savedTestTotal);
        } catch (e) {
          console.error('홈 데이터 로딩 실패:', e);
        }
      }
      fetchStatus();
    }, [])
  );

  const generateWeekDays = (centerDate) => {
    const week = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(centerDate);
      d.setDate(centerDate.getDate() + i);
      
      const diffTime = d.getTime() - baseStartDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

      week.push({
        dateObj: d,
        dayNumber: diffDays > 0 ? diffDays : 1,
        dateNum: d.getDate(),
        dayOfWeek: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
        isSelected: d.toDateString() === centerDate.toDateString(),
      });
    }
    return week;
  };

  const weekDays = generateWeekDays(selectedDate);
  const currentDayNumber = weekDays.find(d => d.isSelected)?.dayNumber || 1;

  // 단계별 카드 설정 (명시적 stepState 활용)
  const getCardInfo = () => {
    switch (stepState) {
      case 'skimming': {
        return {
          title: '스키밍',
          progress: '0%',
          statusText: '시작 전',
          countText: `${totalCount}개`,
          description: '모르는 단어를 골라주세요.',
          buttonText: '바로 시작',
          onPress: () => navigation.navigate('Study'),
          imageSource: require('../../assets/images/skimming_img.png'), 
        };
      }
      case 'test': {
        // 1. 전체 단어 중, 스키밍 직후 테스트 대상으로 잡혔던 단어들 중 아직 'known'이 아닌 개수
        // 또는 저장된 testTotal을 기준으로 역산
        const remainingTestItems = vocabularyData.filter(item => item.status !== 'known').length;
        
        // 2. 완료된 개수 = (스키밍 직후 총 테스트 대상 수) - (현재 남은 테스트 대상 수)
        // 단, 마이너스가 되지 않도록 Math.max 처리
        const completedTestCount = Math.max(0, testTotal - remainingTestItems);
        
        // 3. 원래의 테스트 대상 총 개수(testTotal)를 분모로 한 정확한 퍼센트!
        const testProgressPercent = testTotal > 0 
          ? Math.min(100, Math.round((completedTestCount / testTotal) * 100)) 
          : 0;

        return {
          title: '테스트 & 복습',
          progress: `${testProgressPercent}%`, // 👈 원래 테스트 대상 개수 기준 퍼센트
          statusText: '진행 중',
          countText: `${remainingTestItems}개 남음`,
          description: '인출형 빈칸 테스트로 실력을 확인하세요.',
          buttonText: '테스트 이어하기',
          onPress: () => navigation.navigate('Test'),
          imageSource: require('../../assets/images/test_img.png'), 
        };
      }
      case 'completed':
      default: {
        return {
          title: '학습 완료',
          progress: '100%',
          statusText: '모든 학습 완료',
          countText: 'COMPLETE',
          description: '오늘의 단어 학습을 모두 끝냈습니다! 🎉',
          buttonText: '다시 복습하기',
          onPress: () => navigation.navigate('Study'),
          imageSource: require('../../assets/images/completed_img.png'), 
        };
      }
    }
  };

  const currentCard = getCardInfo();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.categorySelector}>
          <Text style={styles.categoryTitle}>{selectedCategory} ∨</Text>
        </View>
        <View style={styles.modeSelector}>
          <Text style={[styles.modeText, styles.activeMode]}>어휘</Text>
          <Text style={styles.modeText}>실전</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* 날짜 스트립 캘린더 */}
        <View style={styles.dateStrip}>
          <View style={styles.weekLabelRow}>
            {weekDays.map((item, idx) => (
              <Text key={idx} style={[styles.weekLabel, item.isSelected && styles.activeWeekLabel]}>
                {item.dayOfWeek}
              </Text>
            ))}
          </View>
          <View style={styles.dateNumberRow}>
            {weekDays.map((item, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.dateItem, item.isSelected && styles.activeDateItem]}
                onPress={() => setSelectedDate(item.dateObj)}
              >
                <Text style={[styles.dateText, item.isSelected && styles.activeDateText]}>
                  {item.dateNum}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.dayTitle}>Day {currentDayNumber}</Text>

        {/* 통합 일체형 미션 카드 */}
        <View style={styles.missionCard}>
          <View style={styles.cardImageContainer}>
            <Image 
              source={currentCard.imageSource} 
              style={styles.cardImage} 
              resizeMode="cover"
            />
          </View>
          
          <View style={styles.cardInnerContent}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardSectionTitle}>{currentCard.title}</Text>
              <Text style={styles.cardSettingsIcon}>⚙️</Text>
            </View>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: currentCard.progress }]} />
            </View>

            <View style={styles.cardInfoRow}>
              <Text style={styles.cardSubText}>{currentCard.statusText}</Text>
              <Text style={styles.cardSubText}>{currentCard.countText}</Text>
            </View>

            <Text style={styles.cardActionDesc}>{currentCard.description}</Text>

            <TouchableOpacity 
              style={styles.startButton}
              onPress={currentCard.onPress}
            >
              <Text style={styles.startButtonText}>{currentCard.buttonText}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.promoBanner}>
          <Text style={styles.promoBannerText}>🔥 CaptiVoca 하나로 끝내세요! </Text>
        </TouchableOpacity>

      </ScrollView>

      <View style={styles.tabBar}>
        {['홈', '라이브러리', '분석', '멤버십'].map((tab, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.tabItem}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  categoryTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  modeSelector: { flexDirection: 'row', gap: 16 },
  modeText: { fontSize: 16, color: '#aaa', fontWeight: '600' },
  activeMode: { color: '#111', fontWeight: 'bold' },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  dateStrip: { marginVertical: 12 },
  weekLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  weekLabel: { width: width / 8, textAlign: 'center', color: '#888', fontSize: 12 },
  activeWeekLabel: { color: '#111', fontWeight: 'bold' },
  dateNumberRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateItem: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  activeDateItem: { backgroundColor: '#111' },
  dateText: { fontSize: 16, fontWeight: '600', color: '#333' },
  activeDateText: { color: '#fff' },
  dayTitle: { fontSize: 22, fontWeight: '800', color: '#111', marginVertical: 16 },
  
  missionCard: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#f0f0f0', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 12, 
    elevation: 4,
    overflow: 'hidden' 
  },
  cardImageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#eaeaea',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardInnerContent: {
    padding: 20,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  cardSettingsIcon: { fontSize: 16 },
  progressBarBg: { height: 6, backgroundColor: '#f1f2f6', borderRadius: 3, marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: '#111', borderRadius: 3 },
  cardInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  cardSubText: { fontSize: 13, color: '#888' },
  cardActionDesc: { fontSize: 15, fontWeight: '600', color: '#333', textAlign: 'center', marginBottom: 16 },
  startButton: { backgroundColor: '#111', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  promoBanner: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  promoBannerText: { fontWeight: 'bold', color: '#111', fontSize: 14 },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 65, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  tabText: { fontSize: 12, color: '#aaa', fontWeight: '600' },
  activeTabText: { color: '#111', fontWeight: 'bold' },
});