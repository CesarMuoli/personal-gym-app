import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { DollarSign, TrendingUp, Target, AlertCircle, CheckCircle2, Clock, Calendar as CalendarIcon, Check } from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';
import './Finance.css';

const Finance = () => {
  const { students, financialGoals, updateFinancialGoals, updateStudentFinance } = useAppContext();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalsForm, setGoalsForm] = useState({
    monthly_goal: financialGoals?.monthly_goal || 0,
    quarterly_goal: financialGoals?.quarterly_goal || 0
  });

  // Cálculos Financeiros
  const activeStudents = students.filter(s => s.active);
  const totalRevenue = activeStudents.reduce((acc, student) => acc + (Number(student.monthly_fee) || 0), 0);
  const averageTicket = activeStudents.length > 0 ? totalRevenue / activeStudents.length : 0;
  
  const monthlyGoalProgress = financialGoals?.monthly_goal > 0 ? (totalRevenue / financialGoals.monthly_goal) * 100 : 0;
  const quarterlyRevenueEstimate = totalRevenue * 3;
  const quarterlyGoalProgress = financialGoals?.quarterly_goal > 0 ? (quarterlyRevenueEstimate / financialGoals.quarterly_goal) * 100 : 0;

  // Lógica de Status de Pagamento
  const todayDate = new Date();
  const currentMonth = todayDate.getMonth();
  const currentYear = todayDate.getFullYear();
  const currentDay = todayDate.getDate();

  const getPaymentStatus = (student) => {
    if (!student.monthly_fee) return 'unconfigured';
    
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
    if (daysUntilDue <= 3) return 'warning';
    return 'pending';
  };

  const statusGroups = {
    paid: activeStudents.filter(s => getPaymentStatus(s) === 'paid'),
    warning: activeStudents.filter(s => getPaymentStatus(s) === 'warning'),
    late: activeStudents.filter(s => getPaymentStatus(s) === 'late'),
    pending: activeStudents.filter(s => getPaymentStatus(s) === 'pending' || getPaymentStatus(s) === 'unconfigured')
  };

  const handleQuickPay = async (student) => {
    const today = getLocalDateString();
    await updateStudentFinance(student.id, {
      last_payment_date: today
    });
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

  return (
    <div className="finance-page fade-in-up">
      <header className="page-header flex-between">
        <div>
          <h1 className="title">Gestão Financeira</h1>
          <p className="subtitle">Acompanhamento de faturamento e mensalidades</p>
        </div>
        <button className="secondary-button" onClick={() => {
          setGoalsForm({ monthly_goal: financialGoals?.monthly_goal || 0, quarterly_goal: financialGoals?.quarterly_goal || 0 });
          setIsGoalModalOpen(true);
        }}>
          <Target size={18} /> Definir Metas
        </button>
      </header>

      {/* Cards de Métricas */}
      <div className="metrics-grid">
        <Card className="metric-card glow-card">
          <div className="metric-icon revenue-icon"><DollarSign size={24} /></div>
          <h3>Faturamento Mensal</h3>
          <p className="metric-value">{formatCurrency(totalRevenue)}</p>
        </Card>

        <Card className="metric-card glow-card">
          <div className="metric-icon ticket-icon"><TrendingUp size={24} /></div>
          <h3>Ticket Médio</h3>
          <p className="metric-value">{formatCurrency(averageTicket)}</p>
        </Card>

        <Card className="metric-card progress-card glow-card">
          <div className="flex-between">
            <h3>Meta Mensal</h3>
            <span className="goal-target">Alvo: {formatCurrency(financialGoals?.monthly_goal || 0)}</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${Math.min(monthlyGoalProgress, 100)}%`, backgroundColor: monthlyGoalProgress >= 100 ? 'var(--success)' : 'var(--accent-color)' }}></div>
          </div>
          <p className="metric-sub">Progresso: {monthlyGoalProgress.toFixed(1)}%</p>
        </Card>

        <Card className="metric-card progress-card glow-card">
          <div className="flex-between">
            <h3>Meta Trimestral</h3>
            <span className="goal-target">Alvo: {formatCurrency(financialGoals?.quarterly_goal || 0)}</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${Math.min(quarterlyGoalProgress, 100)}%`, backgroundColor: quarterlyGoalProgress >= 100 ? 'var(--success)' : 'var(--info)' }}></div>
          </div>
          <p className="metric-sub">Projeção: {quarterlyGoalProgress.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Controle de Inadimplência e Mensalidades */}
      <h2 className="section-title" style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>Status de Mensalidades (Mês Atual)</h2>
      <div className="status-grid">
        
        {/* Atrasados */}
        <Card title={<div style={{display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--danger)'}}><AlertCircle size={20}/> Atrasados</div>} className="status-col late">
          {statusGroups.late.length === 0 ? <p className="empty-text">Nenhum aluno atrasado!</p> : (
            <ul className="student-list">
              {statusGroups.late.map(s => (
                <li key={s.id} className="student-item flex-between">
                  <div className="student-item-left">
                    <img src={s.avatar || `https://i.pravatar.cc/150?u=${s.id}`} alt={s.name} />
                    <div className="student-info">
                      <strong>{s.name}</strong>
                      <span>Venceu dia {s.due_date || 10} • {formatCurrency(s.monthly_fee)}</span>
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
              ))}
            </ul>
          )}
        </Card>

        {/* Próximos do Vencimento */}
        <Card title={<div style={{display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--warning)'}}><Clock size={20}/> Vencendo em Breve</div>} className="status-col warning">
          {statusGroups.warning.length === 0 ? <p className="empty-text">Nenhum vencimento próximo.</p> : (
            <ul className="student-list">
              {statusGroups.warning.map(s => (
                <li key={s.id} className="student-item flex-between">
                  <div className="student-item-left">
                    <img src={s.avatar || `https://i.pravatar.cc/150?u=${s.id}`} alt={s.name} />
                    <div className="student-info">
                      <strong>{s.name}</strong>
                      <span>Vence dia {s.due_date || 10} • {formatCurrency(s.monthly_fee)}</span>
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
              ))}
            </ul>
          )}
        </Card>

        {/* A Vencer / No Prazo */}
        <Card title={<div style={{display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--info)'}}><CalendarIcon size={20}/> A Vencer (No Prazo)</div>} className="status-col pending">
          {statusGroups.pending.length === 0 ? <p className="empty-text">Nenhuma mensalidade a vencer.</p> : (
            <ul className="student-list">
              {statusGroups.pending.map(s => (
                <li key={s.id} className="student-item flex-between">
                  <div className="student-item-left">
                    <img src={s.avatar || `https://i.pravatar.cc/150?u=${s.id}`} alt={s.name} />
                    <div className="student-info">
                      <strong>{s.name}</strong>
                      <span>Vence dia {s.due_date || 10} • {formatCurrency(s.monthly_fee)}</span>
                    </div>
                  </div>
                  <button 
                    className="quick-pay-btn" 
                    title="Dar baixa antecipada no pagamento"
                    onClick={() => handleQuickPay(s)}
                  >
                    <Check size={14} />
                    <span>Baixa</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Em Dia / Pagos */}
        <Card title={<div style={{display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--success)'}}><CheckCircle2 size={20}/> Pagos neste mês</div>} className="status-col paid">
          {statusGroups.paid.length === 0 ? <p className="empty-text">Nenhum pagamento registrado neste mês.</p> : (
            <ul className="student-list">
              {statusGroups.paid.map(s => (
                <li key={s.id} className="student-item flex-between">
                  <div className="student-item-left">
                    <img src={s.avatar || `https://i.pravatar.cc/150?u=${s.id}`} alt={s.name} />
                    <div className="student-info">
                      <strong>{s.name}</strong>
                      <span>{formatCurrency(s.monthly_fee)}</span>
                    </div>
                  </div>
                  <span className="paid-tag-status">
                    <CheckCircle2 size={14} /> Pago
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Definir Metas Financeiras">
        <form onSubmit={handleSaveGoals}>
          <div className="form-group">
            <label>Meta Mensal (R$)</label>
            <input required type="number" className="form-input" value={goalsForm.monthly_goal} onChange={e => setGoalsForm({...goalsForm, monthly_goal: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Meta Trimestral (R$)</label>
            <input required type="number" className="form-input" value={goalsForm.quarterly_goal} onChange={e => setGoalsForm({...goalsForm, quarterly_goal: e.target.value})} />
          </div>
          <button type="submit" className="primary-button" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>Salvar Metas</button>
        </form>
      </Modal>
    </div>
  );
};

export default Finance;
