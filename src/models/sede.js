export function validarPrecioReserva(value) {
  const precio = String(value ?? '').trim();
  if (precio && (!/^\d{1,10}(?:[.,]\d{1,2})?$/.test(precio) || Number(precio.replace(',', '.')) <= 0)) {
    return 'Ingresá un importe mayor que cero, con hasta dos decimales';
  }
  return '';
}

export function normalizarPrecioReserva(value) {
  const message = validarPrecioReserva(value);
  if (message) throw new Error(message);
  const precio = String(value ?? '').trim();
  return precio ? Number(precio.replace(',', '.')) : null;
}

export function validarSede(datos) {
  const errors = {};
  if (!datos.nombre.trim()) errors.nombre = 'Ingresá el nombre de la sede';
  else if (datos.nombre.trim().length > 120) errors.nombre = 'El nombre admite hasta 120 caracteres';
  if (!datos.direccion.trim()) errors.direccion = 'Ingresá la dirección';
  else if (datos.direccion.trim().length > 250) errors.direccion = 'La dirección admite hasta 250 caracteres';
  if (!['activa', 'inactiva'].includes(datos.estado)) errors.estado = 'Seleccioná un estado válido';
  const precioError = validarPrecioReserva(datos.precio_reserva_vigente);
  if (precioError) errors.precio_reserva_vigente = precioError;
  return errors;
}

export function crearDatosSede(datos) {
  const errors = validarSede(datos);
  if (Object.keys(errors).length) {
    const error = new Error('Revisá los datos de la sede');
    error.code = 'sedes/datos-invalidos';
    error.errors = errors;
    throw error;
  }
  return {
    nombre: datos.nombre.trim().normalize('NFC'),
    direccion: datos.direccion.trim(),
    observaciones: (datos.observaciones || '').trim(),
    estado: datos.estado,
    precio_reserva_vigente: normalizarPrecioReserva(datos.precio_reserva_vigente),
  };
}

export function claveSede(nombre) {
  return 'sede_' + encodeURIComponent(nombre.trim().normalize('NFC').toLowerCase());
}
