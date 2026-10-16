import React, { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import useCenteredForm from '../src/hooks/useCenteredForm';
import AuthScreen from '../src/components/AuthScreen';
import AuthField from '../src/components/AuthField';
import AuthButton from '../src/components/AuthButton';

export default function RecoverPassword({ navigation }) {
  const headerHeight = useHeaderHeight();
  const form = useCenteredForm(headerHeight);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const requestInProgress = useRef(false);

  const handleRecovery = async () => {
    if (requestInProgress.current) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Ingrese un correo válido, por ejemplo: nombre@dominio.com.');
      return;
    }
    requestInProgress.current = true;
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Revisá tu correo', 'Si existe una cuenta con ese correo, recibirás un enlace para recuperar tu contraseña. Revisá también el correo no deseado.');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Revisá tu correo', 'Si existe una cuenta con ese correo, recibirás un enlace para recuperar tu contraseña.');
      } else {
        const message = error.code === 'auth/too-many-requests'
          ? 'Demasiados intentos. Esperá unos minutos antes de volver a intentar.'
          : 'No pudimos enviar el enlace. Revisá tu conexión e intentá nuevamente.';
        Alert.alert('Error', message);
      }
    } finally {
      requestInProgress.current = false;
      setIsLoading(false);
    }
  };

  return <AuthScreen form={form} headerHeight={headerHeight} title="Recuperá tu contraseña" description="Te mandamos un enlace al correo de tu cuenta." compact onBack={() => !isLoading && navigation.goBack()}>
    <AuthField label="Correo electrónico" icon="correo" placeholder="vos@ejemplo.com" value={email} onChangeText={setEmail} onLayout={event => form.onFieldLayout('email', event)} onFocus={() => form.onFieldFocus('email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" returnKeyType="send" onSubmitEditing={handleRecovery} />
    <AuthButton title={isLoading ? 'Enviando…' : 'Enviar enlace'} onPress={handleRecovery} disabled={isLoading} />
  </AuthScreen>;
}
