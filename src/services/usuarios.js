import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { crearDatosUsuario } from '../models/usuario';

export async function guardarUsuario(uid, datos) {
  if (!db) throw new Error('Firestore no está configurado.');
  if (!uid) throw new Error('El usuario debe tener un UID.');
  // El UID mantiene el mismo documento también al reintentar el guardado.
  await setDoc(doc(db, 'usuarios', uid), crearDatosUsuario(datos), { merge: true });
}
