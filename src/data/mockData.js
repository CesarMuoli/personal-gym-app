export const mockStudents = [
  {
    id: 1,
    name: 'Carlos Silva',
    plan: 'Premium 3x',
    active: true,
    lastClass: '2023-11-10',
    frequency: 95,
    avatar: 'https://i.pravatar.cc/150?u=carlos',
    emotionalScore: 12, // 0-15 scale
    weight: 85,
    height: 1.80,
    bodyFat: 15,
  },
  {
    id: 2,
    name: 'Ana Souza',
    plan: 'Basic 2x',
    active: true,
    lastClass: '2023-11-11',
    frequency: 80,
    avatar: 'https://i.pravatar.cc/150?u=ana',
    emotionalScore: 8,
    weight: 65,
    height: 1.65,
    bodyFat: 22,
  },
  {
    id: 3,
    name: 'Marcos Paulo',
    plan: 'Premium 5x',
    active: false,
    lastClass: '2023-10-25',
    frequency: 45,
    avatar: 'https://i.pravatar.cc/150?u=marcos',
    emotionalScore: 5,
    weight: 92,
    height: 1.75,
    bodyFat: 28,
  }
];

export const mockLoadProgression = [
  { week: 'Sem 1', load: 20 },
  { week: 'Sem 4', load: 25 },
  { week: 'Sem 8', load: 30 },
  { week: 'Sem 12', load: 35 },
  { week: 'Sem 16', load: 40 },
];

export const mockEmotionalHistory = [
  { date: '01/10', score: 10 },
  { date: '08/10', score: 12 },
  { date: '15/10', score: 9 },
  { date: '22/10', score: 14 },
  { date: '29/10', score: 15 },
];

export const mockCalendarEvents = [
  { 
    id: 1, 
    title: 'Treino Carlos (Peito/Tríceps)', 
    date: new Date(), 
    type: 'class' 
  },
  { 
    id: 2, 
    title: 'Avaliação Ana', 
    date: new Date(new Date().setHours(15, 0)), 
    type: 'assessment' 
  },
  { 
    id: 3, 
    title: 'Aniversário João', 
    date: new Date(new Date().setDate(new Date().getDate() + 1)), 
    type: 'birthday' 
  },
  { 
    id: 4, 
    title: 'Apresentação Resultados Carlos', 
    date: new Date(new Date().setDate(new Date().getDate() + 2)), 
    type: 'meeting' 
  },
];
