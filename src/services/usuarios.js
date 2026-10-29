import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { crearDatosUsuario } from '../models/usuario';

export function observarUsuario(uid, onData, onError) {
  if (!db || !uid) throw new Error('No se puede consultar el perfil sin una sesión configurada.');
  return onSnapshot(doc(db, 'usuarios', uid), snapshot => {
    onData(snapshot.exists() ? snapshot.data() : null);
  }, onError);
}

export async function guardarUsuario(uid, datos) {
  if (!db) throw new Error('Firestore no está configurado.');
  if (!uid) throw new Error('El usuario debe tener un UID.');
  // El UID mantiene el mismo documento también al reintentar el guardado.
  await setDoc(doc(db, 'usuarios', uid), crearDatosUsuario(datos), { merge: true });
}
