import React from 'react';
import { Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Icon from './Icon';
import { colors, fonts } from '../styles/academia';

export default function AuthButton({ title, onPress, disabled, secondary = false, inset = true, tone }) {
  const gutter = useWindowDimensions().width <= 360 ? 20 : 28;
  const color = tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : secondary ? colors.primary : colors.white;
  const toneStyle = tone === 'success' ? s.success : tone === 'warning' ? s.warning : null;
  return <TouchableOpacity accessibilityRole="button" onPress={onPress} disabled={disabled} style={[s.button, secondary && s.secondary, toneStyle, inset && { marginHorizontal: gutter }, disabled && { opacity: 0.5 }]}>
    <Text style={[s.text, { color }]}>{title}</Text><Icon name="flecha" size={24} color={color} />
  </TouchableOpacity>;
}
const s = StyleSheet.create({
  button: { minHeight: 48, paddingVertical: 11, paddingHorizontal: 16, borderWidth: 1, borderColor: 'transparent', borderRadius: 10, backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  secondary: { borderColor: colors.primary, backgroundColor: colors.white },
  success: { borderColor: colors.success, backgroundColor: colors.successBackground },
  warning: { borderColor: colors.warning, backgroundColor: colors.warningBackground },
  text: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 24 },
});
