/**
 * Utilitários de manipulação de data no fuso horário local do usuário.
 * Evita bugs de deslocamento causados por .toISOString() quando em fusos negativos (ex: Brasil UTC-3).
 */

export const getLocalDateString = (d = new Date()) => {
  if (!d) return '';
  const date = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateKey = (year, month, day) => {
  const mStr = String(month + 1).padStart(2, '0');
  const dStr = String(day).padStart(2, '0');
  return `${year}-${mStr}-${dStr}`;
};
