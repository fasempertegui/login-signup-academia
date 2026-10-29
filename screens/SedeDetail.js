import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SedeStatusBadge from '../src/components/SedeStatusBadge';
import AuthButton from '../src/components/AuthButton';
import AuthField from '../src/components/AuthField';
import useDialog from '../src/hooks/useDialog';
import { cambiarEstadoSede, modificarPrecioSede } from '../src/services/sedes';
import { validarPrecioReserva } from '../src/models/sede';
import { colors, fonts } from '../src/styles/academia';
import portal from '../src/styles/portal';

const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export default function SedeDetail({ sede }) {
  const { showDialog } = useDialog();
  const [editingPrice, setEditingPrice] = useState(false);
  const [price, setPrice] = useState('');
  const [priceError, setPriceError] = useState('');
  const [working, setWorking] = useState(null);
  const inProgress = useRef(false);
  const hasPrice = sede.precio_reserva_vigente != null;
  const editPrice = () => {
    setPrice(hasPrice ? String(sede.precio_reserva_vigente) : '');
    setPriceError('');
    setEditingPrice(true);
  };
  const savePrice = async () => {
    if (inProgress.current) return;
    const error = validarPrecioReserva(price);
    setPriceError(error);
    if (error) return;
    inProgress.current = true;
    setWorking('precio');
    try {
      await modificarPrecioSede(sede.id, price);
      setEditingPrice(false);
      showDialog({ title: 'Precio actualizado', message: 'Se guardó el precio de reserva vigente.', variant: 'success' });
    } catch {
      showDialog({ title: 'No pudimos guardar el precio', message: 'Revisá tu conexión y volvé a intentar. El importe ingresado sigue en el formulario.', variant: 'error' });
    } finally { inProgress.current = false; setWorking(null); }
  };
  const requestStateChange = () => {
    if (inProgress.current) return;
    const next = sede.estado === 'activa' ? 'inactiva' : 'activa';
    const action = next === 'activa' ? 'Activar' : 'Desactivar';
    showDialog({
      title: `${action} sede`,
      message: next === 'inactiva' ? `«${sede.nombre}» pasará a estar inactiva. Podrás volver a activarla cuando lo necesites.` : `«${sede.nombre}» volverá a estar activa.`,
      variant: next === 'inactiva' ? 'warning' : 'success',
      actions: [
        { label: `${action} sede`, variant: next === 'activa' ? 'success' : 'warning', onPress: async () => {
          if (inProgress.current) return;
          inProgress.current = true;
          setWorking('estado');
          try {
            await cambiarEstadoSede(sede.id, next);
            showDialog({ title: next === 'activa' ? 'Sede activada' : 'Sede desactivada', message: 'Se actualizó el estado de la sede.', variant: 'success' });
          } catch {
            showDialog({ title: 'No pudimos cambiar el estado', message: 'Revisá tu conexión y volvé a intentar.', variant: 'error' });
          } finally { inProgress.current = false; setWorking(null); }
        } },
        { label: 'Cancelar', variant: 'secondary' },
      ],
    });
  };
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
        <Text style={s.value} selectable>{sede.direccion}</Text>
      </View>
      <View style={portal.dataRow}>
        {editingPrice ? <View style={s.priceForm}>
          <AuthField label="Precio de reserva vigente" placeholder="Importe en pesos" hint="Opcional. Si lo dejás vacío, quedará sin definir." value={price} onChangeText={value => { setPrice(value); setPriceError(''); }} onBlur={() => { if (price.trim()) setPriceError(validarPrecioReserva(price)); }} error={priceError} keyboardType="decimal-pad" editable={!working} containerStyle={s.priceField} />
          <AuthButton title={working === 'precio' ? 'Guardando…' : 'Guardar precio'} onPress={savePrice} disabled={Boolean(working)} inset={false} />
          <AuthButton title="Cancelar" onPress={() => setEditingPrice(false)} disabled={Boolean(working)} secondary inset={false} />
        </View> : <>
          <Text style={portal.muted}>Precio de reserva vigente</Text>
          <Text style={hasPrice ? s.value : portal.muted}>{hasPrice ? moneda.format(sede.precio_reserva_vigente) : 'Sin definir'}</Text>
        </>}
      </View>
      {sede.observaciones?.trim() ? <View style={s.observations}>
        <Text style={portal.muted}>Observaciones</Text>
        <Text style={s.value}>{sede.observaciones}</Text>
      </View> : null}
    </View>
    <View style={s.actions}>
      {!editingPrice ? <AuthButton title="Modificar precio de reserva" onPress={editPrice} disabled={Boolean(working)} secondary inset={false} /> : null}
      <AuthButton title={working === 'estado' ? 'Actualizando…' : sede.estado === 'activa' ? 'Desactivar sede' : 'Activar sede'} onPress={requestStateChange} disabled={Boolean(working) || editingPrice} tone={sede.estado === 'activa' ? 'warning' : 'success'} inset={false} />
    </View>
  </View>;
}

const s = StyleSheet.create({
  content: { gap: 28 },
  value: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, color: colors.text },
  observations: { gap: 5 },
  actions: { gap: 12 }, priceForm: { gap: 12 }, priceField: { marginHorizontal: 0, marginBottom: 0 },
});
