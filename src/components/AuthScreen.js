import React from 'react';
import { View, Text, Image, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import Icon from './Icon';
import { colors, fonts, styles } from '../styles/academia';

export default function AuthScreen({ form, headerHeight, title, description, compact = false, onBack, children }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const gutter = width <= 360 ? 20 : 28;
  const heroHeight = compact ? 160 : Math.max(260, Math.min(height * 0.36, 330));
  const photoScale = Math.max(Math.min(width, 480) / 1672, heroHeight / 941);
  const photoWidth = photoScale * 1672;
  const photoHeight = photoScale * 941;

  return (
    <KeyboardAvoidingView style={s.screen} behavior="height" enabled={Platform.OS === 'android'} keyboardVerticalOffset={headerHeight}>
      <StatusBar style="light" />
      <ScrollView
        ref={form.scrollRef}
        style={s.scroll}
        contentContainerStyle={[s.content, { paddingBottom: Math.max(24, insets.bottom) + form.bottomSpace }]}
        onLayout={form.onScrollLayout}
        onContentSizeChange={form.onContentSizeChange}
        automaticallyAdjustKeyboardInsets={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[s.hero, { height: heroHeight }]}>
          <Image source={require('../../assets/cancha-violeta.png')} style={{ position: 'absolute', width: photoWidth, height: photoHeight, right: 0, top: (heroHeight - photoHeight) * 0.55 }} resizeMode="stretch" />
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
            <Defs><LinearGradient id="heroShade" x1="0%" y1="0%" x2="100%" y2="0%"><Stop offset="0" stopColor={colors.night} stopOpacity={0.68} /><Stop offset="0.75" stopColor={colors.night} stopOpacity={0.12} /></LinearGradient></Defs>
            <Rect width="100%" height="100%" fill="url(#heroShade)" />
          </Svg>
          <View style={[s.brand, { left: width <= 360 ? 20 : 26, top: Math.max(22, insets.top) }]}>
            <View style={s.logoFrame}><Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain" accessibilityLabel="Academia TM" /></View>
            <View><Text style={s.brandName}>Academia TM</Text><Text style={s.location}>TENIS · SALTA</Text></View>
          </View>
          {!compact && <View style={[s.heroText, { left: width <= 360 ? 22 : 28 }]}>
            <View style={s.line} />
            <Text style={[s.heroTitle, { fontSize: Math.max(44, Math.min(width * 0.12, 48)) }]}>Volvé a{'\n'}la cancha<Text style={{ color: colors.lime }}>.</Text></Text>
          </View>}
        </View>
        <View style={[s.heading, { paddingHorizontal: gutter }]}>
          {onBack && <TouchableOpacity onPress={onBack} style={styles.back} accessibilityRole="button"><Icon name="atras" size={24} color={colors.primary} /><Text style={styles.link}>Iniciar sesión</Text></TouchableOpacity>}
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        {/* Los campos son hijos directos del ScrollView: el hook recibe coordenadas del contenido. */}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  scroll: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: colors.background },
  content: { flexGrow: 1 },
  hero: { backgroundColor: colors.primary, overflow: 'hidden' },
  brand: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 11 },
  logoFrame: { width: 42, height: 42, padding: 2, borderWidth: 1, borderColor: '#DDD3E5', borderRadius: 7, backgroundColor: colors.white },
  logo: { width: '100%', height: '100%' },
  brandName: { fontFamily: fonts.title, fontSize: 17, letterSpacing: -0.4, color: colors.white, transform: [{ scaleX: 0.9 }], transformOrigin: 'left center' },
  location: { marginTop: 1, fontFamily: fonts.medium, fontSize: 10, letterSpacing: 2, color: '#DDD3E5' },
  heroText: { position: 'absolute', bottom: 36 },
  line: { width: 32, height: 3, backgroundColor: colors.lime, marginBottom: 15 },
  heroTitle: { fontFamily: fonts.hero, lineHeight: 49, letterSpacing: -1.4, color: colors.white, transform: [{ scaleX: 0.9 }], transformOrigin: 'left center' },
  heading: { marginTop: -18, borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: colors.background, paddingTop: 30, paddingBottom: 26 },
});
