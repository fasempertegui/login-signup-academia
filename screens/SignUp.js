import React, { useRef, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { auth } from '../src/config/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import useCenteredForm from '../src/hooks/useCenteredForm';
import useDialog from '../src/hooks/useDialog';
import AuthScreen from '../src/components/AuthScreen';
import AuthField from '../src/components/AuthField';
import AuthButton from '../src/components/AuthButton';
import PasswordChecklist from '../src/components/PasswordChecklist';
import { guardarUsuario } from '../src/services/usuarios';
import { styles } from '../src/styles/academia';
import {
  formatBirthDate, generatedUsername, getBirthDateError, getConfirmPasswordError,
  getEmailError, getNameError, getPasswordError, getPhoneError,
} from '../src/utils/registrationFields';

export default function SignUp({ navigation }) {
  const { showDialog } = useDialog();
  const headerHeight = useHeaderHeight();
  const gutter = useWindowDimensions().width <= 360 ? 20 : 28;
  const form = useCenteredForm(headerHeight);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameErrors, setNameErrors] = useState({ firstName: '', lastName: '' });
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthDateError, setBirthDateError] = useState('');
  const username = generatedUsername(firstName, lastName);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const confirmationValidated = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const requestInProgress = useRef(false);

  const handleNameChange = (field, value, setValue, label) => {
    setValue(value);
    setNameErrors(previous => ({
      ...previous,
      [field]: value.trim() ? getNameError(value, label, { isEditing: true }) : '',
    }));
  };

  const validateNameOnBlur = (field, value, label) => {
    // Al terminar, comprobar también separadores que quedaron incompletos.
    setNameErrors(previous => ({
      ...previous,
      [field]: value.trim() ? getNameError(value, label) : '',
    }));
  };

  const handleEmailChange = value => {
    setEmail(value);
    // Ocultar el error al empezar a editar, no al recibir el foco.
    setEmailError('');
  };

  const validateEmailOnBlur = () => {
    setEmailError(email.trim() ? getEmailError(email) : '');
  };

  const handlePhoneChange = value => {
    setPhone(value);
    setPhoneError('');
  };

  const validatePhoneOnBlur = () => {
    setPhoneError(phone.trim() ? getPhoneError(phone) : '');
  };

  const handleBirthDateChange = value => {
    setBirthDate(previous => formatBirthDate(value, previous));
    setBirthDateError('');
  };

  const validateBirthDateOnBlur = () => {
    setBirthDateError(birthDate.trim() ? getBirthDateError(birthDate) : '');
  };

  const handlePasswordChange = value => {
    setPassword(value);
    setPasswordError('');
    // Una confirmación ya completada depende también de la contraseña original.
    if (confirmationValidated.current && confirmPassword) {
      setConfirmPasswordError(getConfirmPasswordError(confirmPassword, value));
    }
  };

  const handleConfirmPasswordChange = value => {
    setConfirmPassword(value);
    setConfirmPasswordError('');
  };

  const validateConfirmPasswordOnBlur = () => {
    confirmationValidated.current = true;
    setConfirmPasswordError(confirmPassword ? getConfirmPasswordError(confirmPassword, password) : '');
  };

  const handleSignUp = async () => {
    if (requestInProgress.current) return;

    const nextNameErrors = {
      firstName: getNameError(firstName, 'nombre'),
      lastName: getNameError(lastName, 'apellido'),
    };
    const nextEmailError = getEmailError(email);
    const nextPhoneError = getPhoneError(phone);
    const nextBirthDateError = getBirthDateError(birthDate);
    const nextPasswordError = getPasswordError(password);
    const nextConfirmPasswordError = getConfirmPasswordError(confirmPassword, password);
    setNameErrors(nextNameErrors);
    setEmailError(nextEmailError);
    setPhoneError(nextPhoneError);
    setBirthDateError(nextBirthDateError);
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);
    confirmationValidated.current = true;
    const hasErrors = [
      nextNameErrors.firstName, nextNameErrors.lastName, nextEmailError,
      nextPhoneError, nextBirthDateError, nextPasswordError, nextConfirmPasswordError,
    ].some(Boolean);
    if (hasErrors) return;

    requestInProgress.current = true;
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const displayName = `${firstName.trim()} ${lastName.trim()}`;
      const datosUsuario = {
        nombre: firstName,
        apellido: lastName,
        correo: credential.user.email || email.trim(),
        celular: phone,
        fechaNacimiento: birthDate,
        nombreUsuario: username,
      };
      let isSavingProfile = false;

      // El reintento conserva la cuenta y el UID: no vuelve a registrarla.
      const saveProfile = async () => {
        if (isSavingProfile) return;
        isSavingProfile = true;
        try {
          await guardarUsuario(credential.user.uid, datosUsuario);
          await updateProfile(credential.user, { displayName });
          showDialog({ title: 'Cuenta creada', message: 'Tu cuenta de Academia TM está lista.', variant: 'success' });
        } catch (error) {
          showDialog({
            title: 'Falta completar tu perfil',
            message: 'Tu cuenta ya se creó, pero no pudimos completar el guardado de tus datos. Podés volver a intentarlo.',
            variant: 'warning',
            actions: [
              { label: 'Reintentar', onPress: saveProfile },
              { label: 'Cerrar', variant: 'secondary' },
            ],
          });
        } finally {
          isSavingProfile = false;
        }
      };

      await saveProfile();
    } catch (error) {
      console.info('Registro rechazado:', error.code, error.message);
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
          errorMessage = "El servicio no está disponible en este momento. Intentá nuevamente más tarde.";
          break;
      }
      showDialog({ title: 'No pudimos crear tu cuenta', message: errorMessage, variant: 'error' });
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
        <AuthField
          label="Nombre" placeholder="Tu nombre" value={firstName}
          onChangeText={value => handleNameChange('firstName', value, setFirstName, 'nombre')}
          onFocus={() => form.onFieldFocus('firstName')}
          onBlur={() => validateNameOnBlur('firstName', firstName, 'nombre')}
          error={nameErrors.firstName}
          maxLength={100} autoComplete="given-name" autoCapitalize="words" autoCorrect={false} inline
        />
        <AuthField
          label="Apellido" placeholder="Tu apellido" value={lastName}
          onChangeText={value => handleNameChange('lastName', value, setLastName, 'apellido')}
          onFocus={() => form.onFieldFocus('lastName')}
          onBlur={() => validateNameOnBlur('lastName', lastName, 'apellido')}
          error={nameErrors.lastName}
          maxLength={100} autoComplete="family-name" autoCapitalize="words" autoCorrect={false} inline
        />
      </View>
      <AuthField
        label="Correo electrónico" icon="correo" placeholder="vos@ejemplo.com"
        value={email} onChangeText={handleEmailChange}
        onLayout={event => form.onFieldLayout('email', event)} onFocus={() => form.onFieldFocus('email')}
        onBlur={validateEmailOnBlur} error={emailError}
        keyboardType="email-address" autoCapitalize="none" autoComplete="email" autoCorrect={false}
      />
      <AuthField
        label="Celular" icon="telefono" placeholder="Ej.: 3875551234"
        value={phone} onChangeText={handlePhoneChange}
        onLayout={event => form.onFieldLayout('phone', event)} onFocus={() => form.onFieldFocus('phone')}
        onBlur={validatePhoneOnBlur} error={phoneError}
        keyboardType="phone-pad" autoComplete="tel" maxLength={30}
        hint="Con código de área, sin 0 ni 15."
      />
      <AuthField
        label="Fecha de nacimiento" icon="calendario" placeholder="DD/MM/AAAA"
        value={birthDate} onChangeText={handleBirthDateChange}
        onLayout={event => form.onFieldLayout('birthDate', event)} onFocus={() => form.onFieldFocus('birthDate')}
        onBlur={validateBirthDateOnBlur} error={birthDateError}
        keyboardType="number-pad" autoComplete="birthdate-full" maxLength={10}
      />
      <AuthField label="Nombre de usuario" icon="persona" placeholder="Se genera con tu nombre y apellido" value={username} editable={false} />
      <AuthField
        label="Contraseña" icon="candado" placeholder="Elegí tu contraseña"
        value={password} onChangeText={handlePasswordChange} error={passwordError}
        onLayout={event => form.onFieldLayout('password', event)} onFocus={() => form.onFieldFocus('password')}
        password showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)}
        autoCapitalize="none" autoComplete="new-password" autoCorrect={false}
        accessibilityHint="Requisitos: al menos 6 caracteres, una mayúscula, una minúscula y un número."
      >
        <PasswordChecklist password={password} />
      </AuthField>
      <AuthField
        label="Confirmar contraseña" icon="candado" placeholder="Repetí tu contraseña"
        value={confirmPassword} onChangeText={handleConfirmPasswordChange}
        onLayout={event => form.onFieldLayout('confirmPassword', event)} onFocus={() => form.onFieldFocus('confirmPassword')}
        onBlur={validateConfirmPasswordOnBlur} error={confirmPasswordError}
        password showPassword={showConfirmPassword} onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        autoCapitalize="none" autoComplete="new-password" autoCorrect={false} returnKeyType="done" onSubmitEditing={handleSignUp}
      />
      <AuthButton title={isLoading ? 'Registrando…' : 'Crear cuenta'} onPress={handleSignUp} disabled={isLoading} />
      <View style={{ height: 24 }} />
    </AuthScreen>
  );
}
