import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../src/styles/academia';
import { auth } from '../src/config/firebaseConfig';

export default function Home() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => onIdTokenChanged(auth, currentUser => {
    // Copiamos los datos visibles para reflejar también el updateProfile del registro.
    setUser(currentUser ? { displayName: currentUser.displayName, email: currentUser.email } : null);
  }), []);

  const handleLogOut = async () => {
    try {
      await signOut(auth);  
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");
      // El observador de Firebase muestra Login al cerrar la sesión.
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Bienvenido a Academia TM</Text>
      {user?.displayName ? <Text style={styles.name}>{user.displayName}</Text> : null}
      <Text style={styles.email}>{user?.email}</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogOut}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28, backgroundColor: colors.background },
  logo: { width: 150, height: 150, borderRadius: 16, marginBottom: 28 },
  title: { fontFamily: fonts.title, fontSize: 26, lineHeight: 33, color: colors.text, textAlign: 'center', marginBottom: 20 },
  name: { fontFamily: fonts.bold, fontSize: 20, color: colors.primary, textAlign: 'center', marginBottom: 8 },
  email: { fontFamily: fonts.body, fontSize: 16, color: colors.muted, textAlign: 'center' },
  button: { backgroundColor: colors.primary, minHeight: 48, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10, marginTop: 28 },
  buttonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 16 },
});
