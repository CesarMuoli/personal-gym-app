import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import { mockStudents, mockLoadProgression, mockEmotionalHistory } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import EmotionalScale from '../components/UI/EmotionalScale';
import { User, Activity, Dumbbell, Ruler, ArrowLeft, Presentation } from 'lucide-react';
import './StudentProfile.css';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [emotionalScore, setEmotionalScore] = useState(null);

  const student = mockStudents.find(s => s.id === parseInt(id)) || mockStudents[0];

  return (
    <div className="profile-page">
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
          <button className="primary-button" onClick={() => navigate(`/presentation/${student.id}`)}>
            <Presentation size={18} /> Apresentar Resultados
          </button>
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
            <Card title="Evolução: Supino Reto" className="chart-card">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockLoadProgression}>
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
                  <button className="primary-button" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}>Salvar Registro</button>
                )}
              </Card>

              <Card title="Histórico Emocional (Média)" className="chart-card">
                <div className="chart-container" style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockEmotionalHistory}>
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
    </div>
  );
};
export default StudentProfile;
