import { collection, doc, onSnapshot, runTransaction, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { claveSede, crearDatosSede, normalizarPrecioReserva } from '../models/sede';

export async function cambiarEstadoSede(id, estado) {
  if (!db || !id) throw new Error('No se puede actualizar la sede.');
  if (!['activa', 'inactiva'].includes(estado)) throw new Error('Estado inválido.');
  await updateDoc(doc(db, 'sedes', id), { estado });
}

export async function modificarPrecioSede(id, precio) {
  if (!db || !id) throw new Error('No se puede actualizar la sede.');
  await updateDoc(doc(db, 'sedes', id), { precio_reserva_vigente: normalizarPrecioReserva(precio) });
}

export function observarSedes(onData, onError) {
  if (!db) throw new Error('Firestore no está configurado.');
  return onSnapshot(collection(db, 'sedes'), snapshot => {
    const sedes = snapshot.docs.map(item => ({ ...item.data(), id: item.id }));
    onData(sedes.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
  }, onError);
}

export async function crearSede(datos) {
  if (!db) throw new Error('Firestore no está configurado.');
  const sede = crearDatosSede(datos);
  const reference = doc(collection(db, 'sedes'));
  // El índice reserva el nombre sin vincularlo al ID permanente de la sede.
  const nameReference = doc(db, 'sedes_nombres', claveSede(sede.nombre));
  await runTransaction(db, async transaction => {
    const existing = await transaction.get(nameReference);
    if (existing.exists()) {
      const error = new Error('Ya existe una sede con ese nombre');
      error.code = 'sedes/nombre-duplicado';
      throw error;
    }
    transaction.set(reference, sede);
    transaction.set(nameReference, { sedeId: reference.id });
  });
  return reference.id;
}
