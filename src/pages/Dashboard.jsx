import React from 'react';
import { Users, Calendar, TrendingUp, AlertCircle, Heart } from 'lucide-react';
import Card from '../components/UI/Card';
import { mockStudents, mockCalendarEvents, mockEmotionalHistory } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const activeStudents = mockStudents.filter(s => s.active).length;
  const todaysClasses = mockCalendarEvents.filter(e => e.type === 'class').length;
  const pendingAssessments = mockCalendarEvents.filter(e => e.type === 'assessment').length;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1 className="title">Dashboard</h1>
          <p className="subtitle">Bem-vindo de volta! Aqui está o resumo do seu dia.</p>
        </div>
        <button className="primary-button">Novo Aluno</button>
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
          <Card title="Acompanhamento Emocional (Média Geral)" className="chart-card">
            <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockEmotionalHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={[0, 15]} stroke="var(--text-secondary)" axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'white' }}
                    itemStyle={{ color: 'var(--accent-color)' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="var(--accent-color)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-card)', stroke: 'var(--accent-color)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="side-column">
          <Card title="Agenda de Hoje" className="schedule-card">
            <div className="schedule-list">
              {mockCalendarEvents.map(event => (
                <div key={event.id} className="schedule-item">
                  <div className={`event-indicator ${event.type}`}></div>
                  <div className="event-details">
                    <span className="event-title">{event.title}</span>
                    <span className="event-time">
                      {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
