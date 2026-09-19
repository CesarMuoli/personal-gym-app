/**
 * Utilitários para tratamento de telefones e integração direta com WhatsApp
 */

export const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, '');
  // Remove 0 à esquerda do DDD se existir (ex: 011 -> 11)
  if (cleaned.length === 12 && cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  let digits = cleanPhoneNumber(phone);
  
  // Se veio com DDI 55 e tem 12 ou 13 dígitos
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.substring(2);
  }

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

export const getWhatsAppUrl = (phone, studentName = '', customMessage = '') => {
  const digits = cleanPhoneNumber(phone);
  if (!digits || digits.length < 10) return '';

  const fullPhone = digits.startsWith('55') ? digits : `55${digits}`;
  const defaultMessage = studentName 
    ? `Olá, ${studentName}! Aqui é o seu Personal Trainer.`
    : `Olá! Aqui é o seu Personal Trainer.`;
  const message = customMessage || defaultMessage;

  return `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(message)}`;
};
