import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('토익');
  const [activeTab, setActiveTab] = useState('홈');

  // 현재 날짜(2026년 9월 7일)를 기준으로 Day 1 시작 설정
  const baseStartDate = new Date(2026, 8, 7); 
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 8, 7));

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

        {/* 1. 스키밍 카드 (StudyScreen으로 이동) */}
        <View style={styles.missionCard}>
          <View style={styles.stackedCardsPreview}>
            <View style={[styles.miniCardMock, { transform: [{ rotate: '-6deg' }], left: 20 }]} />
            <View style={[styles.miniCardMock, { transform: [{ rotate: '-3deg' }], left: 45 }]} />
            <View style={[styles.miniCardMock, { transform: [{ rotate: '0deg' }], left: 70, zIndex: 3 }]} />
          </View>
          
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionTitle}>스키밍</Text>
            <Text style={styles.cardSettingsIcon}>⚙️</Text>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '0%' }]} />
          </View>

          <View style={styles.cardInfoRow}>
            <Text style={styles.cardSubText}>시작 전</Text>
            <Text style={styles.cardSubText}>~11분</Text>
          </View>

          <Text style={styles.cardActionDesc}>모르는 단어 32개를 골라주세요.</Text>

          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => navigation.navigate('Study')}
          >
            <Text style={styles.startButtonText}>바로 시작</Text>
          </TouchableOpacity>
        </View>

        {/* 2. 복습 카드 (TestScreen으로 이동) */}
        <View style={styles.missionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionTitle}>복습 (퀴즈)</Text>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '0%' }]} />
          </View>

          <View style={styles.cardInfoRow}>
            <Text style={styles.cardSubText}>시작 전</Text>
            <Text style={styles.cardSubText}>~5분</Text>
          </View>

          <Text style={styles.cardActionDesc}>인출형 빈칸 테스트로 실력을 확인하세요.</Text>

          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => navigation.navigate('Test')}
          >
            <Text style={styles.startButtonText}>바로 시작</Text>
          </TouchableOpacity>
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
  missionCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  stackedCardsPreview: { height: 60, marginBottom: 10, position: 'relative' },
  miniCardMock: { position: 'absolute', width: 45, height: 55, backgroundColor: '#e1e1e1', borderRadius: 6, borderWidth: 1, borderColor: '#fff' },
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