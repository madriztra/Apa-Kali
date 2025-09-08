import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Impor semua screen yang sudah ada
import HomeScreen from './screens/HomeScreen';
import NameScreen from './screens/NameScreen';
import AturanMainScreen from './screens/AturanMainScreen';
import GamePlayScreen from './screens/GamePlayScreen';
import GamePlayScreen2 from './screens/GamePlayScreen2';
import TotalScoreScreen from './screens/TotalScoreScreen';
import Game3Screen from './screens/game3';
import LeaderboardScreen from './screens/LeaderboardScreen'; 
import AdminScreen from './screens/AdminScreen'; 

// --- 1. IMPOR SCREEN SKOR DI SINI ---
import SkorScreen from './screens/skor'; 

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const preventZoom = (e) => {
        if (e.touches.length > 1) e.preventDefault();
      };
      const preventWheelZoom = (e) => {
        if (e.ctrlKey) e.preventDefault();
      };
      document.addEventListener('touchmove', preventZoom, { passive: false });
      document.addEventListener('wheel', preventWheelZoom, { passive: false });

      return () => {
        document.removeEventListener('touchmove', preventZoom);
        document.removeEventListener('wheel', preventWheelZoom);
      };
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="AdminScreen" component={AdminScreen} />
        <Stack.Screen name="NameScreen" component={NameScreen} />
        <Stack.Screen name="AturanMainScreen" component={AturanMainScreen} />
        <Stack.Screen name="GamePlayScreen" component={GamePlayScreen} />
        <Stack.Screen name="GamePlayScreen2" component={GamePlayScreen2} />
        <Stack.Screen name="TotalScore" component={TotalScoreScreen} />
        <Stack.Screen name="Game3" component={Game3Screen} />
        <Stack.Screen name="Skor" component={SkorScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}