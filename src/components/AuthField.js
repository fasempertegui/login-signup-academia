import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Icon from './Icon';
import { colors, fonts } from '../styles/academia';

export default function AuthField({ label, icon, hint, error, children, containerStyle, onLayout, onFocus, onBlur, password, showPassword, onTogglePassword, inline = false, ...inputProps }) {
  const [focused, setFocused] = useState(false);
  const gutter = useWindowDimensions().width <= 360 ? 20 : 28;
  return (
    <View onLayout={onLayout} style={[s.field, inline ? { flex: 1 } : { marginHorizontal: gutter }, containerStyle]}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.control, focused && s.focused, inputProps.editable === false && s.readonly, error && s.invalid]}>
        {icon && <Icon name={icon} />}
        <TextInput
          {...inputProps}
          style={[s.input, inputProps.editable === false && s.readonlyText]}
          accessibilityLabel={label}
          accessibilityHint={[inputProps.accessibilityHint || hint, error].filter(Boolean).join(' ') || undefined}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={password ? !showPassword : false}
          onFocus={event => { setFocused(true); onFocus?.(event); }}
          onBlur={event => { setFocused(false); onBlur?.(event); }}
        />
        {password && <TouchableOpacity onPress={onTogglePassword} style={s.eye} accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}><Icon name={showPassword ? 'ojo-cerrado' : 'ojo'} /></TouchableOpacity>}
      </View>
      {hint && <Text style={s.hint}>{hint}</Text>}
      {children}
      {error ? <Text style={s.error} accessibilityLiveRegion="polite">{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  field: { marginBottom: 18, minWidth: 0 },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, color: colors.text, marginBottom: 7 },
  control: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.white },
  focused: { borderColor: colors.primary, borderLeftWidth: 3, paddingLeft: 13 },
  invalid: { borderColor: colors.error },
  input: { flex: 1, minWidth: 0, height: 46, paddingVertical: 0, fontFamily: fonts.body, fontSize: 16, color: colors.text },
  readonly: { backgroundColor: '#EAE6ED' }, readonlyText: { color: '#6C6275' },
  eye: { width: 44, height: 44, marginRight: -10, alignItems: 'center', justifyContent: 'center' },
  hint: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.muted, marginTop: 8 },
  error: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.error, marginTop: 8 },
});
