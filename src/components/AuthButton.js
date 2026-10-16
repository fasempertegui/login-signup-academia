import React from 'react';
import { Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Icon from './Icon';
import { colors, fonts } from '../styles/academia';

export default function AuthButton({ title, onPress, disabled, secondary = false, inset = true }) {
  const gutter = useWindowDimensions().width <= 360 ? 20 : 28;
  const color = secondary ? colors.primary : colors.white;
  return <TouchableOpacity accessibilityRole="button" onPress={onPress} disabled={disabled} style={[s.button, secondary && s.secondary, inset && { marginHorizontal: gutter }, disabled && { opacity: 0.5 }]}>
    <Text style={[s.text, { color }]}>{title}</Text><Icon name="flecha" size={24} color={color} />
  </TouchableOpacity>;
}
const s = StyleSheet.create({
  button: { minHeight: 48, paddingVertical: 11, paddingHorizontal: 16, borderWidth: 1, borderColor: 'transparent', borderRadius: 10, backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  secondary: { borderColor: colors.primary, backgroundColor: colors.white },
  text: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 24 },
});
