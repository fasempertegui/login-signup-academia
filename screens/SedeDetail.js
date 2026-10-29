import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SedeStatusBadge from '../src/components/SedeStatusBadge';
import { colors, fonts } from '../src/styles/academia';
import portal from '../src/styles/portal';

const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export default function SedeDetail({ sede }) {
  const hasPrice = sede.precio_reserva_vigente != null;
  return <View style={s.content}>
    <View style={portal.profileHeader}>
      <Text style={portal.heroDate}>Sede</Text>
      <Text style={[portal.title, portal.profileTitle]} accessibilityRole="header">{sede.nombre}</Text>
      <SedeStatusBadge estado={sede.estado} />
    </View>
    <View style={portal.dataSection}>
      <Text style={portal.sectionTitle} accessibilityRole="header">Datos de la sede</Text>
      <View style={portal.dataRow}>
        <Text style={portal.muted}>Dirección</Text>
        <Text style={portal.body} selectable>{sede.direccion}</Text>
      </View>
      <View style={portal.dataRow}>
        <Text style={portal.muted}>Precio de reserva vigente</Text>
        <Text style={hasPrice ? s.amount : portal.muted}>{hasPrice ? moneda.format(sede.precio_reserva_vigente) : 'Sin definir'}</Text>
      </View>
      {sede.observaciones?.trim() ? <View style={s.observations}>
        <Text style={portal.muted}>Observaciones</Text>
        <Text style={portal.body}>{sede.observaciones}</Text>
      </View> : null}
    </View>
  </View>;
}

const s = StyleSheet.create({
  content: { gap: 28 },
  amount: { fontFamily: fonts.title, fontSize: 28, lineHeight: 36, color: colors.primary },
  observations: { gap: 5 },
});
