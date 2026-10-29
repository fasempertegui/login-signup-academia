import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { colors, fonts } from '../styles/academia';

const variants = {
  success: { icon: 'check', color: colors.success, background: colors.successBackground },
  error: { icon: 'alerta', color: colors.error, background: colors.errorBackground },
  warning: { icon: 'alerta', color: colors.warning, background: colors.warningBackground },
  info: { icon: 'informacion', color: colors.information, background: colors.informationBackground },
};

export default function AppDialog({ dialog, onClose, onAction }) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const titleRef = useRef(null);
  const shown = useRef(false);
  const top = Math.max(20, insets.top);
  const bottom = Math.max(20, insets.bottom);
  const variant = variants[dialog?.variant] || variants.info;

  const focusTitle = () => {
    if (titleRef.current) AccessibilityInfo.sendAccessibilityEvent(titleRef.current, 'focus');
  };

  useEffect(() => {
    if (!dialog) {
      shown.current = false;
      return;
    }
    // Si hay avisos en cola, el Modal sigue abierto y cambia su contenido.
    if (shown.current) {
      const frame = requestAnimationFrame(focusTitle);
      return () => cancelAnimationFrame(frame);
    }
  }, [dialog?.id]);

  return (
    <Modal transparent visible={Boolean(dialog)} animationType="none" presentationStyle="overFullScreen" onRequestClose={onClose} onShow={() => { shown.current = true; focusTitle(); }}>
      {dialog && (
        <View style={[s.overlay, { paddingTop: top, paddingBottom: bottom }]}>
          <View style={[s.card, { maxHeight: Math.max(0, height - top - bottom) }]} accessibilityViewIsModal onAccessibilityEscape={onClose}>
            <ScrollView style={s.scroll} contentContainerStyle={s.content} bounces={false} keyboardShouldPersistTaps="handled">
              <View style={s.header}>
                <View style={[s.symbol, { backgroundColor: variant.background }]}>
                  <Icon name={variant.icon} size={26} color={variant.color} />
                </View>
                <TouchableOpacity style={s.close} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar aviso">
                  <Icon name="cerrar" size={24} color={colors.muted} />
                </TouchableOpacity>
              </View>
              <Text ref={titleRef} style={s.title} accessibilityRole="header" accessible>{dialog.title}</Text>
              <Text style={s.message}>{dialog.message}</Text>
              <View style={s.actions}>
                {dialog.actions.map((action, index) => (
                  <TouchableOpacity
                    key={`${dialog.id}-${index}`}
                    accessibilityRole="button"
                    style={[s.button, action.variant === 'secondary' && s.secondary, action.variant === 'danger' && s.danger, action.variant === 'success' && s.success, action.variant === 'warning' && s.warning]}
                    onPress={() => onAction(action)}
                  >
                    <Text style={[s.buttonText, action.variant === 'secondary' && s.secondaryText]}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, backgroundColor: colors.modalBackdrop },
  card: { width: '100%', maxWidth: 440, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.white },
  scroll: { flexGrow: 0 },
  content: { padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  symbol: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  close: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 20, fontFamily: fonts.title, fontSize: 24, lineHeight: 30, letterSpacing: -0.4, color: colors.text },
  message: { marginTop: 12, fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.muted },
  actions: { marginTop: 24, gap: 10 },
  button: { minHeight: 48, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 24, color: colors.white, textAlign: 'center' },
  secondary: { backgroundColor: colors.white, borderColor: colors.border },
  secondaryText: { color: colors.text },
  danger: { backgroundColor: colors.error, borderColor: colors.error },
  success: { backgroundColor: colors.success, borderColor: colors.success },
  warning: { backgroundColor: colors.warning, borderColor: colors.warning },
});
