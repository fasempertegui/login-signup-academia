import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthField from '../src/components/AuthField';
import AuthButton from '../src/components/AuthButton';
import useDialog from '../src/hooks/useDialog';
import { validarSede } from '../src/models/sede';
import { crearSede } from '../src/services/sedes';
import { colors, fonts } from '../src/styles/academia';
import portal from '../src/styles/portal';

const initial = { nombre: '', direccion: '', observaciones: '', estado: 'activa', precio_reserva_vigente: '' };

export default function SedeForm({ onDone }) {
  const { showDialog } = useDialog();
  const [datos, setDatos] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const inProgress = useRef(false);
  const change = (field, value) => {
    setDatos(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: '' }));
  };
  const blur = field => {
    if (String(datos[field]).trim()) setErrors(previous => ({ ...previous, [field]: validarSede(datos)[field] || '' }));
  };
  const save = async () => {
    if (inProgress.current) return;
    const nextErrors = validarSede(datos);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    inProgress.current = true;
    setSaving(true);
    try {
      await crearSede(datos);
      onDone();
      showDialog({ title: 'Sede creada', message: 'La sede se guardó correctamente.', variant: 'success' });
    } catch (error) {
      if (error.code === 'sedes/nombre-duplicado') setErrors(previous => ({ ...previous, nombre: 'Ya existe una sede con ese nombre' }));
      else showDialog({ title: 'No pudimos guardar la sede', message: 'Tus datos siguen en el formulario. Revisá tu conexión y volvé a intentar.', variant: 'error' });
    } finally {
      inProgress.current = false;
      setSaving(false);
    }
  };
  return <View>
    <Text style={[portal.title, s.heading]} accessibilityRole="header">Nueva sede</Text>
    <AuthField label="Nombre" placeholder="Nombre de la sede" value={datos.nombre} onChangeText={value => change('nombre', value)} onBlur={() => blur('nombre')} error={errors.nombre} maxLength={120} editable={!saving} containerStyle={s.field} />
    <AuthField label="Dirección" placeholder="Dirección de la sede" value={datos.direccion} onChangeText={value => change('direccion', value)} onBlur={() => blur('direccion')} error={errors.direccion} maxLength={250} editable={!saving} containerStyle={s.field} />
    <AuthField label="Observaciones (opcional)" placeholder="Información adicional" value={datos.observaciones} onChangeText={value => change('observaciones', value)} multiline editable={!saving} containerStyle={s.field} />
    <Text style={s.label}>Estado</Text>
    <View style={s.options} accessibilityRole="radiogroup">
      {['activa', 'inactiva'].map(value => <TouchableOpacity key={value} disabled={saving} accessibilityRole="radio" accessibilityState={{ checked: datos.estado === value, disabled: saving }} onPress={() => change('estado', value)} style={[s.option, datos.estado === value && s.selected]}><Text style={[s.optionText, datos.estado === value && s.selectedText]}>{value === 'activa' ? 'Activa' : 'Inactiva'}</Text></TouchableOpacity>)}
    </View>
    <AuthField label="Precio de reserva vigente (opcional)" placeholder="Importe en pesos" keyboardType="decimal-pad" value={datos.precio_reserva_vigente} onChangeText={value => change('precio_reserva_vigente', value)} onBlur={() => blur('precio_reserva_vigente')} error={errors.precio_reserva_vigente} editable={!saving} containerStyle={s.field} />
    <View style={s.actions}><AuthButton title={saving ? 'Guardando…' : 'Guardar sede'} onPress={save} disabled={saving} inset={false} /><AuthButton title="Cancelar" onPress={onDone} disabled={saving} secondary inset={false} /></View>
  </View>;
}

const s = StyleSheet.create({
  heading: { marginBottom: 28 }, field: { marginHorizontal: 0 },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, color: colors.text, marginBottom: 7 },
  options: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  option: { flex: 1, minHeight: 48, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, borderRadius: 10, justifyContent: 'center', alignItems: 'center', padding: 12 },
  selected: { borderColor: colors.primary, backgroundColor: colors.primary },
  optionText: { fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  selectedText: { color: colors.white }, actions: { gap: 12, marginBottom: 24 },
});
