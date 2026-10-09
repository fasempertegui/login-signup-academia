import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export default function useCenteredForm(headerHeight) {
  const scrollRef = useRef(null);
  const fieldLayouts = useRef({});
  const focusedField = useRef(null);
  const scrollFrame = useRef(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [keyboardTop, setKeyboardTop] = useState(() => Keyboard.metrics()?.screenY ?? null);

  // Android reduce la vista; iOS reserva espacio dentro del ScrollView.
  const visibleHeight = keyboardTop === null
    ? viewportHeight
    : Math.max(0, Math.min(viewportHeight, keyboardTop - headerHeight));

  const centerFocusedField = useCallback(() => {
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = null;
      const field = fieldLayouts.current[focusedField.current];
      if (!field || keyboardTop === null || visibleHeight <= 0) return;

      const fieldCenter = field.y + field.height / 2;
      scrollRef.current?.scrollTo({
        y: Math.max(0, fieldCenter - visibleHeight / 2),
        animated: true,
      });
    });
  }, [keyboardTop, visibleHeight]);

  useEffect(() => {
    const updateKeyboard = event => setKeyboardTop(event.endCoordinates.screenY);
    const subscriptions = [
      Keyboard.addListener('keyboardDidShow', updateKeyboard),
      Keyboard.addListener('keyboardDidHide', () => setKeyboardTop(null)),
    ];
    if (Platform.OS === 'ios') {
      subscriptions.push(Keyboard.addListener('keyboardDidChangeFrame', updateKeyboard));
    }
    return () => subscriptions.forEach(subscription => subscription.remove());
  }, []);

  useEffect(() => {
    centerFocusedField();
    return () => {
      if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    };
  }, [centerFocusedField]);

  return {
    scrollRef,
    // Este espacio permite subir también los últimos campos del formulario.
    bottomSpace: keyboardTop === null ? 0 : visibleHeight / 2,
    onScrollLayout: event => setViewportHeight(event.nativeEvent.layout.height),
    onContentSizeChange: centerFocusedField,
    onFieldLayout: (name, event) => {
      fieldLayouts.current[name] = event.nativeEvent.layout;
      if (focusedField.current === name) centerFocusedField();
    },
    onFieldFocus: name => {
      focusedField.current = name;
      centerFocusedField();
    },
  };
}
