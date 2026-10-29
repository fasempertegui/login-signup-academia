import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { colors, fonts } from '../styles/academia';
import portal from '../styles/portal';

export default function AccountSidebar({ visible, usuario, status, section, onClose, onNavigate, onLogOut, loggingOut }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [presented, setPresented] = useState(visible);
  const [reducedMotion, setReducedMotion] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const afterClose = useRef(null);
  const panelWidth = Math.min(340, width * 0.9);
  const offset = Math.max(0, (width - 480) / 2);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReducedMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { active = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (visible) setPresented(true);
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: reducedMotion ? 0 : visible ? 200 : 160,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) {
        setPresented(false);
        const action = afterClose.current;
        afterClose.current = null;
        action?.();
      }
    });
    return () => animation.stop();
  }, [visible, progress, reducedMotion]);

  const close = action => { afterClose.current = action || null; onClose(); };
  const nombre = [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ');
  const initials = [usuario?.nombre?.[0], usuario?.apellido?.[0]].filter(Boolean).join('').toUpperCase();
  const navigate = destination => close(() => onNavigate(destination));
  return <Modal visible={visible || presented} transparent animationType="none" onRequestClose={() => close()}>
    <View style={s.overlay}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.modalBackdrop, opacity: progress }]} />
      <Pressable style={StyleSheet.absoluteFill} onPress={() => close()} accessible={false} importantForAccessibility="no" />
      <Animated.View style={[s.panel, { width: panelWidth, marginLeft: offset, paddingTop: Math.max(24, insets.top), paddingBottom: Math.max(24, insets.bottom), transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-(panelWidth + offset), 0] }) }] }]} accessibilityViewIsModal onAccessibilityEscape={() => close()}>
        <ScrollView contentContainerStyle={s.content}>
          <View style={s.header}><Text style={s.heading} accessibilityRole="header">Tu cuenta</Text><TouchableOpacity style={portal.iconButton} onPress={() => close()} accessibilityRole="button" accessibilityLabel="Cerrar menú"><Icon name="cerrar" size={24} color={colors.text} /></TouchableOpacity></View>
          <TouchableOpacity style={s.miniProfile} onPress={() => navigate('perfil')} accessibilityRole="button" accessibilityLabel="Ver mi perfil">
            <View style={s.avatar}>{status === 'loading' ? <ActivityIndicator color={colors.textOnLime} /> : <Text style={s.initials}>{initials || 'TM'}</Text>}</View>
            <View style={s.identity}><Text style={s.name}>{nombre || (status === 'loading' ? 'Cargando perfil…' : 'Mi cuenta')}</Text>{usuario?.nombreUsuario ? <Text style={s.username}>@{usuario.nombreUsuario}</Text> : null}</View>
            <Icon name="chevron" size={20} color={colors.textOnDark} />
          </TouchableOpacity>
          <Text style={s.group}>Mi actividad</Text>
          <TouchableOpacity style={s.row} onPress={() => navigate('inicio')} accessibilityRole="button" accessibilityState={{ selected: section === 'inicio' }}><Icon name="casa" color={colors.primary} /><Text style={s.rowText}>Inicio</Text></TouchableOpacity>
          <Text style={s.group}>Academia</Text>
          <TouchableOpacity style={s.row} disabled accessibilityRole="button" accessibilityState={{ disabled: true }}><Icon name="ubicacion" color={colors.disabledText} /><Text style={[s.rowText, s.disabled]}>Sedes</Text></TouchableOpacity>
          <View style={s.footer}><TouchableOpacity style={s.row} onPress={() => close(onLogOut)} disabled={loggingOut} accessibilityRole="button" accessibilityState={{ disabled: loggingOut }}><Icon name="salir" color={colors.muted} /><Text style={[s.rowText, s.secondary]}>{loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</Text></TouchableOpacity></View>
        </ScrollView>
      </Animated.View>
    </View>
  </Modal>;
}

const s = StyleSheet.create({
  overlay: { flex: 1 },
  panel: { flex: 1, paddingHorizontal: 24, backgroundColor: colors.background },
  content: { flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 24 },
  heading: { fontFamily: fonts.title, fontSize: 24, color: colors.text, flex: 1 },
  miniProfile: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 20, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.night },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: fonts.title, fontSize: 17, color: colors.textOnLime },
  identity: { flex: 1, minWidth: 0 },
  name: { fontFamily: fonts.title, fontSize: 21, lineHeight: 27, color: colors.white },
  username: { marginTop: 5, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textOnDark },
  group: { marginTop: 24, marginBottom: 8, fontFamily: fonts.medium, fontSize: 14, color: colors.arcillaText },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', minHeight: 52, paddingVertical: 12 },
  rowText: { flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.text },
  disabled: { color: colors.disabledText },
  secondary: { color: colors.muted },
  footer: { marginTop: 'auto', paddingTop: 24, borderTopWidth: 1, borderTopColor: colors.separator },
});
