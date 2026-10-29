import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors, fonts } from '../styles/academia';
import { getPasswordRequirements } from '../utils/registrationFields';

export default function PasswordChecklist({ password }) {
  return (
    <View style={s.list}>
      {getPasswordRequirements(password).map(({ id, label, met }) => (
        <View key={id} style={s.row} accessible accessibilityLabel={`${label}: ${met ? 'cumplido' : 'pendiente'}`}>
          <View style={s.marker}>
            {met ? <Icon name="check" size={16} color={colors.success} /> : <View style={s.pending} />}
          </View>
          <Text style={[s.text, met && s.met]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  list: { marginTop: 8, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  marker: { width: 16, height: 21, alignItems: 'center', justifyContent: 'center' },
  pending: { width: 10, height: 10, borderWidth: 1, borderRadius: 5, borderColor: colors.muted },
  text: { flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.muted },
  met: { color: colors.success },
});
