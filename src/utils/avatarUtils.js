// Catálogo curado de retratos fotográficos reais de alta definição (Fitness / Atletas)
const REAL_FITNESS_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80'
];

/**
 * Retorna uma foto real de fallback com base no ID ou nome do aluno de forma determinística
 */
export const getDefaultRealAvatar = (seed = '1') => {
  let hash = 0;
  const str = String(seed || 'student');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % REAL_FITNESS_AVATARS.length;
  return REAL_FITNESS_AVATARS[index];
};

/**
 * Obtém a foto real do aluno:
 * Se o aluno possui foto customizada salva (upload do Supabase ou URL direta), retorna ela.
 * Se for o link legado do pravatar.cc ou estiver vazio, retorna um retrato fotográfico real.
 */
export const getStudentAvatar = (student) => {
  if (!student) return REAL_FITNESS_AVATARS[0];
  
  const avatar = student.avatar || '';
  
  // Se já tiver uma foto real válida (Supabase Storage ou upload direto)
  if (avatar && !avatar.includes('pravatar.cc')) {
    return avatar;
  }
  
  // Se for pravatar ou vazio, utiliza um retrato real fitness determinístico
  return getDefaultRealAvatar(student.id || student.name || 'default');
};
