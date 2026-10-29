import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { colors } from './src/styles/academia';
import 'react-native-gesture-handler';
import Navigation from './navigation/Navigation';
import { DialogProvider } from './src/context/DialogContext';

const fontAssets = {
  AnybodySemiBold: require('@expo-google-fonts/anybody/600SemiBold/Anybody_600SemiBold.ttf'),
  AnybodyBold: require('@expo-google-fonts/anybody/700Bold/Anybody_700Bold.ttf'),
  AtkinsonRegular: require('@expo-google-fonts/atkinson-hyperlegible-next/400Regular/AtkinsonHyperlegibleNext_400Regular.ttf'),
  AtkinsonMedium: require('@expo-google-fonts/atkinson-hyperlegible-next/500Medium/AtkinsonHyperlegibleNext_500Medium.ttf'),
  AtkinsonSemiBold: require('@expo-google-fonts/atkinson-hyperlegible-next/600SemiBold/AtkinsonHyperlegibleNext_600SemiBold.ttf'),
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  return <SafeAreaProvider>
    {fontsLoaded ? <DialogProvider><Navigation /></DialogProvider> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      {fontError ? <Text>No se pudieron cargar las tipografías. Reiniciá la aplicación.</Text> : <ActivityIndicator color={colors.primary} />}
    </View>}
  </SafeAreaProvider>;
}
