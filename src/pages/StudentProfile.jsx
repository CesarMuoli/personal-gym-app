import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import EmotionalScale from '../components/UI/EmotionalScale';
import Modal from '../components/UI/Modal';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  User, Activity, Dumbbell, Ruler, ArrowLeft, TrendingUp, DollarSign, Plus, 
  MessageCircle, Copy, Edit2, Trash2, FileText, Sparkles, Check
} from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';
import './StudentProfile.css';

const EXERCISE_CATEGORIES = [
  'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Glúteos', 'Cardio / Funcional'
];

const POPULAR_EXERCISES = {
  'Peito': ['Supino Reto com Barra', 'Supino Inclinado com Halteres', 'Crucifixo Máquina / Voador', 'Crossover Polia Média', 'Flexão de Braço'],
  'Costas': ['Puxada Alta Frontal', 'Remada Baixa Triângulo', 'Remada Curvada com Barra', 'Levantamento Terra', 'Pulldown na Polia'],
  'Pernas': ['Agachamento Livre', 'Leg Press 45º', 'Cadeira Extensora', 'Mesa Flexora', 'Stiff com Halteres', 'Panturrilha Sentado'],
  'Ombros': ['Desenvolvimento com Halteres', 'Elevação Lateral', 'Elevação Frontal', 'Crucifixo Invertido', 'Encolhimento com Halteres'],
  'Bíceps': ['Rosca Direta com Barra W', 'Rosca Alternada com Halteres', 'Rosca Martelo', 'Rosca Scott'],
  'Tríceps': ['Tríceps Corda', 'Tríceps Testa com Barra W', 'Tríceps Francês', 'Tríceps Banco / Mergulho'],
  'Abdômen': ['Abdominal Supra Solo', 'Abdominal Infra na Paralela', 'Prancha Isométrica', 'Abdominal na Polia'],
  'Glúteos': ['Elevação Pélvica com Barra', 'Glúteo no Cabo (Caneleira)', 'Abdução de Quadril Máquina', 'Passada / Afundo'],
  'Cardio / Funcional': ['Esteira (HIIT)', 'Bicicleta Ergométrica', 'Elíptico', 'Corda Naval', 'Burpee']
};

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    students, loadProgression, emotionalHistory, studentWorkouts,
    addLoad, addEmotionalScore, uploadEvaluationPhoto, updateStudentFinance,
    addStudentWorkout, updateStudentWorkout, deleteStudentWorkout,
    loading 
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [emotionalScore, setEmotionalScore] = useState(null);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('Supino Reto');
  const [loadFormData, setLoadFormData] = useState({ exercise: 'Supino Reto', load: '', week: 'Semana Atual' });

  // Estados de Fichas de Treino
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [copiedWorkoutId, setCopiedWorkoutId] = useState(null);
  const [workoutForm, setWorkoutForm] = useState({
    title: 'Treino A',
    notes: 'Aquecer 10 min. Descanso de 60s entre as séries.',
    exercises: [
      { id: '1', category: 'Peito', name: 'Supino Reto com Barra', sets: '4', reps: '10-12', notes: '' }
    ]
  });

  // Busca segura sem fallback cego para students[0]
  const student = students.find(s => String(s.id) === String(id));

  const [financeForm, setFinanceForm] = useState({
    monthly_fee: student?.monthly_fee || 0,
    due_date: student?.due_date || 10
  });
  const [prevStudentId, setPrevStudentId] = useState(student?.id);

  if (student && student.id !== prevStudentId) {
    setPrevStudentId(student.id);
    setFinanceForm({
      monthly_fee: student.monthly_fee || 0,
      due_date: student.due_date || 10
    });
  }

  if (loading) {
    return (
      <div className="profile-page flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
        <p>Carregando perfil do aluno...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="profile-page flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ color: 'var(--text-secondary)' }}>Aluno não encontrado</h2>
        <button className="primary-button" onClick={() => navigate('/students')}>
          <ArrowLeft size={18} /> Voltar para Alunos
        </button>
      </div>
    );
  }

  // Filtragem isolada de dados por aluno
  const studentLoads = loadProgression.filter(l => String(l.student_id) === String(student.id));

  // Lista de exercícios únicos deste aluno mais exercícios padrão
  const availableExercises = Array.from(new Set([
    'Supino Reto',
    'Agachamento Livre',
    'Levantamento Terra',
    'Desenvolvimento Ombros',
    'Puxada Alta',
    ...studentLoads.map(l => l.exercise).filter(Boolean)
  ]));

  // Gráfico isolado exclusivamente para o exercício selecionado
  const chartLoads = studentLoads.filter(l => (l.exercise || '').toLowerCase() === selectedExercise.toLowerCase());

  const studentEmotions = emotionalHistory
    .filter(e => String(e.student_id) === String(student.id))
    .map(e => {
      const cleanDate = e.record_date ? (e.record_date.includes('T') ? e.record_date.split('T')[0] : e.record_date) : '';
      return {
        ...e,
        displayDate: cleanDate 
          ? new Date(cleanDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) 
          : (e.date || '')
      };
    });

  const latestEmotion = studentEmotions.length > 0 ? studentEmotions[studentEmotions.length - 1] : null;
  const latestEmotionalScore = latestEmotion ? `${latestEmotion.score}/10` : (student.emotionalScore ? `${student.emotionalScore}/10` : 'Sem registros');

  const handleAddLoad = async (e) => {
    e.preventDefault();
    await addLoad({
      student_id: student.id,
      exercise: loadFormData.exercise,
      load: parseFloat(loadFormData.load) || 0,
      week: loadFormData.week
    });
    setSelectedExercise(loadFormData.exercise);
    setIsLoadModalOpen(false);
    setLoadFormData(prev => ({ ...prev, load: '' }));
  };

  const handleSaveEmotional = async () => {
    if (emotionalScore === null) return;
    await addEmotionalScore({
      student_id: student.id,
      score: emotionalScore,
      record_date: getLocalDateString()
    });
    setEmotionalScore(null);
  };

  // Upload com validação de segurança (MIME e tamanho máximo de 5MB)
  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido. Use apenas fotos JPG, PNG ou WEBP.');
      e.target.value = '';
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxBytes) {
      toast.error('Arquivo muito pesado. O limite máximo é de 5MB.');
      e.target.value = '';
      return;
    }
    
    toast.loading(`Enviando foto de ${type === 'before' ? 'Antes' : 'Depois'}...`, { id: 'upload' });
    const url = await uploadEvaluationPhoto(student.id, type, file);
    e.target.value = '';
    if (url) {
      toast.success('Foto enviada com sucesso!', { id: 'upload' });
    } else {
      toast.dismiss('upload');
    }
  };

  const handleUpdateFinance = async (e) => {
    e.preventDefault();
    await updateStudentFinance(student.id, {
      monthly_fee: Number(financeForm.monthly_fee) || 0,
      due_date: Math.min(Math.max(Number(financeForm.due_date) || 10, 1), 31)
    });
  };

  const isPaidThisMonth = () => {
    if (!student?.last_payment_date) return false;
    try {
      const clean = student.last_payment_date.includes('T') ? student.last_payment_date.split('T')[0] : String(student.last_payment_date);
      const [y, m] = clean.split('-').map(Number);
      const now = new Date();
      return y === now.getFullYear() && m === now.getMonth() + 1;
    } catch {
      return false;
    }
  };

  const handleMarkAsPaid = async () => {
    const today = getLocalDateString();
    await updateStudentFinance(student.id, {
      last_payment_date: today
    });
  };

  const handleUndoPayment = async () => {
    if (window.confirm('Deseja cancelar o registro de pagamento deste mês para este aluno?')) {
      await updateStudentFinance(student.id, {
        last_payment_date: null
      });
    }
  };

  const formatPaymentDate = (dateStr) => {
    if (!dateStr) return 'Nunca pago';
    try {
      const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const [year, month, day] = cleanDate.split('-');
      if (!year || !month || !day) return dateStr;
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Handlers de Fichas de Treino
  const studentWorkoutsList = (studentWorkouts || []).filter(w => String(w.student_id) === String(student.id));

  const handleOpenNewWorkout = () => {
    setEditingWorkoutId(null);
    setWorkoutForm({
      title: 'Treino A - Peito e Tríceps',
      notes: 'Aquecer 10 min na esteira. Intervalo de 60s entre séries.',
      exercises: [
        { id: 'ex_' + Date.now(), category: 'Peito', name: 'Supino Reto com Barra', sets: '4', reps: '10-12', notes: 'Cadência controlada' },
        { id: 'ex_' + (Date.now() + 1), category: 'Peito', name: 'Crucifixo Inclinado com Halteres', sets: '3', reps: '12', notes: '' },
        { id: 'ex_' + (Date.now() + 2), category: 'Tríceps', name: 'Tríceps Corda', sets: '4', reps: '12-15', notes: 'Pico de contração 2s' }
      ]
    });
    setIsWorkoutModalOpen(true);
  };

  const handleOpenEditWorkout = (workout) => {
    setEditingWorkoutId(workout.id);
    setWorkoutForm({
      title: workout.title || '',
      notes: workout.notes || '',
      exercises: Array.isArray(workout.exercises) && workout.exercises.length > 0 
        ? workout.exercises 
        : [{ id: 'ex_' + Date.now(), category: 'Peito', name: '', sets: '3', reps: '10-12', notes: '' }]
    });
    setIsWorkoutModalOpen(true);
  };

  const handleAddExerciseRow = () => {
    setWorkoutForm(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { id: 'ex_' + Date.now(), category: 'Peito', name: '', sets: '3', reps: '10-12', notes: '' }
      ]
    }));
  };

  const handleRemoveExerciseRow = (index) => {
    if (workoutForm.exercises.length <= 1) {
      toast.error('O treino deve ter pelo menos 1 exercício.');
      return;
    }
    setWorkoutForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const handleExerciseChange = (index, field, value) => {
    setWorkoutForm(prev => {
      const updated = [...prev.exercises];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, exercises: updated };
    });
  };

  const handleSaveWorkout = async (e) => {
    e.preventDefault();
    if (!workoutForm.title.trim()) {
      toast.error('Informe o título da ficha de treino.');
      return;
    }
    const cleanExercises = workoutForm.exercises
      .map(ex => ({ ...ex, name: (ex.name || '').trim() }))
      .filter(ex => ex.name.length > 0);

    if (cleanExercises.length === 0) {
      toast.error('Adicione ao menos um exercício com o nome preenchido.');
      return;
    }

    const payload = {
      student_id: student.id,
      title: workoutForm.title.trim(),
      notes: (workoutForm.notes || '').trim(),
      exercises: cleanExercises
    };

    if (editingWorkoutId) {
      await updateStudentWorkout(editingWorkoutId, payload);
    } else {
      await addStudentWorkout(payload);
    }
    setIsWorkoutModalOpen(false);
  };

  const handleDeleteWorkout = async (workout) => {
    if (window.confirm(`Tem certeza que deseja remover a ficha "${workout.title}"?`)) {
      await deleteStudentWorkout(workout.id);
    }
  };

  const generateWhatsAppMessage = (workout) => {
    const dateStr = new Date().toLocaleDateString('pt-BR');
    let msg = `🏋️‍♂️ *PERSONALGYM - FICHA DE TREINO* 🏋️‍♂️\n`;
    msg += `👤 *Aluno(a):* ${student.name}\n`;
    msg += `📋 *Treino:* ${workout.title}\n`;
    msg += `📅 *Prescrição:* ${dateStr}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;

    if (workout.notes) {
      msg += `💡 *Orientações Gerais:*\n${workout.notes}\n\n`;
    }

    msg += `💪 *EXERCÍCIOS:* \n`;
    const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
    if (exercises.length === 0) {
      msg += `(Nenhum exercício detalhado)\n`;
    } else {
      exercises.forEach((ex, idx) => {
        msg += `\n*${idx + 1}. ${ex.name || 'Exercício'}* ${ex.category ? `(${ex.category})` : ''}\n`;
        msg += `   • Séries: *${ex.sets || 3}*\n`;
        msg += `   • Repetições: *${ex.reps || '10-12'}*\n`;
        if (ex.notes) {
          msg += `   • Obs: _${ex.notes}_\n`;
        }
      });
    }

    msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🔥 *Bons treinos! Foco na técnica e na constância.*`;
    return msg;
  };

  const handleSendWhatsApp = (workout) => {
    const text = generateWhatsAppMessage(workout);
    const cleanPhone = (student.phone || '').replace(/\D/g, '');
    let url = '';
    if (cleanPhone && cleanPhone.length >= 10) {
      const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      url = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(text)}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank');
  };

  const handleCopyWorkout = (workout) => {
    const text = generateWhatsAppMessage(workout);
    navigator.clipboard.writeText(text);
    setCopiedWorkoutId(workout.id);
    toast.success('Ficha copiada para a área de transferência!');
    setTimeout(() => setCopiedWorkoutId(null), 2500);
  };

  return (
    <div className="profile-page fade-in-up">
      <header className="profile-header">
        <button className="back-button" onClick={() => navigate('/students')}>
          <ArrowLeft size={18} />
          <span>Voltar para Alunos</span>
        </button>
        <div className="profile-info flex-between">
          <div className="profile-user">
            <img src={student.avatar || `https://i.pravatar.cc/150?u=${student.id}`} alt={student.name} className="profile-avatar" />
            <div>
              <h1 className="title" style={{ marginBottom: '0.25rem' }}>{student.name}</h1>
              <p className="subtitle">{student.plan || 'Sem plano cadastrado'} • {student.active ? 'Ativo' : 'Inativo'}</p>
            </div>
          </div>
          <div className="profile-actions">
            <button className="secondary-button" onClick={() => navigate(`/presentation/${student.id}`)}>
              <TrendingUp size={18} />
              Modo Apresentação
            </button>
          </div>
        </div>

        <nav className="profile-tabs">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <User size={18} /> Resumo
          </button>
          <button className={`tab-btn ${activeTab === 'workout' ? 'active' : ''}`} onClick={() => setActiveTab('workout')}>
            <FileText size={18} /> Ficha de Treino
          </button>
          <button className={`tab-btn ${activeTab === 'load' ? 'active' : ''}`} onClick={() => setActiveTab('load')}>
            <Dumbbell size={18} /> Evolução de Carga
          </button>
          <button className={`tab-btn ${activeTab === 'emotional' ? 'active' : ''}`} onClick={() => setActiveTab('emotional')}>
            <Activity size={18} /> Emocional
          </button>
          <button className={`tab-btn ${activeTab === 'physical' ? 'active' : ''}`} onClick={() => setActiveTab('physical')}>
            <Ruler size={18} /> Avaliação Física
          </button>
          <button className={`tab-btn ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}>
            <DollarSign size={18} /> Financeiro
          </button>
        </nav>
      </header>

      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="tab-pane overview-tab">
            <Card title="Estatísticas Rápidas" className="stats-card">
              <div className="quick-stats">
                <div><span>Frequência (Mês)</span> <strong>{student.frequency || 0}%</strong></div>
                <div><span>Peso Atual</span> <strong>{student.weight || '--'} kg</strong></div>
                <div><span>Percentual Gordura</span> <strong>{student.body_fat ?? student.bodyFat ?? 0}%</strong></div>
                <div><span>Humor Mais Recente</span> <strong>{latestEmotionalScore}</strong></div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'workout' && (
          <div className="tab-pane workout-tab fade-in-up">
            <div className="workout-tab-header">
              <div>
                <h2>Fichas de Treino ({studentWorkoutsList.length})</h2>
                <p>Prescreva treinos personalizados e envie diretamente no WhatsApp do aluno.</p>
              </div>
              <button className="primary-button" onClick={handleOpenNewWorkout}>
                <Plus size={18} /> Montar Novo Treino
              </button>
            </div>

            {studentWorkoutsList.length === 0 ? (
              <Card className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
                  <FileText size={32} />
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Nenhum treino cadastrado</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px' }}>
                    Monte a primeira ficha de exercícios do aluno para enviar pelo WhatsApp com formatação profissional.
                  </p>
                </div>
                <button className="primary-button" onClick={handleOpenNewWorkout} style={{ marginTop: '0.5rem' }}>
                  <Plus size={18} /> Montar Treino Agora
                </button>
              </Card>
            ) : (
              <div className="workout-list">
                {studentWorkoutsList.map(workout => {
                  const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
                  return (
                    <div key={workout.id} className="workout-card glow-card">
                      <div className="workout-card-top">
                        <div className="workout-title-group">
                          <h3>{workout.title}</h3>
                          <span className="workout-count-badge">{exercises.length} {exercises.length === 1 ? 'exercício' : 'exercícios'}</span>
                        </div>
                        <div className="workout-actions-group">
                          <button 
                            className="whatsapp-btn"
                            onClick={() => handleSendWhatsApp(workout)}
                            title="Enviar ficha formatada no WhatsApp"
                          >
                            <MessageCircle size={17} />
                            <span>Enviar via WhatsApp</span>
                          </button>
                          <button 
                            className="icon-btn-action" 
                            onClick={() => handleCopyWorkout(workout)} 
                            title={copiedWorkoutId === workout.id ? "Copiado!" : "Copiar texto do treino"}
                          >
                            {copiedWorkoutId === workout.id ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                          </button>
                          <button 
                            className="icon-btn-action" 
                            onClick={() => handleOpenEditWorkout(workout)} 
                            title="Editar treino"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="icon-btn-action danger" 
                            onClick={() => handleDeleteWorkout(workout)} 
                            title="Excluir treino"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {workout.notes && (
                        <div className="workout-notes-banner">
                          <Sparkles size={16} />
                          <div>
                            <strong>Orientações: </strong>
                            <span>{workout.notes}</span>
                          </div>
                        </div>
                      )}

                      <div className="workout-exercise-grid">
                        {exercises.map((ex, idx) => (
                          <div key={ex.id || idx} className="workout-exercise-row">
                            <div className="exercise-main-info">
                              <div className="exercise-number">{idx + 1}</div>
                              <div className="exercise-name-box">
                                <strong>{ex.name}</strong>
                                <span>{ex.category || 'Geral'}</span>
                              </div>
                            </div>
                            <div className="exercise-params-pills">
                              <span className="param-pill sets-pill">
                                <strong>{ex.sets || 3}</strong> séries
                              </span>
                              <span className="param-pill reps-pill">
                                <strong>{ex.reps || '10-12'}</strong> reps
                              </span>
                              {ex.notes && (
                                <span className="param-pill notes-pill">
                                  {ex.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'load' && (
          <div className="tab-pane load-tab">
            <div className="tab-header flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Exercício:</span>
                <select 
                  className="form-input" 
                  style={{ width: 'auto', minWidth: '200px' }}
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                >
                  {availableExercises.map(ex => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>

              <button className="primary-button" onClick={() => {
                setLoadFormData(prev => ({ ...prev, exercise: selectedExercise }));
                setIsLoadModalOpen(true);
              }}>
                <Plus size={18} /> Nova Carga
              </button>
            </div>

            <Card title={`Evolução de Carga: ${selectedExercise}`} className="chart-card">
              <div className="chart-container">
                {chartLoads.length === 0 ? (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    Nenhuma carga registrada para {selectedExercise}.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartLoads}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="week" stroke="var(--text-secondary)" />
                      <YAxis stroke="var(--text-secondary)" />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'white' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                      <Bar dataKey="load" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'emotional' && (
          <div className="tab-pane emotional-tab">
            <div className="emotional-grid">
              <Card title="Registro Pós-Treino">
                <EmotionalScale value={emotionalScore} onChange={setEmotionalScore} />
                {emotionalScore !== null && (
                  <button className="primary-button" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }} onClick={handleSaveEmotional}>Salvar Registro</button>
                )}
              </Card>

              <Card title="Histórico Emocional do Aluno" className="chart-card">
                <div className="chart-container" style={{ height: '250px' }}>
                  {studentEmotions.length === 0 ? (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                      Nenhum registro de humor salvo para este aluno.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={studentEmotions}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="displayDate" stroke="var(--text-secondary)" />
                        <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke="var(--text-secondary)" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'white' }} />
                        <Line type="monotone" dataKey="score" stroke="var(--info)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-card)', stroke: 'var(--info)', strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'physical' && (
          <div className="tab-pane physical-tab">
            <Card title="Comparativo Visual (Avaliação Física)">
              <div className="comparison-view" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem' }}>
                
                {/* Foto Antes */}
                <div className="photo-container" style={{ textAlign: 'center', flex: 1 }}>
                  <label style={{ cursor: 'pointer', display: 'block' }}>
                    <div className="photo-placeholder" style={{ 
                      height: '350px', 
                      borderRadius: '16px', 
                      border: '2px dashed var(--border-color)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      overflow: 'hidden',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      marginBottom: '1rem'
                    }}>
                      {student.photo_before ? (
                        <img src={student.photo_before} alt="Antes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>+ Adicionar Foto (Antes)</span>
                      )}
                    </div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => handlePhotoUpload(e, 'before')} />
                  </label>
                  <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Início do Plano</span>
                </div>

                {/* Foto Depois */}
                <div className="photo-container" style={{ textAlign: 'center', flex: 1 }}>
                  <label style={{ cursor: 'pointer', display: 'block' }}>
                    <div className="photo-placeholder" style={{ 
                      height: '350px', 
                      borderRadius: '16px', 
                      border: '2px dashed var(--success)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      overflow: 'hidden',
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      marginBottom: '1rem'
                    }}>
                      {student.photo_after ? (
                        <img src={student.photo_after} alt="Depois" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'var(--success)' }}>+ Adicionar Foto (Atual)</span>
                      )}
                    </div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={(e) => handlePhotoUpload(e, 'after')} />
                  </label>
                  <span style={{ fontWeight: 500, color: 'var(--success)' }}>Evolução Atual</span>
                </div>

              </div>
            </Card>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="tab-pane finance-tab">
            <Card title="Configurações de Pagamento">
              <form onSubmit={handleUpdateFinance}>
                <div className="form-group">
                  <label>Valor da Mensalidade (R$)</label>
                  <input type="number" step="0.01" className="form-input" value={financeForm.monthly_fee} onChange={e => setFinanceForm({...financeForm, monthly_fee: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Dia do Vencimento</label>
                  <input type="number" min="1" max="31" className="form-input" value={financeForm.due_date} onChange={e => setFinanceForm({...financeForm, due_date: e.target.value})} />
                </div>
                <button type="submit" className="primary-button" style={{ marginTop: '1rem' }}>Atualizar Dados</button>
              </form>
            </Card>

            <Card title="Controle do Mês Atual" style={{ marginTop: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Último pagamento registrado: <strong>{formatPaymentDate(student.last_payment_date)}</strong>
              </p>
              {isPaidThisMonth() ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    ✓ Mensalidade quitada neste mês
                  </span>
                  <button 
                    type="button" 
                    className="secondary-button" 
                    style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }} 
                    onClick={handleUndoPayment}
                  >
                    Desfazer Baixa
                  </button>
                </div>
              ) : (
                <button className="primary-button" style={{ backgroundColor: 'var(--success)' }} onClick={handleMarkAsPaid}>
                  Marcar como Pago neste mês
                </button>
              )}
            </Card>
          </div>
        )}
      </div>

      <Modal isOpen={isLoadModalOpen} onClose={() => setIsLoadModalOpen(false)} title="Adicionar Carga">
        <form onSubmit={handleAddLoad}>
          <div className="form-group">
            <label>Exercício</label>
            <input required type="text" className="form-input" value={loadFormData.exercise} onChange={e => setLoadFormData({...loadFormData, exercise: e.target.value})} placeholder="Ex: Supino Reto" />
          </div>
          <div className="form-group">
            <label>Carga (kg)</label>
            <input required type="number" step="0.5" className="form-input" value={loadFormData.load} onChange={e => setLoadFormData({...loadFormData, load: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Semana/Referência</label>
            <input required type="text" className="form-input" value={loadFormData.week} onChange={e => setLoadFormData({...loadFormData, week: e.target.value})} placeholder="Ex: Semana 4" />
          </div>
          <button type="submit" className="primary-button" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>Registrar</button>
        </form>
      </Modal>

      {/* Modal Construtor de Fichas de Treino */}
      <Modal 
        isOpen={isWorkoutModalOpen} 
        onClose={() => setIsWorkoutModalOpen(false)} 
        title={editingWorkoutId ? "Editar Ficha de Treino" : "Montar Ficha de Treino"}
      >
        <form onSubmit={handleSaveWorkout} className="workout-builder-form">
          <div className="form-group">
            <label>Nome / Identificador do Treino *</label>
            <input 
              required 
              type="text" 
              className="form-input" 
              value={workoutForm.title} 
              onChange={e => setWorkoutForm({ ...workoutForm, title: e.target.value })} 
              placeholder="Ex: Treino A - Peito e Tríceps" 
            />
            <div className="quick-templates">
              {['Treino A', 'Treino B', 'Treino C', 'Superiores', 'Inferiores', 'Full Body'].map(tpl => (
                <button 
                  key={tpl} 
                  type="button" 
                  className="quick-tag-btn" 
                  onClick={() => setWorkoutForm(prev => ({ ...prev, title: tpl }))}
                >
                  {tpl}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Orientações Gerais / Observações (Opcional)</label>
            <textarea 
              className="form-input" 
              rows={2} 
              value={workoutForm.notes} 
              onChange={e => setWorkoutForm({ ...workoutForm, notes: e.target.value })} 
              placeholder="Ex: Aquecer 10 min. Descanso de 60 segundos entre séries. Foco em execução controlada." 
            />
          </div>

          <div className="form-group">
            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
              <label style={{ margin: 0, fontWeight: 600 }}>Exercícios da Ficha ({workoutForm.exercises.length})</label>
              <button 
                type="button" 
                className="secondary-button" 
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} 
                onClick={handleAddExerciseRow}
              >
                <Plus size={14} /> Adicionar Exercício
              </button>
            </div>

            <div className="exercise-rows-container">
              {workoutForm.exercises.map((ex, index) => {
                const popularForCategory = POPULAR_EXERCISES[ex.category] || [];
                return (
                  <div key={ex.id || index} className="exercise-builder-row">
                    <div className="exercise-builder-header">
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-color)' }}>
                        #{index + 1} Exercício
                      </span>
                      {workoutForm.exercises.length > 1 && (
                        <button 
                          type="button" 
                          className="icon-btn-action danger" 
                          style={{ width: '28px', height: '28px' }} 
                          onClick={() => handleRemoveExerciseRow(index)}
                          title="Remover exercício"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="exercise-builder-grid">
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Grupo Muscular</label>
                        <select 
                          className="form-input" 
                          value={ex.category} 
                          onChange={e => {
                            const newCat = e.target.value;
                            handleExerciseChange(index, 'category', newCat);
                            if (!ex.name && POPULAR_EXERCISES[newCat]?.length > 0) {
                              handleExerciseChange(index, 'name', POPULAR_EXERCISES[newCat][0]);
                            }
                          }}
                        >
                          {EXERCISE_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nome do Exercício *</label>
                        <input 
                          required 
                          type="text" 
                          className="form-input" 
                          list={`popular-list-${index}`}
                          value={ex.name} 
                          onChange={e => handleExerciseChange(index, 'name', e.target.value)} 
                          placeholder="Digite ou escolha..." 
                        />
                        <datalist id={`popular-list-${index}`}>
                          {popularForCategory.map(pop => (
                            <option key={pop} value={pop} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Séries</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={ex.sets} 
                          onChange={e => handleExerciseChange(index, 'sets', e.target.value)} 
                          placeholder="Ex: 4" 
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Repetições</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={ex.reps} 
                          onChange={e => handleExerciseChange(index, 'reps', e.target.value)} 
                          placeholder="Ex: 10-12" 
                        />
                      </div>
                    </div>

                    <div>
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }} 
                        value={ex.notes || ''} 
                        onChange={e => handleExerciseChange(index, 'notes', e.target.value)} 
                        placeholder="Observação / Carga (Opcional. Ex: Drop-set na última, cadência 3s)" 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              className="secondary-button" 
              style={{ flex: 1, justifyContent: 'center' }} 
              onClick={() => setIsWorkoutModalOpen(false)}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="primary-button" 
              style={{ flex: 2, justifyContent: 'center' }}
            >
              Salvar Ficha de Treino
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentProfile;
