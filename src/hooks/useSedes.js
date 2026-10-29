import { useEffect, useState } from 'react';
import { observarSedes } from '../services/sedes';

export default function useSedes() {
  const [state, setState] = useState({ sedes: [], status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    let unsubscribe;
    setState({ sedes: [], status: 'loading' });
    const fail = () => { if (active) setState({ sedes: [], status: 'error' }); };
    try {
      unsubscribe = observarSedes(sedes => {
        if (active) setState({ sedes, status: 'ready' });
      }, fail);
    } catch { fail(); }
    return () => { active = false; unsubscribe?.(); };
  }, [attempt]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}
