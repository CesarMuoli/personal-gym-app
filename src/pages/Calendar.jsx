import React, { useState } from 'react';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { useAppContext } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import './Calendar.css';

const Calendar = () => {
  const { students, calendarEvents, addEvent, loading } = useAppContext();
  const [view, setView] = useState('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', time: '', type: 'class', student_id: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventDateTime = new Date(`${formData.date}T${formData.time}:00`).toISOString();
    await addEvent({
      title: formData.title,
      event_date: eventDateTime,
      type: formData.type,
      student_id: formData.student_id ? parseInt(formData.student_id) : null
    });
    setIsModalOpen(false);
    setFormData({ title: '', date: '', time: '', type: 'class', student_id: '' });
  };

  if (loading) return <div style={{ padding: '2rem' }}>Carregando agenda...</div>;

  return (
    <div className="calendar-page fade-in-up">
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
          <button className="primary-button" onClick={() => setIsModalOpen(true)}>Novo Evento</button>
        </div>
      </header>

      <div className="calendar-content">
        <div className="calendar-sidebar">
          <Card title="Legenda" className="legend-card">
            <div className="legend-item"><div className="legend-color class"></div><span>Aula</span></div>
            <div className="legend-item"><div className="legend-color assessment"></div><span>Avaliação</span></div>
            <div className="legend-item"><div className="legend-color meeting"></div><span>Reunião</span></div>
            <div className="legend-item"><div className="legend-color birthday"></div><span>Aniversário</span></div>
          </Card>
        </div>

        <div className="calendar-main">
          <Card className="agenda-view">
            <div className="agenda-header flex-between">
              <button className="icon-btn"><ChevronLeft size={20} /></button>
              <h2 className="current-period">Mês Atual</h2>
              <button className="icon-btn"><ChevronRight size={20} /></button>
            </div>

            <div className="agenda-list">
              {calendarEvents.length === 0 ? <p style={{color: 'var(--text-secondary)'}}>Nenhum evento agendado.</p> : calendarEvents.map(event => (
                <div key={event.id} className={`agenda-item ${event.type}`}>
                  <div className="agenda-time">
                    <Clock size={16} />
                    <span>{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="agenda-details">
                    <h4 className="agenda-title">{event.title}</h4>
                    <div className="agenda-meta">
                      <span className="meta-item"><CalendarIcon size={14} /> {new Date(event.event_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agendar Novo Evento">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título do Evento</label>
            <input required type="text" className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ex: Treino Carlos" />
          </div>
          <div className="form-group">
            <label>Tipo de Evento</label>
            <select className="form-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option value="class">Aula / Treino</option>
              <option value="assessment">Avaliação Física</option>
              <option value="meeting">Reunião / Apresentação</option>
              <option value="birthday">Aniversário</option>
            </select>
          </div>
          <div className="form-group">
            <label>Aluno Relacionado (Opcional)</label>
            <select className="form-input" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})}>
              <option value="">Nenhum</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Data</label>
              <input required type="date" className="form-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Hora</label>
              <input required type="time" className="form-input" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="primary-button" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>Agendar</button>
        </form>
      </Modal>
    </div>
  );
};
export default Calendar;
