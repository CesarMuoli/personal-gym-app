import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import EmotionalScale from '../components/UI/EmotionalScale';
import Modal from '../components/UI/Modal';
import { useAppContext } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { User, Activity, Dumbbell, Ruler, ArrowLeft, Presentation, TrendingUp } from 'lucide-react';
import './StudentProfile.css';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, loadProgression, emotionalHistory, addLoad, addEmotionalScore } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [emotionalScore, setEmotionalScore] = useState(null);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [loadFormData, setLoadFormData] = useState({ exercise: 'Supino Reto', load: '', week: 'Semana Atual' });

  const student = students.find(s => s.id === parseInt(id)) || students[0];

  const handleAddLoad = async (e) => {
    e.preventDefault();
    await addLoad({
      student_id: parseInt(id),
      exercise: loadFormData.exercise,
      load: parseFloat(loadFormData.load),
      week: loadFormData.week
    });
    setIsLoadModalOpen(false);
    setLoadFormData({ exercise: 'Supino Reto', load: '', week: 'Semana Atual' });
  };

  const handleSaveEmotional = async () => {
    if (emotionalScore === null) return;
    await addEmotionalScore({
      student_id: parseInt(id),
      score: emotionalScore,
      date: new Date().toISOString().split('T')[0]
    });
    setEmotionalScore(null);
  };

  if (!student) {
    return <div className="profile-page"><div className="profile-content">Aluno não encontrado</div></div>;
  }

  return (
    <div className="profile-page fade-in-up">
      <header className="profile-header">
        <button className="icon-btn-transparent" onClick={() => navigate('/students')}><ArrowLeft size={18} /> Voltar para Alunos</button>
        <div className="profile-info flex-between">
          <div className="profile-user">
            <img src={student.avatar} alt={student.name} className="profile-avatar" />
            <div>
              <h1 className="title" style={{ marginBottom: '0.25rem' }}>{student.name}</h1>
              <p className="subtitle">{student.plan} • {student.active ? 'Ativo' : 'Inativo'}</p>
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
        </nav>
      </header>

      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="tab-pane overview-tab">
            <Card title="Estatísticas Rápidas" className="stats-card">
              <div className="quick-stats">
                <div><span>Frequência (Mês)</span> <strong>{student.frequency}%</strong></div>
                <div><span>Peso Atual</span> <strong>{student.weight} kg</strong></div>
                <div><span>Percentual Gordura</span> <strong>{student.bodyFat}%</strong></div>
                <div><span>Humor Atual</span> <strong>{student.emotionalScore}/15</strong></div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'load' && (
          <div className="tab-pane load-tab">
            <div className="tab-header flex-between" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{color: 'var(--text-primary)'}}>Evolução de Cargas - {loadFormData.exercise}</h3>
              <button className="primary-button" onClick={() => setIsLoadModalOpen(true)}>Nova Carga</button>
            </div>
            <Card title="Evolução: Supino Reto" className="chart-card">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={loadProgression}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="week" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'white' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="load" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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

              <Card title="Histórico Emocional (Média)" className="chart-card">
                <div className="chart-container" style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={emotionalHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--text-secondary)" />
                      <YAxis domain={[0, 15]} stroke="var(--text-secondary)" />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'white' }} />
                      <Line type="monotone" dataKey="score" stroke="var(--info)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-card)', stroke: 'var(--info)', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'physical' && (
          <div className="tab-pane physical-tab">
            <Card title="Comparativo Visual">
              <div className="comparison-view">
                <div className="photo-container">
                  <div className="photo-placeholder">Foto Antes</div>
                  <span>Início do Plano - {student.weight + 5}kg</span>
                </div>
                <div className="photo-container">
                  <div className="photo-placeholder" style={{ borderColor: 'var(--success)' }}>Foto Atual</div>
                  <span>Hoje - {student.weight}kg</span>
                </div>
              </div>
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
