// Validación y formato de los campos del registro de Academia TM.
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

export function formatBirthDate(value, previousValue = '') {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const isDeleting = value.length < previousValue.length;
  let formatted = digits.slice(0, 2);
  // Al borrar, no reinsertar la barra que el usuario acaba de quitar.
  if (digits.length > 2 || (digits.length === 2 && !isDeleting)) {
    formatted += '/' + digits.slice(2, 4);
  }
  if (digits.length > 4 || (digits.length === 4 && !isDeleting)) {
    formatted += '/' + digits.slice(4);
  }
  return formatted;
}

export function getBirthDateError(value) {
  if (!value.trim()) return 'Ingresá tu fecha de nacimiento.';
  if (!isValidBirthDate(value.trim())) return 'Revisá la fecha ingresada';
  return '';
}

export function getPasswordRequirements(value) {
  return [
    { id: 'length', label: 'Al menos 6 caracteres', met: /^.{6,}$/.test(value) },
    { id: 'uppercase', label: 'Una letra mayúscula', met: /[A-Z]/.test(value) },
    { id: 'lowercase', label: 'Una letra minúscula', met: /[a-z]/.test(value) },
    { id: 'number', label: 'Un número', met: /\d/.test(value) },
  ];
}

export function getPasswordError(value) {
  if (!value) return 'Ingresá tu contraseña.';
  if (!getPasswordRequirements(value).every(requirement => requirement.met)) return 'Revisá los requisitos de la contraseña';
  return '';
}

export function getConfirmPasswordError(value, password) {
  if (!value) return 'Confirmá tu contraseña.';
  if (value !== password) return 'Las contraseñas no coinciden';
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
