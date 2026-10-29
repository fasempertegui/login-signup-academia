export function crearDatosUsuario({ nombre, apellido, correo, celular, fechaNacimiento, nombreUsuario }) {
  const [dia, mes, anio] = fechaNacimiento.split('/');
  // Lista explícita: las credenciales nunca forman parte del documento.
  return {
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    correo: correo.trim(),
    celular: celular.replace(/[\s()-]/g, ''),
    fechaNacimiento: `${anio}-${mes}-${dia}`,
    nombreUsuario: nombreUsuario.trim(),
  };
}
