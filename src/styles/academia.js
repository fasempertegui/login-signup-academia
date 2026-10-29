import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#4B176D', deep: '#391052', lime: '#B6D532',
  background: '#F8F6F0', white: '#FFFFFF', night: '#291334',
  text: '#23192A', muted: '#6B6072', placeholder: '#776C7E',
  border: '#8A7D95', separator: '#DED7E3',
  error: '#AB3434',
};

export const fonts = {
  body: 'AtkinsonRegular', medium: 'AtkinsonMedium', bold: 'AtkinsonSemiBold',
  title: 'AnybodySemiBold', hero: 'AnybodyBold',
};

export const styles = StyleSheet.create({
  title: { fontFamily: fonts.title, fontSize: 28, lineHeight: 34, letterSpacing: -0.7, color: colors.text, transform: [{ scaleX: 0.9 }], transformOrigin: 'left center' },
  description: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.muted, marginTop: 8 },
  link: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 21, color: colors.primary },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, marginTop: -8, marginBottom: 17, alignSelf: 'flex-start' },
  row: { flexDirection: 'row', gap: 12 },
  recovery: { alignSelf: 'flex-end', minHeight: 44, padding: 8, marginTop: -3, marginBottom: 24, justifyContent: 'center' },
  invitation: { marginTop: 'auto', paddingTop: 22, borderTopWidth: 1, borderTopColor: colors.separator, gap: 12 },
  invitationText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.muted },
});
