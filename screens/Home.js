import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { signOut } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../src/config/firebaseConfig';
import useDialog from '../src/hooks/useDialog';
import useUsuario from '../src/hooks/useUsuario';
import AccountSidebar from '../src/components/AccountSidebar';
import Icon from '../src/components/Icon';
import Profile from './Profile';
import { colors } from '../src/styles/academia';
import s from '../src/styles/portal';

export default function Home() {
  const { showDialog } = useDialog();
  const { usuario, status, retry } = useUsuario(auth.currentUser?.uid);
  const [section, setSection] = useState('inicio');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const logoutInProgress = useRef(false);
  const scrollRef = useRef(null);
  const gutter = useWindowDimensions().width <= 360 ? 20 : 24;

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (section !== 'perfil') return false;
      setSection('inicio');
      return true;
    });
    return () => subscription.remove();
  }, [section]);

  const navigate = destination => {
    setSection(destination);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleLogOut = async () => {
    if (logoutInProgress.current) return;
    logoutInProgress.current = true;
    setLoggingOut(true);
    setMenuOpen(false);
    try {
      await signOut(auth);
      showDialog({ title: 'Sesión cerrada', message: 'Cerraste tu sesión correctamente.', variant: 'success' });
    } catch {
      showDialog({ title: 'No pudimos cerrar sesión', message: 'Intentá nuevamente en unos momentos.', variant: 'error' });
    } finally {
      logoutInProgress.current = false;
      setLoggingOut(false);
    }
  };

  const fecha = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  return <SafeAreaView style={s.screen}>
    <StatusBar style="dark" />
    <View style={s.shell} accessibilityElementsHidden={menuOpen} importantForAccessibility={menuOpen ? 'no-hide-descendants' : 'auto'}>
      <View style={s.header}>
        <TouchableOpacity style={s.iconButton} onPress={() => setMenuOpen(true)} accessibilityRole="button" accessibilityLabel="Abrir menú de cuenta" accessibilityState={{ expanded: menuOpen }}><Icon name="menu" size={24} color={colors.text} /></TouchableOpacity>
        <View style={s.brand}><Image source={require('../assets/logo.png')} style={s.logo} /><Text style={s.brandText}>Academia TM</Text></View>
      </View>
      <ScrollView ref={scrollRef} contentContainerStyle={[s.content, { paddingHorizontal: gutter }]}>
        {section === 'inicio' ? <>
          <View style={s.hero}><Text style={s.heroDate}>{fecha}</Text><Text style={s.greeting} accessibilityRole="header">{usuario?.nombre ? `Hola, ${usuario.nombre}.` : 'Hola.'}</Text></View>
        </> : <>
          <Profile usuario={usuario} status={status} retry={retry} />
        </>}
      </ScrollView>
      <View style={s.bottomNavigation}>
        <TouchableOpacity style={s.navigationItem} onPress={() => navigate('inicio')} accessibilityRole="tab" accessibilityLabel="Inicio" accessibilityState={{ selected: section === 'inicio' }}>
          <Icon name="casa" size={24} color={section === 'inicio' ? colors.primary : colors.muted} />
          <Text style={[s.navigationLabel, section === 'inicio' && s.navigationLabelSelected]}>Inicio</Text>
          {section === 'inicio' ? <View style={s.navigationIndicator} /> : null}
        </TouchableOpacity>
        <TouchableOpacity style={s.navigationItem} disabled accessibilityRole="tab" accessibilityLabel="Sedes" accessibilityState={{ disabled: true }}>
          <Icon name="ubicacion" size={24} color={colors.disabledText} />
          <Text style={[s.navigationLabel, s.disabledText]}>Sedes</Text>
        </TouchableOpacity>
      </View>
    </View>
    <AccountSidebar visible={menuOpen} usuario={usuario} status={status} section={section} onClose={() => setMenuOpen(false)} onNavigate={navigate} onLogOut={handleLogOut} loggingOut={loggingOut} />
  </SafeAreaView>;
}
