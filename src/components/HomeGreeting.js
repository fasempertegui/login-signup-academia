import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts } from '../styles/academia';
import portal from '../styles/portal';

export default function HomeGreeting({ usuario, status, retry, fecha }) {
  const [slow, setSlow] = useState(false);
  const isLoading = status === 'loading';
  const name = status === 'ready' ? usuario?.nombre : null;

  useEffect(() => {
    setSlow(false);
    if (status !== 'loading') return;
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <View style={portal.hero}>
      <Text style={portal.heroDate}>{fecha}</Text>
      <Text style={portal.greeting} accessibilityRole="header">{name ? `Hola, ${name}.` : 'Hola.'}</Text>
      <View accessibilityLiveRegion="polite">
        {isLoading ? <View style={s.loading}>
          <ActivityIndicator color={colors.white} accessibilityLabel="Cargando tus datos" />
          <Text style={[s.message, s.loadingText]}>{slow ? 'Tus datos están tardando más de lo habitual. Podés seguir usando la app mientras esperamos.' : 'Cargando tus datos…'}</Text>
        </View> : null}
        {status === 'error' || status === 'missing' ? <View style={s.feedback}>
          <Text style={s.message}>{status === 'error' ? 'No pudimos cargar tus datos. Revisá tu conexión y volvé a intentar.' : 'Tu perfil todavía no está disponible.'}</Text>
          <TouchableOpacity onPress={retry} style={s.retry} accessibilityRole="button">
            <Text style={s.retryText}>{status === 'error' ? 'Reintentar' : 'Volver a consultar'}</Text>
          </TouchableOpacity>
        </View> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  message: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.textOnDark },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  loadingText: { flex: 1 },
  feedback: { gap: 16, marginTop: 6 },
  retry: { minHeight: 48, padding: 12, borderRadius: 10, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  retryText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primary },
});
