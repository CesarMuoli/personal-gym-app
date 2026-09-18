import React from 'react';
import { Users, Calendar, AlertCircle } from 'lucide-react';
import Card from '../components/UI/Card';
import { useAppContext } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
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

  // Formatação segura de datas para o gráfico geral de humor
  const formattedEmotions = emotionalHistory.map(e => {
    const rawDate = e.record_date || e.date || '';
    let displayDate = rawDate;
    if (rawDate && rawDate.includes('-')) {
      const parts = rawDate.split('T')[0].split('-');
      if (parts.length === 3) {
        displayDate = `${parts[2]}/${parts[1]}`;
      }
    }
    return {
      ...e,
      displayDate
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
        <Card className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-color)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{activeStudents}</span>
            <span className="stat-label">Alunos Ativos</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{todaysClasses}</span>
            <span className="stat-label">Aulas Hoje</span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{pendingAssessments}</span>
            <span className="stat-label">Avaliações Pendentes</span>
          </div>
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
