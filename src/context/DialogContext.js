import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Keyboard, TextInput, View } from 'react-native';
import AppDialog from '../components/AppDialog';

export const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const nextId = useRef(0);
  const handledId = useRef(0);
  const restoreFrame = useRef(null);
  const dialog = queue[0] || null;

  useEffect(() => () => {
    if (restoreFrame.current !== null) cancelAnimationFrame(restoreFrame.current);
  }, []);

  const showDialog = useCallback(({ title, message, variant = 'info', actions, onDismiss }) => {
    if (restoreFrame.current !== null) {
      cancelAnimationFrame(restoreFrame.current);
      restoreFrame.current = null;
    }
    const returnFocus = TextInput.State.currentlyFocusedInput();
    Keyboard.dismiss();
    const item = {
      id: ++nextId.current, title, message, variant, onDismiss, returnFocus,
      actions: actions?.length ? actions : [{ label: 'Entendido' }],
    };
    setQueue(previous => [...previous, item]);
  }, []);

  const finishDialog = () => {
    // Evitar que dos pulsaciones ejecuten la misma acción o reintento.
    if (!dialog || dialog.id <= handledId.current) return false;
    handledId.current = dialog.id;
    setQueue(previous => previous.filter(item => item.id !== dialog.id));
    if (queue.length === 1 && dialog.returnFocus) {
      restoreFrame.current = requestAnimationFrame(() => {
        restoreFrame.current = null;
        // Firebase puede haber desmontado la pantalla que abrió el aviso.
        if (dialog.returnFocus.isConnected) {
          dialog.returnFocus.focus();
          AccessibilityInfo.sendAccessibilityEvent(dialog.returnFocus, 'focus');
        }
      });
    }
    return true;
  };

  const dismissDialog = () => {
    if (finishDialog()) dialog.onDismiss?.();
  };

  const selectAction = action => {
    if (finishDialog()) return action.onPress?.();
  };

  const value = useMemo(() => ({ showDialog }), [showDialog]);

  return (
    <DialogContext.Provider value={value}>
      <View style={{ flex: 1 }} accessibilityElementsHidden={Boolean(dialog)} importantForAccessibility={dialog ? 'no-hide-descendants' : 'auto'}>
        {children}
      </View>
      <AppDialog dialog={dialog} onClose={dismissDialog} onAction={selectAction} />
    </DialogContext.Provider>
  );
}
