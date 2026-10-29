import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthButton from '../src/components/AuthButton';
import useSedes from '../src/hooks/useSedes';
import SedeForm from './SedeForm';
import SedeDetail from './SedeDetail';
import Icon from '../src/components/Icon';
import { colors } from '../src/styles/academia';
import portal from '../src/styles/portal';

export default function Sedes({ selectedId, onSelect }) {
  const { sedes, status, retry } = useSedes();
  const [creating, setCreating] = useState(false);
  if (creating) return <SedeForm onDone={() => setCreating(false)} />;
  const selected = status === 'ready' ? sedes.find(sede => sede.id === selectedId) : null;
  if (selected) return <SedeDetail sede={selected} />;
  return <View style={s.content}>
    <Text style={portal.title} accessibilityRole="header">Sedes</Text>
    <AuthButton title="Agregar sede" onPress={() => setCreating(true)} inset={false} />
    {status === 'loading' ? <ActivityIndicator color={colors.primary} accessibilityLabel="Cargando sedes" /> : null}
    {status === 'error' ? <View style={portal.state}><Text style={portal.body}>No pudimos cargar las sedes.</Text><AuthButton title="Reintentar" onPress={retry} inset={false} /></View> : null}
    {status === 'ready' ? <>
      {sedes.length ? <View style={s.list}>{sedes.map(sede => <TouchableOpacity key={sede.id} style={s.row} onPress={() => onSelect(sede.id)} accessibilityRole="button" accessibilityLabel={`${sede.nombre}, ${sede.estado === 'activa' ? 'activa' : 'inactiva'}. Ver detalle`}>
        <View style={s.summary}>
          <View style={s.heading}><View style={[s.statusDot, sede.estado === 'activa' ? s.activeDot : s.inactiveDot]} accessible={false} /><Text style={[portal.sectionTitle, s.name]}>{sede.nombre}</Text></View>
          <Text style={portal.body}>{sede.direccion}</Text>
        </View>
        <Icon name="chevron" size={24} color={colors.text} />
      </TouchableOpacity>)}</View> : <Text style={portal.muted}>Todavía no hay sedes registradas.</Text>}
    </> : null}
  </View>;
}

const s = StyleSheet.create({
  content: { gap: 24 }, list: { backgroundColor: colors.white, borderRadius: 14, overflow: 'hidden' },
  row: { padding: 20, gap: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.separator },
  summary: { flex: 1, minWidth: 0, gap: 8 }, heading: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, name: { flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 10 },
  activeDot: { backgroundColor: colors.success },
  inactiveDot: { backgroundColor: colors.muted },
});
