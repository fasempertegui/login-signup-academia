import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import useCenteredForm from '../src/hooks/useCenteredForm';
import useDialog from '../src/hooks/useDialog';
import AuthScreen from '../src/components/AuthScreen';
import AuthField from '../src/components/AuthField';
import AuthButton from '../src/components/AuthButton';
import { styles } from '../src/styles/academia';

export default function Login({ navigation }) {
  const { showDialog } = useDialog();
  const headerHeight = useHeaderHeight();
  const gutter = useWindowDimensions().width <= 360 ? 20 : 28;
  const form = useCenteredForm(headerHeight);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const requestInProgress = useRef(false);

  const handleLogin = async () => {
    if (requestInProgress.current) return;

    if (!email.trim() || !password) {
      showDialog({ title: 'Completá tus datos', message: 'Ingresá tu correo electrónico y contraseña.', variant: 'warning' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showDialog({ title: 'Revisá tu correo', message: 'Ingresá un correo electrónico válido.', variant: 'warning' });
      return;
    }

    requestInProgress.current = true;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      showDialog({ title: 'Sesión iniciada', message: 'Ya ingresaste a tu cuenta de Academia TM.', variant: 'success' });
      // El observador de Firebase cambia la pantalla al detectar la sesión.
    } catch (error) {
      console.info('Inicio de sesión rechazado:', error.code, error.message);
      let errorMessage = "Hubo un problema al iniciar sesión.";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/invalid-credential':
          errorMessage = "Correo o contraseña incorrectos.";
          break;
        case 'auth/wrong-password':
          errorMessage = "La contraseña es incorrecta.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No se encontró un usuario con este correo.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
        case 'auth/invalid-api-key':
          errorMessage = "El servicio no está disponible en este momento. Intentá nuevamente más tarde.";
          break;
      }
      showDialog({ title: 'No pudimos iniciar sesión', message: errorMessage, variant: 'error' });
    } finally {
      requestInProgress.current = false;
      setIsLoading(false);
    }
  };

  return (
    <AuthScreen form={form} headerHeight={headerHeight} title="Iniciá sesión">
      <AuthField
        label="Correo electrónico" icon="correo" placeholder="vos@ejemplo.com"
        value={email} onChangeText={setEmail}
        onLayout={event => form.onFieldLayout('email', event)}
        onFocus={() => form.onFieldFocus('email')}
        keyboardType="email-address" autoCapitalize="none" autoComplete="email" autoCorrect={false}
      />
      <AuthField
        label="Contraseña" icon="candado" placeholder="Tu contraseña"
        containerStyle={loginStyles.passwordField}
        value={password} onChangeText={setPassword}
        onLayout={event => form.onFieldLayout('password', event)}
        onFocus={() => form.onFieldFocus('password')}
        password showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)}
        autoCapitalize="none" autoComplete="current-password" returnKeyType="go" onSubmitEditing={handleLogin}
      />
      <TouchableOpacity onPress={() => navigation.navigate('RecoverPassword')} disabled={isLoading} style={[styles.recovery, { marginLeft: gutter }]}>
        <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
      <AuthButton title={isLoading ? 'Ingresando…' : 'Ingresar'} onPress={handleLogin} disabled={isLoading} />
      <View style={{ height: 28 }} />
      <View style={[styles.invitation, loginStyles.invitation, { marginHorizontal: gutter }]}>
        <Text style={styles.invitationText}>¿Primera vez por acá?</Text>
        <AuthButton title="Creá tu cuenta" onPress={() => navigation.navigate('SignUp')} disabled={isLoading} secondary inset={false} />
      </View>
    </AuthScreen>
  );
}

const loginStyles = StyleSheet.create({
  passwordField: { marginBottom: 0 },
  invitation: { paddingBottom: 24 },
});
