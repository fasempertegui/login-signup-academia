import { useEffect, useState } from 'react';
import { observarUsuario } from '../services/usuarios';

export default function useUsuario(uid) {
  const [state, setState] = useState({ usuario: null, status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ usuario: null, status: 'loading' });
    if (!uid) {
      setState({ usuario: null, status: 'missing' });
      return;
    }
    const onError = () => {
      if (active) setState({ usuario: null, status: 'error' });
    };
    let unsubscribe;
    try {
      unsubscribe = observarUsuario(uid, usuario => {
        if (active) setState({ usuario, status: usuario ? 'ready' : 'missing' });
      }, onError);
    } catch {
      onError();
    }
    return () => { active = false; unsubscribe?.(); };
  }, [uid, attempt]);

  return { ...state, retry: () => setAttempt(value => value + 1) };
}
