import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, AlertCircle } from 'lucide-react';
import Card from '../components/UI/Card';
import { useAppContext } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { students, calendarEvents, emotionalHistory, loading } = useAppContext();

  if (loading) return <div style={{ padding: '2rem' }}>Carregando dados...</div>;

  const activeStudents = students.filter(s => s.active).length;

  // Filtro preciso para o dia de hoje
  const todayDateStr = new Date().toDateString();
  const todaysClasses = calendarEvents.filter(e => {
    if (e.type !== 'class') return false;
    return e.event_date ? new Date(e.event_date).toDateString() === todayDateStr : false;
  }).length;

  // Avaliações pendentes a partir de hoje
  const nowTimestamp = new Date().setHours(0, 0, 0, 0);
  const pendingAssessments = calendarEvents.filter(e => {
    if (e.type !== 'assessment') return false;
    return e.event_date ? new Date(e.event_date).getTime() >= nowTimestamp : false;
  }).length;

  // Agrupamento por data e cálculo da média real diária para o gráfico geral
  const emotionsByDate = emotionalHistory.reduce((acc, curr) => {
    const rawDate = curr.record_date || curr.date || '';
    if (!rawDate) return acc;
    const dateKey = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
    const scoreVal = Number(curr.score) || 0;
    
    if (!acc[dateKey]) {
      acc[dateKey] = { total: scoreVal, count: 1, dateKey };
    } else {
      acc[dateKey].total += scoreVal;
      acc[dateKey].count += 1;
    }
    return acc;
  }, {});

  const formattedEmotions = Object.values(emotionsByDate)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .map(item => {
      const avgScore = Number((item.total / item.count).toFixed(1));
      const parts = item.dateKey.split('-');
      const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.dateKey;
      return {
        dateKey: item.dateKey,
        displayDate,
        score: avgScore,
        count: item.count
      };
    });

  return (
    <div className="dashboard-page fade-in-up">
      <header className="dashboard-header">
        <div>
          <h1 className="title">Dashboard</h1>
          <p className="subtitle">Bem-vindo de volta! Aqui está o resumo atualizado da sua operação.</p>
        </div>
      </header>

      <div className="stats-grid">
        <Card 
          className="stat-card clickable" 
          onClick={() => navigate('/students')}
          aria-label="Clique para ir para Gestão de Alunos"
        >
          <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-color)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{activeStudents}</span>
            <span className="stat-label">Alunos Ativos</span>
          </div>
          <span className="stat-card-hint">Acessar →</span>
        </Card>

        <Card 
          className="stat-card clickable" 
          onClick={() => navigate('/calendar')}
          aria-label="Clique para abrir a Agenda"
        >
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{todaysClasses}</span>
            <span className="stat-label">Aulas Hoje</span>
          </div>
          <span className="stat-card-hint">Agenda →</span>
        </Card>

        <Card 
          className="stat-card clickable" 
          onClick={() => navigate('/calendar')}
          aria-label="Clique para ver Avaliações na Agenda"
        >
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{pendingAssessments}</span>
            <span className="stat-label">Avaliações Pendentes</span>
          </div>
          <span className="stat-card-hint">Agenda →</span>
        </Card>
      </div>

      <div className="dashboard-content">
        <div className="main-column">
          <Card title="Acompanhamento Emocional Geral (Média)" className="chart-card">
            <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
              {formattedEmotions.length === 0 ? (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  Nenhum registro emocional registrado ainda.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedEmotions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="displayDate" stroke="var(--text-secondary)" axisLine={false} tickLine={false} dy={10} />
                    <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke="var(--text-secondary)" axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'white' }}
                      formatter={(value, _name, item) => [
                        `${value}/10 ${item.payload?.count > 1 ? `(${item.payload.count} registros)` : ''}`, 
                        'Média Diária'
                      ]}
                      labelFormatter={(label) => `Dia: ${label}`}
                    />
                    <Line type="monotone" dataKey="score" stroke="var(--accent-color)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-card)', stroke: 'var(--accent-color)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        <div className="side-column">
          <Card title="Próximos Eventos da Agenda" className="schedule-card">
            <div className="schedule-list">
              {calendarEvents.length === 0 ? (
                <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Nenhum evento agendado.</p>
              ) : calendarEvents.slice(0, 8).map(event => (
                <div key={event.id} className="schedule-item">
                  <div className={`event-indicator ${event.type}`}></div>
                  <div className="event-details">
                    <span className="event-title">{event.title}</span>
                    <span className="event-time">
                      {new Date(event.event_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
