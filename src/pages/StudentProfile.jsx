import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import EmotionalScale from '../components/UI/EmotionalScale';
import Modal from '../components/UI/Modal';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { User, Activity, Dumbbell, Ruler, ArrowLeft, TrendingUp, DollarSign, Plus } from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';
import './StudentProfile.css';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, loadProgression, emotionalHistory, addLoad, addEmotionalScore, uploadEvaluationPhoto, updateStudentFinance } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [emotionalScore, setEmotionalScore] = useState(null);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('Supino Reto');
  const [loadFormData, setLoadFormData] = useState({ exercise: 'Supino Reto', load: '', week: 'Semana Atual' });

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
    .map(e => ({
      ...e,
      displayDate: e.record_date ? new Date(e.record_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : (e.date || '')
    }));

  const latestEmotion = studentEmotions.length > 0 ? studentEmotions[studentEmotions.length - 1] : null;
  const latestEmotionalScore = latestEmotion ? `${latestEmotion.score}/15` : (student.emotionalScore ? `${student.emotionalScore}/15` : 'Sem registros');

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
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxBytes) {
      toast.error('Arquivo muito pesado. O limite máximo é de 5MB.');
      return;
    }
    
    toast.loading(`Enviando foto de ${type === 'before' ? 'Antes' : 'Depois'}...`, { id: 'upload' });
    const url = await uploadEvaluationPhoto(student.id, type, file);
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

  const handleMarkAsPaid = async () => {
    const today = getLocalDateString();
    await updateStudentFinance(student.id, {
      last_payment_date: today
    });
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
                        <YAxis domain={[0, 15]} stroke="var(--text-secondary)" />
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
              <button className="primary-button" style={{ backgroundColor: 'var(--success)' }} onClick={handleMarkAsPaid}>
                Marcar como Pago neste mês
              </button>
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
    </div>
  );
};

export default StudentProfile;
