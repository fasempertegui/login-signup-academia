import React, { useRef, useState } from 'react';
import { View, Alert, useWindowDimensions } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { auth } from '../src/config/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import useCenteredForm from '../src/hooks/useCenteredForm';
import AuthScreen from '../src/components/AuthScreen';
import AuthField from '../src/components/AuthField';
import AuthButton from '../src/components/AuthButton';
import { styles } from '../src/styles/academia';
import { generatedUsername, isValidBirthDate } from '../src/utils/registrationFields';

export default function SignUp({ navigation }) {
  const headerHeight = useHeaderHeight();
  const gutter = useWindowDimensions().width <= 360 ? 20 : 28;
  const form = useCenteredForm(headerHeight);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const username = generatedUsername(firstName, lastName);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const requestInProgress = useRef(false);

  const handleSignUp = async () => {
    if (requestInProgress.current) return;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !birthDate.trim() || !password || !confirmPassword) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    // Acepta únicamente letras a-z, A-Z, ñ y Ñ.
    const nameRegex = /^[a-zA-ZñÑ]+$/;
    if (!nameRegex.test(firstName)) {
      Alert.alert("Error", "El nombre solo puede contener letras, sin espacios ni símbolos.");
      return;
    }

    if (!nameRegex.test(lastName)) {
      Alert.alert("Error", "El apellido solo puede contener letras, sin espacios ni símbolos.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Ingrese un correo válido, por ejemplo: nombre@dominio.com.");
      return;
    }

    const phoneRegex = /^(?:\+?549)?[1-9]\d{9}$/;
    const normalizedPhone = phone.replace(/[\s()-]/g, '');
    if (!phoneRegex.test(normalizedPhone)) {
      Alert.alert("Error", "Ingresá un celular argentino de 10 dígitos con código de área (ej.: 3875551234), o con prefijo +549.");
      return;
    }

    if (!isValidBirthDate(birthDate)) {
      Alert.alert("Error", "Ingresá una fecha de nacimiento válida en DD/MM/AAAA, no futura y de hasta 120 años.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Error",
        "La contraseña debe tener al menos 6 caracteres, incluyendo una letra mayúscula, una minúscula y un número."
      );
      return;
    }

    requestInProgress.current = true;
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const displayName = `${firstName.trim()} ${lastName.trim()}`;
      let isSavingName = false;

      // El reintento conserva la cuenta creada y solo vuelve a guardar el nombre.
      const saveName = async () => {
        if (isSavingName) return;
        isSavingName = true;
        try {
          await updateProfile(credential.user, { displayName });
          Alert.alert("Registro exitoso", "Usuario registrado con éxito.");
        } catch (error) {
          Alert.alert(
            "Cuenta creada",
            "La cuenta se creó, pero no se pudo guardar el nombre.",
            [
              { text: "Cerrar", style: "cancel" },
              { text: "Reintentar", onPress: saveName },
            ]
          );
        } finally {
          isSavingName = false;
        }
      };

      await saveName();
    } catch (error) {
      console.error('Error de registro:', error.code, error.message);
      let errorMessage = "Hubo un problema al registrar el usuario.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "El correo electrónico ya está en uso.";
          break;
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/weak-password':
          errorMessage = "La contraseña es demasiado débil.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
        case 'auth/invalid-api-key':
          errorMessage = "La clave API de Firebase no es válida. Revisa el archivo .env.";
          break;
      }
      Alert.alert("Error", `${errorMessage}\n\nCódigo: ${error.code ?? 'desconocido'}`);
    } finally {
      requestInProgress.current = false;
      setIsLoading(false);
    }
    // Firebase inicia la sesión y el navegador muestra Home.
  };

  return (
    <AuthScreen form={form} headerHeight={headerHeight} title="Creá tu cuenta" description="Reservá canchas y seguí tus clases." compact onBack={() => !isLoading && navigation.goBack()}>
      <View
        style={[styles.row, { marginHorizontal: gutter }]}
        onLayout={event => {
          form.onFieldLayout('firstName', event);
          form.onFieldLayout('lastName', event);
        }}
      >
        <AuthField label="Nombre" placeholder="Tu nombre" value={firstName} onChangeText={setFirstName} onFocus={() => form.onFieldFocus('firstName')} maxLength={100} autoComplete="given-name" autoCapitalize="words" inline />
        <AuthField label="Apellido" placeholder="Tu apellido" value={lastName} onChangeText={setLastName} onFocus={() => form.onFieldFocus('lastName')} maxLength={100} autoComplete="family-name" autoCapitalize="words" inline />
      </View>
      <AuthField
        label="Correo electrónico" icon="correo" placeholder="vos@ejemplo.com"
        value={email} onChangeText={setEmail}
        onLayout={event => form.onFieldLayout('email', event)} onFocus={() => form.onFieldFocus('email')}
        keyboardType="email-address" autoCapitalize="none" autoComplete="email" autoCorrect={false}
      />
      <AuthField
        label="Celular" icon="telefono" placeholder="Ej.: 3875551234"
        value={phone} onChangeText={setPhone}
        onLayout={event => form.onFieldLayout('phone', event)} onFocus={() => form.onFieldFocus('phone')}
        keyboardType="phone-pad" autoComplete="tel" maxLength={30}
      />
      <AuthField
        label="Fecha de nacimiento" icon="calendario" placeholder="DD/MM/AAAA"
        value={birthDate} onChangeText={setBirthDate}
        onLayout={event => form.onFieldLayout('birthDate', event)} onFocus={() => form.onFieldFocus('birthDate')}
        keyboardType="numbers-and-punctuation" autoComplete="birthdate-full" maxLength={10}
      />
      <AuthField label="Nombre de usuario" icon="persona" placeholder="Se genera con tu nombre y apellido" value={username} editable={false} hint="Para iniciar sesión, usá tu correo electrónico." />
      <AuthField
        label="Contraseña" icon="candado" placeholder="Elegí tu contraseña"
        value={password} onChangeText={setPassword}
        onLayout={event => form.onFieldLayout('password', event)} onFocus={() => form.onFieldFocus('password')}
        password showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)}
        autoCapitalize="none" autoComplete="new-password"
        hint="Mínimo 6 caracteres, con mayúscula, minúscula y número."
      />
      <AuthField
        label="Confirmar contraseña" icon="candado" placeholder="Repetí tu contraseña"
        value={confirmPassword} onChangeText={setConfirmPassword}
        onLayout={event => form.onFieldLayout('confirmPassword', event)} onFocus={() => form.onFieldFocus('confirmPassword')}
        password showPassword={showConfirmPassword} onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        autoCapitalize="none" autoComplete="new-password" returnKeyType="done" onSubmitEditing={handleSignUp}
      />
      <AuthButton title={isLoading ? 'Registrando…' : 'Crear cuenta'} onPress={handleSignUp} disabled={isLoading} />
    </AuthScreen>
  );
}
