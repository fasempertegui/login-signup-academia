import React, { useRef, useState } from 'react';
import { useHeaderHeight } from '@react-navigation/elements';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import useCenteredForm from '../src/hooks/useCenteredForm';
import useDialog from '../src/hooks/useDialog';
import AuthScreen from '../src/components/AuthScreen';
import AuthField from '../src/components/AuthField';
import AuthButton from '../src/components/AuthButton';

export default function RecoverPassword({ navigation }) {
  const { showDialog } = useDialog();
  const headerHeight = useHeaderHeight();
  const form = useCenteredForm(headerHeight);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const requestInProgress = useRef(false);

  const handleRecovery = async () => {
    if (requestInProgress.current) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showDialog({ title: 'Revisá tu correo', message: 'Ingresá un correo electrónico válido.', variant: 'warning' });
      return;
    }
    requestInProgress.current = true;
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      showDialog({ title: 'Revisá tu correo', message: 'Si existe una cuenta con ese correo, recibirás un enlace para recuperar tu contraseña. Revisá también el correo no deseado.', variant: 'info' });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        showDialog({ title: 'Revisá tu correo', message: 'Si existe una cuenta con ese correo, recibirás un enlace para recuperar tu contraseña. Revisá también el correo no deseado.', variant: 'info' });
      } else {
        const message = error.code === 'auth/too-many-requests'
          ? 'Demasiados intentos. Esperá unos minutos antes de volver a intentar.'
          : 'No pudimos enviar el enlace. Revisá tu conexión e intentá nuevamente.';
        showDialog({ title: 'No pudimos enviar el enlace', message, variant: 'error' });
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
