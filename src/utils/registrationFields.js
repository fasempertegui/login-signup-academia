// Estos campos se validan para el formulario de Academia TM, pero no se persisten.
export function getNameError(value, label = 'nombre', { isEditing = false } = {}) {
  const name = value.normalize('NFC').trim();
  if (!name) return `Ingresá tu ${label}.`;
  if (/\p{N}/u.test(name)) return `El ${label} no puede contener números.`;

  // Letras Unicode y separadores habituales entre las partes de un nombre.
  const nameRegex = /^\p{L}[\p{L}\p{M}]*(?:(?: +|[-'’])\p{L}[\p{L}\p{M}]*)*$/u;
  // Permite seguir escribiendo «Jean-» u «O’» sin marcar un error prematuro.
  const nameToCheck = isEditing ? name.replace(/[-'’]$/, '') : name;
  if (!nameRegex.test(nameToCheck)) return 'Usá letras, espacios, guiones o apóstrofos';
  return '';
}

export function getEmailError(value) {
  const email = value.trim();
  if (!email) return 'Ingresá tu correo electrónico.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Revisá el correo. Ejemplo: vos@ejemplo.com';
  return '';
}

export function getPhoneError(value) {
  if (!value.trim()) return 'Ingresá tu celular.';
  const normalizedPhone = value.replace(/[\s()-]/g, '');
  const phoneRegex = /^(?:\+?549)?[1-9]\d{9}$/;
  if (!phoneRegex.test(normalizedPhone)) return 'Revisá el número ingresado';
  return '';
}

export function generatedUsername(firstName, lastName) {
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  return normalize(lastName) + normalize(firstName).slice(0, 1);
}

export function isValidBirthDate(value) {
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateRegex.exec(value);
  if (!match) return false;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minimum = new Date(today);
  minimum.setFullYear(minimum.getFullYear() - 120);
  // El límite del 29 de febrero se ajusta al último día de febrero.
  if (minimum.getMonth() !== today.getMonth()) minimum.setDate(0);
  return date >= minimum && date <= today;
}
