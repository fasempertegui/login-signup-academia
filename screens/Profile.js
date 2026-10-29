import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import AuthButton from '../src/components/AuthButton';
import { colors } from '../src/styles/academia';
import s from '../src/styles/portal';

function DataRow({ label, value }) {
  return <View style={s.dataRow}><Text style={s.muted}>{label}</Text><Text style={s.body} selectable>{value || 'Sin informar'}</Text></View>;
}

function displayBirthDate(value) {
  if (typeof value !== 'string') return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

export default function Profile({ usuario, status, retry }) {
  if (status === 'loading') return <View style={s.state}><ActivityIndicator color={colors.primary} accessibilityLabel="Cargando perfil" /><Text style={s.muted}>Cargando tu perfil…</Text></View>;
  if (status === 'error') return <View style={s.state}><Text style={s.sectionTitle}>No pudimos cargar tu perfil</Text><Text style={s.muted}>Revisá tu conexión y volvé a intentar.</Text><AuthButton title="Reintentar" onPress={retry} inset={false} /></View>;
  if (!usuario) return <View style={s.state}><Text style={s.sectionTitle}>Tu perfil todavía no está disponible</Text><Text style={s.muted}>Tu cuenta está creada, pero aún faltan los datos del perfil.</Text><AuthButton title="Volver a consultar" onPress={retry} inset={false} /></View>;

  const nombre = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ');
  return <>
    <View style={s.profileHeader}><Text style={s.heroDate}>Mi perfil</Text><Text style={[s.title, s.profileTitle]} accessibilityRole="header">{nombre || 'Mi cuenta'}</Text></View>
    <View style={s.dataSection}>
      <Text style={s.sectionTitle} accessibilityRole="header">Datos personales</Text>
      <DataRow label="Correo electrónico" value={usuario.correo} />
      <DataRow label="Celular" value={usuario.celular} />
      <DataRow label="Fecha de nacimiento" value={displayBirthDate(usuario.fechaNacimiento)} />
    </View>
    <View style={s.dataSection}><Text style={s.sectionTitle} accessibilityRole="header">Cuenta</Text><DataRow label="Nombre de usuario" value={usuario.nombreUsuario} /></View>
  </>;
}
