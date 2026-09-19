import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Calendar as CalendarIcon, 
  Check, 
  Hourglass,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';
import './Finance.css';

const Finance = () => {
  const { students, financialGoals, updateFinancialGoals, updateStudentFinance, loading } = useAppContext();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalsForm, setGoalsForm] = useState({
    monthly_goal: financialGoals?.monthly_goal || 0,
    quarterly_goal: financialGoals?.quarterly_goal || 0
  });

  // Sincroniza o formulário quando os dados do backend chegam/atualizam
  useEffect(() => {
    setGoalsForm({
      monthly_goal: financialGoals?.monthly_goal || 0,
      quarterly_goal: financialGoals?.quarterly_goal || 0
    });
  }, [financialGoals]);

  // Lógica de Datas e Prazos
  const todayDate = new Date();
  const currentMonth = todayDate.getMonth(); // 0 a 11 (Jan=0, Set=8, Dez=11)
  const currentYear = todayDate.getFullYear();
  const currentDay = todayDate.getDate();

  // Contagem exata de dias restantes para o fechamento do mês
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemainingMonth = Math.max(0, lastDayOfMonth - currentDay);

  // Semestre Vigente (1º Semestre: Jan-Jun | 2º Semestre: Jul-Dez)
  const currentSemester = currentMonth < 6 ? 1 : 2;
  const semesterEndMonth = currentSemester === 1 ? 5 : 11; // Junho (5) ou Dezembro (11)
  const lastDayOfSemester = new Date(currentYear, semesterEndMonth + 1, 0).getDate();
  
  // Contagem exata e normalizada de dias até o término do semestre
  const todayStart = new Date(currentYear, currentMonth, currentDay);
  const semesterEndStart = new Date(currentYear, semesterEndMonth, lastDayOfSemester);
  const daysRemainingSemester = Math.max(0, Math.round((semesterEndStart - todayStart) / (1000 * 60 * 60 * 24)));
  const semesterTag = currentSemester === 1 ? 'S1' : 'S2';
  const semesterFullName = `${currentSemester}º Semestre (${semesterTag})`;

  // Cálculos Financeiros Gerais
  const activeStudents = students.filter(s => s.active);
  const totalRevenue = activeStudents.reduce((acc, student) => acc + (Number(student.monthly_fee) || 0), 0);
  const averageTicket = activeStudents.length > 0 ? totalRevenue / activeStudents.length : 0;

  // Classificação Canônica em 3 Grupos (Sem duplicidade)
  const getPaymentStatus = (student) => {
    let isPaidThisMonth = false;
    if (student.last_payment_date) {
      try {
        const cleanDateStr = typeof student.last_payment_date === 'string' && student.last_payment_date.includes('T')
          ? student.last_payment_date.split('T')[0]
          : String(student.last_payment_date);
        const [pYear, pMonth] = cleanDateStr.split('-').map(Number);
        if (pYear === currentYear && pMonth === currentMonth + 1) {
          isPaidThisMonth = true;
        }
      } catch (err) {
        console.error('Erro ao verificar data de pagamento:', err);
      }
    }

    if (isPaidThisMonth) return 'paid';

    const dueDate = Number(student.due_date) || 10;
    const daysUntilDue = dueDate - currentDay;

    if (daysUntilDue < 0) return 'late';
    return 'upcoming';
  };

  const statusGroups = {
    paid: activeStudents.filter(s => getPaymentStatus(s) === 'paid'),
    upcoming: activeStudents.filter(s => getPaymentStatus(s) === 'upcoming'),
    late: activeStudents.filter(s => getPaymentStatus(s) === 'late')
  };

  // Totais financeiros por coluna
  const paidTotal = statusGroups.paid.reduce((acc, s) => acc + (Number(s.monthly_fee) || 0), 0);
  const upcomingTotal = statusGroups.upcoming.reduce((acc, s) => acc + (Number(s.monthly_fee) || 0), 0);
  const lateTotal = statusGroups.late.reduce((acc, s) => acc + (Number(s.monthly_fee) || 0), 0);
  const pendingTotal = upcomingTotal + lateTotal;

  // Meta Mensal: Medida exclusivamente sobre a Receita Realizada (paidTotal)
  const monthlyGoal = Number(financialGoals?.monthly_goal) || 0;
  const monthlyGoalProgress = monthlyGoal > 0 ? (paidTotal / monthlyGoal) * 100 : 0;
  const monthlyGoalRemaining = Math.max(0, monthlyGoal - paidTotal);

  // Estimativa e Meta Semestral (Alinhada ao montante realizado)
  const semiannualGoal = Number(financialGoals?.quarterly_goal) || 0;
  const semiannualRealized = paidTotal;
  const semiannualGoalProgress = semiannualGoal > 0 
    ? (semiannualRealized / semiannualGoal) * 100 
    : 0;
  const semiannualGoalRemaining = Math.max(0, semiannualGoal - semiannualRealized);

  const handleQuickPay = async (student) => {
    const today = getLocalDateString();
    await updateStudentFinance(student.id, {
      last_payment_date: today
    });
  };

  const handleUndoPay = async (student) => {
    if (window.confirm(`Deseja desfazer a baixa do pagamento deste mês para "${student.name}"?`)) {
      await updateStudentFinance(student.id, {
        last_payment_date: null
      });
    }
  };

  const handleSaveGoals = async (e) => {
    e.preventDefault();
    await updateFinancialGoals({
      monthly_goal: Number(goalsForm.monthly_goal),
      quarterly_goal: Number(goalsForm.quarterly_goal)
    });
    setIsGoalModalOpen(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatPaidDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const [, m, d] = clean.split('-');
      if (d && m) return `em ${d}/${m}`;
      return '';
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="finance-page flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
        <p>Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="finance-page fade-in-up">
      <header className="page-header flex-between">
        <div>
          <h1 className="title">Gestão Financeira</h1>
          <p className="subtitle">Controle de caixa, metas e mensalidades em tempo real</p>
        </div>
        <button className="secondary-button" onClick={() => {
          setGoalsForm({ monthly_goal: financialGoals?.monthly_goal || 0, quarterly_goal: financialGoals?.quarterly_goal || 0 });
          setIsGoalModalOpen(true);
        }}>
          <Target size={18} /> Definir Metas
        </button>
      </header>

      {/* Cards de Métricas com Identidade Cromática Distinta (UI/UX 10/10) */}
      <div className="metrics-grid">
        
        {/* 1. Receita Recebida no Mês (Cyan Neon) */}
        <Card className="metric-card glow-card-cyan">
          <div className="metric-icon revenue-icon">
            <DollarSign size={24} />
          </div>
          <h3>Receita Recebida</h3>
          <p className="metric-value">{formatCurrency(paidTotal)}</p>
          <span className="metric-helper">Previsão: {formatCurrency(totalRevenue)} ({statusGroups.paid.length}/{activeStudents.length} pagos)</span>
        </Card>

        {/* 2. Ticket Médio (Cyber Purple Neon) */}
        <Card className="metric-card glow-card-purple">
          <div className="metric-icon ticket-icon">
            <TrendingUp size={24} />
          </div>
          <h3>Ticket Médio</h3>
          <p className="metric-value">{formatCurrency(averageTicket)}</p>
          <span className="metric-helper">Pendente a receber: {formatCurrency(pendingTotal)}</span>
        </Card>

        {/* 3. Meta Mensal (Emerald Neon + Timer) */}
        <Card className="metric-card progress-card glow-card-green">
          <div className="flex-between metric-header-flex">
            <div className="metric-header-left">
              <div className="metric-icon goal-monthly-icon">
                <Target size={22} />
              </div>
              <div>
                <h3>Meta Mensal</h3>
                <span className="goal-target">Alvo: {formatCurrency(monthlyGoal)}</span>
              </div>
            </div>
            <div className="goal-timer-badge green" title="Dias restantes para fechar o mês">
              <Hourglass size={13} />
              <span>{daysRemainingMonth === 0 ? 'Último dia!' : `Faltam ${daysRemainingMonth} dias`}</span>
            </div>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill progress-fill-green" 
              style={{ width: `${Math.min(monthlyGoalProgress, 100)}%` }}
            />
          </div>
          <div className="flex-between metric-sub-row">
            <p className="metric-sub">Progresso: <strong>{monthlyGoalProgress.toFixed(1)}%</strong> ({formatCurrency(paidTotal)})</p>
            <p className="metric-sub">
              {monthlyGoalProgress >= 100 ? (
                <span className="goal-reached-text">Meta Atingida! 🚀</span>
              ) : (
                `Falta ${formatCurrency(monthlyGoalRemaining)}`
              )}
            </p>
          </div>
        </Card>

        {/* 4. Meta Semestral (Gold / Amber Neon + Timer) */}
        <Card className="metric-card progress-card glow-card-amber">
          <div className="flex-between metric-header-flex">
            <div className="metric-header-left">
              <div className="metric-icon goal-quarterly-icon">
                <Target size={22} />
              </div>
              <div>
                <h3>Meta Semestral ({semesterTag})</h3>
                <span className="goal-target">Alvo: {formatCurrency(semiannualGoal)}</span>
              </div>
            </div>
            <div className="goal-timer-badge amber" title={`Dias restantes para encerrar o ${semesterFullName}`}>
              <Hourglass size={13} />
              <span>{daysRemainingSemester === 0 ? 'Fim do semestre!' : `Faltam ${daysRemainingSemester} dias`}</span>
            </div>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill progress-fill-amber" 
              style={{ width: `${Math.min(semiannualGoalProgress, 100)}%` }}
            />
          </div>
          <div className="flex-between metric-sub-row">
            <p className="metric-sub">Progresso: <strong>{semiannualGoalProgress.toFixed(1)}%</strong> ({formatCurrency(semiannualRealized)})</p>
            <p className="metric-sub">
              {semiannualGoalProgress >= 100 ? (
                <span className="goal-reached-text">Meta Atingida! 🚀</span>
              ) : (
                `Falta ${formatCurrency(semiannualGoalRemaining)}`
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Controle de Mensalidades - Nova Ordem Didática e Focada no Sucesso */}
      <div className="status-section-header flex-between">
        <div>
          <h2 className="section-title">Status de Mensalidades (Mês Atual)</h2>
          <p className="section-subtitle">Acompanhe quem já pagou, os próximos vencimentos e cobranças pendentes</p>
        </div>
      </div>

      {/* Grade de 3 Colunas Canônicas (Pagos -> A Vencer -> Atrasados) */}
      <div className="status-grid">
        
        {/* COLUNA 1 (Verde): O que o Personal já ganhou no mês (Receita Garantida) */}
        <Card 
          title={
            <div className="status-col-header">
              <div className="status-col-title" style={{ color: 'var(--success)' }}>
                <CheckCircle2 size={20} />
                <span>Pagos no Mês</span>
              </div>
              <div className="status-col-meta">
                <span className="status-count-badge paid">{statusGroups.paid.length}</span>
                <span className="status-total-val paid">{formatCurrency(paidTotal)}</span>
              </div>
            </div>
          } 
          className="status-col paid glow-border-green"
        >
          {statusGroups.paid.length === 0 ? (
            <div className="empty-state-box">
              <p className="empty-text">Nenhum pagamento registrado neste mês ainda.</p>
            </div>
          ) : (
            <ul className="student-list">
              {statusGroups.paid.map(s => (
                <li key={s.id} className="student-item flex-between">
                  <div className="student-item-left">
                    <img src={s.avatar || `https://i.pravatar.cc/150?u=${s.id}`} alt={s.name} />
                    <div className="student-info">
                      <strong>{s.name}</strong>
                      <span>{formatCurrency(s.monthly_fee)} • {formatPaidDate(s.last_payment_date)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="paid-tag-status">
                      <CheckCircle2 size={14} /> Pago
                    </span>
                    <button 
                      className="quick-pay-btn quick-pay-undo" 
                      title="Desfazer baixa deste pagamento"
                      onClick={() => handleUndoPay(s)}
                    >
                      Desfazer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* COLUNA 2 (Cyan/Âmbar): O que vai vencer (Previsão de Receita com Alertas Inteligentes) */}
        <Card 
          title={
            <div className="status-col-header">
              <div className="status-col-title" style={{ color: 'var(--accent-color)' }}>
                <Clock size={20} />
                <span>A Vencer</span>
              </div>
              <div className="status-col-meta">
                <span className="status-count-badge upcoming">{statusGroups.upcoming.length}</span>
                <span className="status-total-val upcoming">{formatCurrency(upcomingTotal)}</span>
              </div>
            </div>
          } 
          className="status-col upcoming glow-border-cyan"
        >
          {statusGroups.upcoming.length === 0 ? (
            <div className="empty-state-box">
              <p className="empty-text">Tudo quitado! Nenhuma mensalidade a vencer.</p>
            </div>
          ) : (
            <ul className="student-list">
              {statusGroups.upcoming.map(s => {
                const dueDate = Number(s.due_date) || 10;
                const daysUntilDue = dueDate - currentDay;

                return (
                  <li key={s.id} className="student-item flex-between">
                    <div className="student-item-left">
                      <img src={s.avatar || `https://i.pravatar.cc/150?u=${s.id}`} alt={s.name} />
                      <div className="student-info">
                        <strong>{s.name}</strong>
                        <div className="student-due-meta">
                          <span>{formatCurrency(s.monthly_fee)}</span>
                          {daysUntilDue === 0 ? (
                            <span className="badge-due-today">
                              <Flame size={12} /> Vence Hoje
                            </span>
                          ) : daysUntilDue <= 3 ? (
                            <span className="badge-due-soon">
                              <AlertTriangle size={12} /> Vence em {daysUntilDue}d
                            </span>
                          ) : (
                            <span className="badge-due-normal">
                              <CalendarIcon size={12} /> Dia {dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      className="quick-pay-btn" 
                      title="Dar baixa no pagamento deste mês"
                      onClick={() => handleQuickPay(s)}
                    >
                      <Check size={14} />
                      <span>Baixa</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* COLUNA 3 (Vermelho): Inadimplência / Cobranças (Ação Necessária) */}
        <Card 
          title={
            <div className="status-col-header">
              <div className="status-col-title" style={{ color: 'var(--danger)' }}>
                <AlertCircle size={20} />
                <span>Em Atraso</span>
              </div>
              <div className="status-col-meta">
                <span className="status-count-badge late">{statusGroups.late.length}</span>
                <span className="status-total-val late">{formatCurrency(lateTotal)}</span>
              </div>
            </div>
          } 
          className="status-col late glow-border-red"
        >
          {statusGroups.late.length === 0 ? (
            <div className="empty-state-box">
              <p className="empty-text">Zero inadimplência! Parabéns.</p>
            </div>
          ) : (
            <ul className="student-list">
              {statusGroups.late.map(s => {
                const dueDate = Number(s.due_date) || 10;
                const daysLate = currentDay - dueDate;

                return (
                  <li key={s.id} className="student-item flex-between">
                    <div className="student-item-left">
                      <img src={s.avatar || `https://i.pravatar.cc/150?u=${s.id}`} alt={s.name} />
                      <div className="student-info">
                        <strong>{s.name}</strong>
                        <div className="student-due-meta">
                          <span>{formatCurrency(s.monthly_fee)}</span>
                          <span className="badge-due-late">
                            <AlertCircle size={12} /> {daysLate}d de atraso
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="quick-pay-btn quick-pay-late" 
                      title="Receber e dar baixa no pagamento"
                      onClick={() => handleQuickPay(s)}
                    >
                      <Check size={14} />
                      <span>Baixa</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Modal de Definição de Metas */}
      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Definir Metas Financeiras">
        <form onSubmit={handleSaveGoals}>
          <div className="form-group">
            <label>Meta Mensal (R$)</label>
            <input 
              required 
              type="number" 
              className="form-input" 
              value={goalsForm.monthly_goal} 
              onChange={e => setGoalsForm({...goalsForm, monthly_goal: e.target.value})} 
              placeholder="Ex: 5000"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
              Alvo de receita a arrecadar dentro do mês vigente (Receita atual: {formatCurrency(paidTotal)})
            </span>
          </div>
          <div className="form-group">
            <label>Meta Semestral (R$)</label>
            <input 
              required 
              type="number" 
              className="form-input" 
              value={goalsForm.quarterly_goal} 
              onChange={e => setGoalsForm({...goalsForm, quarterly_goal: e.target.value})} 
              placeholder="Ex: 25000"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
              Alvo de receita acumulada para o semestre ({semesterTag})
            </span>
          </div>
          <button type="submit" className="primary-button" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>Salvar Metas</button>
        </form>
      </Modal>
    </div>
  );
};

export default Finance;
