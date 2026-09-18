import React, { useState } from 'react';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { useAppContext } from '../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  CheckCircle2, 
  ListFilter, 
  Grid
} from 'lucide-react';
import './Calendar.css';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const Calendar = () => {
  const { students, calendarEvents, addEvent, loading } = useAppContext();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayDrawerOpen, setIsDayDrawerOpen] = useState(false);

  // Form de agendamento
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    type: 'class',
    student_id: ''
  });

  // Navegação de mês
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Cálculo da Grade do Mês
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Dias do mês anterior para preencher a primeira semana
  const prevMonthDays = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthDays.push({
      day: prevMonthTotalDays - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false
    });
  }

  // Dias do mês atual
  const currentMonthDays = [];
  for (let d = 1; d <= totalDaysInMonth; d++) {
    currentMonthDays.push({
      day: d,
      month: month,
      year: year,
      isCurrentMonth: true
    });
  }

  // Dias do próximo mês para fechar a grade (múltiplo de 7)
  const remainingCells = 42 - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = [];
  for (let n = 1; n <= remainingCells; n++) {
    nextMonthDays.push({
      day: n,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false
    });
  }

  const allCalendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Helper para formatar data em string YYYY-MM-DD
  const formatDateKey = (y, m, d) => {
    const mStr = String(m + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    return `${y}-${mStr}-${dStr}`;
  };

  // Eventos mapeados por data
  const getEventsForDate = (y, m, d) => {
    const dateKey = formatDateKey(y, m, d);
    return calendarEvents.filter(event => {
      if (!event.event_date) return false;
      const eDate = new Date(event.event_date).toISOString().split('T')[0];
      return eDate === dateKey;
    });
  };

  // Clique em uma data na grade
  const handleDayClick = (dayObj) => {
    const clickedDate = new Date(dayObj.year, dayObj.month, dayObj.day);
    setSelectedDate(clickedDate);
    const dateStr = formatDateKey(dayObj.year, dayObj.month, dayObj.day);
    setFormData(prev => ({ ...prev, date: dateStr }));
    setIsDayDrawerOpen(true);
  };

  // Abrir modal de novo evento para a data selecionada
  const handleOpenScheduleModal = (prefilledDate) => {
    const dateStr = prefilledDate 
      ? formatDateKey(prefilledDate.getFullYear(), prefilledDate.getMonth(), prefilledDate.getDate())
      : formData.date;

    setFormData(prev => ({
      ...prev,
      date: dateStr,
      time: '09:00',
      title: '',
      student_id: ''
    }));
    setIsDayDrawerOpen(false);
    setIsModalOpen(true);
  };

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
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      type: 'class',
      student_id: ''
    });
  };

  const todayDate = new Date();
  const selectedDateEvents = getEventsForDate(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  );

  const selectedDateFormatted = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const getTypeName = (type) => {
    switch (type) {
      case 'class': return 'Aula / Treino';
      case 'assessment': return 'Avaliação Física';
      case 'meeting': return 'Reunião';
      case 'birthday': return 'Aniversário';
      default: return 'Compromisso';
    }
  };

  return (
    <div className="calendar-page fade-in-up">
      {/* Header com Navegação e Controles Premium */}
      <header className="page-header flex-between">
        <div>
          <h1 className="title">Agenda & Calendário Inteligente</h1>
          <p className="subtitle">Clique em qualquer data para visualizar ou agendar compromissos com praticidade.</p>
        </div>

        <div className="calendar-top-actions">
          <div className="view-toggle glass-panel">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Visão Grade Mensal"
            >
              <Grid size={16} /> Grade Mensal
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Visão em Lista"
            >
              <ListFilter size={16} /> Próximos Eventos
            </button>
          </div>

          <button 
            className="primary-button" 
            onClick={() => handleOpenScheduleModal(selectedDate)}
          >
            <Plus size={18} /> Novo Agendamento
          </button>
        </div>
      </header>

      {/* Barra de Controle de Navegação do Mês */}
      <div className="calendar-navigator-bar glass-panel flex-between">
        <div className="nav-month-controls">
          <button className="nav-circle-btn" onClick={handlePrevMonth} title="Mês Anterior">
            <ChevronLeft size={20} />
          </button>
          <h2 className="current-month-label">
            {MONTH_NAMES[month]} <span className="year-highlight">{year}</span>
          </h2>
          <button className="nav-circle-btn" onClick={handleNextMonth} title="Próximo Mês">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="nav-quick-actions">
          <button className="today-chip" onClick={handleToday}>
            Hoje
          </button>
          
          <div className="legend-strip">
            <span className="legend-badge class"><span className="dot"></span> Treino</span>
            <span className="legend-badge assessment"><span className="dot"></span> Avaliação</span>
            <span className="legend-badge meeting"><span className="dot"></span> Reunião</span>
            <span className="legend-badge birthday"><span className="dot"></span> Especial</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Carregando eventos...
        </div>
      ) : viewMode === 'grid' ? (
        /* VISÃO GRADE MENSAL INTERATIVA */
        <div className="calendar-grid-wrapper glass-panel">
          <div className="weekdays-grid">
            {WEEKDAYS.map((w, idx) => (
              <div key={idx} className={`weekday-cell ${idx === 0 || idx === 6 ? 'weekend' : ''}`}>
                {w}
              </div>
            ))}
          </div>

          <div className="days-grid">
            {allCalendarDays.map((dObj, idx) => {
              const dayEvents = getEventsForDate(dObj.year, dObj.month, dObj.day);
              const isToday = 
                todayDate.getDate() === dObj.day &&
                todayDate.getMonth() === dObj.month &&
                todayDate.getFullYear() === dObj.year;

              const isSelected = 
                selectedDate.getDate() === dObj.day &&
                selectedDate.getMonth() === dObj.month &&
                selectedDate.getFullYear() === dObj.year;

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(dObj)}
                  className={`day-cell ${!dObj.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                >
                  <div className="day-cell-header">
                    <span className={`day-number ${isToday ? 'today-pill' : ''}`}>
                      {dObj.day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="events-count-pill">{dayEvents.length}</span>
                    )}
                  </div>

                  <div className="day-cell-events">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div key={ev.id} className={`event-micro-pill ${ev.type || 'class'}`}>
                        <span className="event-pill-time">
                          {new Date(ev.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="event-pill-title">{ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="more-events-hint">
                        +{dayEvents.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VISÃO EM LISTA (CRONOLÓGICA) */
        <Card className="agenda-list-view">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Próximos Compromissos Agendados</h3>
          {calendarEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
              Nenhum evento agendado até o momento.
            </div>
          ) : (
            <div className="chronological-list">
              {calendarEvents.map(event => (
                <div key={event.id} className={`chronological-item ${event.type || 'class'}`}>
                  <div className="event-time-col">
                    <Clock size={16} />
                    <strong>{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                    <span>{new Date(event.event_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <div className="event-main-col">
                    <h4>{event.title}</h4>
                    <span className="event-badge-tag">{getTypeName(event.type)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* MODAL / PAINEL DO DIA SELECIONADO (Exibição e Ação Rápida de Agendamento) */}
      <Modal 
        isOpen={isDayDrawerOpen} 
        onClose={() => setIsDayDrawerOpen(false)} 
        title={`Compromissos do Dia`}
      >
        <div className="day-drawer-content">
          <div className="selected-date-header">
            <CalendarIcon size={20} className="glow-cyan-icon" />
            <h3 style={{ textTransform: 'capitalize' }}>{selectedDateFormatted}</h3>
          </div>

          <div className="day-events-list">
            {selectedDateEvents.length === 0 ? (
              <div className="empty-day-state">
                <CheckCircle2 size={36} color="var(--accent-color)" />
                <p>Nenhum compromisso marcado para este dia.</p>
                <span>Aproveite o horário livre ou agende uma aula agora!</span>
              </div>
            ) : (
              selectedDateEvents.map(ev => (
                <div key={ev.id} className={`day-drawer-event ${ev.type || 'class'}`}>
                  <div className="drawer-event-time">
                    <Clock size={16} />
                    <span>{new Date(ev.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="drawer-event-info">
                    <strong>{ev.title}</strong>
                    <span>{getTypeName(ev.type)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="day-drawer-footer">
            <button 
              className="primary-button" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => handleOpenScheduleModal(selectedDate)}
            >
              <Plus size={18} /> + Agendar nesta Data
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL DE CADASTRO DE NOVO EVENTO */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agendar Novo Evento">
        <form onSubmit={handleSubmit} className="calendar-modal-form">
          <div className="form-group">
            <label>Título do Evento</label>
            <input 
              required 
              type="text" 
              className="form-input" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="Ex: Treino Carlos - Peito e Tríceps" 
            />
          </div>

          <div className="form-group">
            <label>Tipo de Evento</label>
            <select 
              className="form-input" 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option value="class">Treino / Aula Presencial</option>
              <option value="assessment">Avaliação Física Antropométrica</option>
              <option value="meeting">Reunião / Alinhamento de Metas</option>
              <option value="birthday">Aniversário / Evento Especial</option>
            </select>
          </div>

          <div className="form-group">
            <label>Aluno Relacionado (Opcional)</label>
            <select 
              className="form-input" 
              value={formData.student_id} 
              onChange={e => setFormData({...formData, student_id: e.target.value})}
            >
              <option value="">Nenhum aluno específico</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.plan || 'Sem plano'})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Data</label>
              <input 
                required 
                type="date" 
                className="form-input" 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Horário</label>
              <input 
                required 
                type="time" 
                className="form-input" 
                value={formData.time} 
                onChange={e => setFormData({...formData, time: e.target.value})} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="primary-button" 
            style={{ width: '100%', marginTop: '1.25rem', justifyContent: 'center' }}
          >
            Confirmar Agendamento
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Calendar;
