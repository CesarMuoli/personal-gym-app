import React, { useState } from 'react';
import Card from '../components/UI/Card';
import { mockCalendarEvents } from '../data/mockData';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import './Calendar.css';

const Calendar = () => {
  const [view, setView] = useState('week');

  return (
    <div className="calendar-page">
      <header className="page-header flex-between">
        <div>
          <h1 className="title">Agenda Inteligente</h1>
          <p className="subtitle">Gerencie suas aulas, avaliações e compromissos.</p>
        </div>
        
        <div className="calendar-controls">
          <div className="view-selector glass-panel">
            <button className={`view-btn ${view === 'day' ? 'active' : ''}`} onClick={() => setView('day')}>Dia</button>
            <button className={`view-btn ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Semana</button>
            <button className={`view-btn ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Mês</button>
          </div>
          <button className="primary-button">Novo Evento</button>
        </div>
      </header>

      <div className="calendar-content">
        <div className="calendar-sidebar">
          <Card title="Legenda" className="legend-card">
            <div className="legend-item">
              <div className="legend-color class"></div>
              <span>Aula</span>
            </div>
            <div className="legend-item">
              <div className="legend-color assessment"></div>
              <span>Avaliação Física</span>
            </div>
            <div className="legend-item">
              <div className="legend-color meeting"></div>
              <span>Apresentação/Reunião</span>
            </div>
            <div className="legend-item">
              <div className="legend-color birthday"></div>
              <span>Aniversário</span>
            </div>
          </Card>
        </div>

        <div className="calendar-main">
          <Card className="agenda-view">
            <div className="agenda-header flex-between">
              <button className="icon-btn"><ChevronLeft size={20} /></button>
              <h2 className="current-period">Novembro 2023</h2>
              <button className="icon-btn"><ChevronRight size={20} /></button>
            </div>

            <div className="agenda-list">
              {mockCalendarEvents.map(event => (
                <div key={event.id} className={`agenda-item ${event.type}`}>
                  <div className="agenda-time">
                    <Clock size={16} />
                    <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="agenda-details">
                    <h4 className="agenda-title">{event.title}</h4>
                    <div className="agenda-meta">
                      <span className="meta-item"><CalendarIcon size={14} /> {new Date(event.date).toLocaleDateString()}</span>
                      <span className="meta-item"><User size={14} /> {event.title.includes('Carlos') ? 'Carlos Silva' : 'Aluno'}</span>
                    </div>
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
export default Calendar;
