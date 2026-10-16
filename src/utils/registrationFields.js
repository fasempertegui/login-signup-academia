// Estos campos se validan para el formulario de Academia TM, pero no se persisten.
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
