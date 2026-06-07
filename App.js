import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GameProvider } from './src/context/GameContext';
import TitleScreen from './src/screens/TitleScreen';
import StarterSelectScreen from './src/screens/StarterSelectScreen';
import OverworldScreen from './src/screens/OverworldScreen';
import BattleScreen from './src/screens/BattleScreen';
import PartyScreen from './src/screens/PartyScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GameProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Title"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#1a1a2e' },
            animationEnabled: true,
          }}
        >
          <Stack.Screen name="Title"         component={TitleScreen} />
          <Stack.Screen name="StarterSelect" component={StarterSelectScreen} />
          <Stack.Screen name="Overworld"     component={OverworldScreen} />
          <Stack.Screen name="Battle"        component={BattleScreen} />
          <Stack.Screen name="Party"         component={PartyScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GameProvider>
  );
}
