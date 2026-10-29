import { collection, doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { claveSede, crearDatosSede } from '../models/sede';

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
