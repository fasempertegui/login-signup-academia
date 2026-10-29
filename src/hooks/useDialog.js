import { useContext } from 'react';
import { DialogContext } from '../context/DialogContext';

export default function useDialog() {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useDialog debe usarse dentro de DialogProvider.');
  return context;
}
