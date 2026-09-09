import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import StudyScreen from './src/screens/StudyScreen'; // 스키밍 화면
import TestScreen from './src/screens/TestScreen';   // 복습 퀴즈 화면
// import LibraryScreen from './src/screens/LibraryScreen'; // 라이브러리 화면
// import SettingsScreen from './src/screens/SettingsScreen'; // 설정 화면

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Study" component={StudyScreen} />
          <Stack.Screen name="Test" component={TestScreen} />
          {/* <Stack.Screen name="Library" component={LibraryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}