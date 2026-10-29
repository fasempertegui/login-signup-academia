import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../styles/academia';

export default function SedeStatusBadge({ estado }) {
  const active = estado === 'activa';
  return <Text style={[s.badge, active ? s.active : s.inactive]}>{active ? 'Activa' : 'Inactiva'}</Text>;
}

const s = StyleSheet.create({
  badge: { alignSelf: 'flex-start', flexShrink: 0, fontFamily: fonts.medium, fontSize: 13, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20 },
  active: { color: colors.success, backgroundColor: colors.successBackground },
  inactive: { color: colors.muted, backgroundColor: colors.alternative },
});
