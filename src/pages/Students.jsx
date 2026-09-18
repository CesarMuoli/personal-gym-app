import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { useAppContext } from '../context/AppContext';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Activity, 
  ArrowDownAZ, 
  ArrowUpAZ, 
  Clock, 
  TrendingUp, 
  Check, 
  X,
  RotateCcw
} from 'lucide-react';
import './Students.css';

const Students = () => {
  const navigate = useNavigate();
  const { students, addStudent, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('az'); // Padrão: A-Z
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

  const [formData, setFormData] = useState({ name: '', plan: '', weight: '', bodyFat: '' });

  // Filtragem e Ordenação dos Alunos
  const filteredStudents = students
    .filter(s => {
      const matchesSearch = 
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.plan || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (statusFilter === 'active') return !!s.active;
      if (statusFilter === 'inactive') return !s.active;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'az') {
        return (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' });
      }
      if (sortOrder === 'za') {
        return (b.name || '').localeCompare(a.name || '', 'pt-BR', { sensitivity: 'base' });
      }
      if (sortOrder === 'frequency') {
        return (Number(b.frequency) || 0) - (Number(a.frequency) || 0);
      }
      // 'recent'
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addStudent({
      name: formData.name,
      plan: formData.plan,
      weight: parseFloat(formData.weight) || 0,
      body_fat: parseFloat(formData.bodyFat) || 0,
      active: true,
      frequency: 0,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(formData.name.trim())}`
    });
    setIsModalOpen(false);
    setFormData({ name: '', plan: '', weight: '', bodyFat: '' });
  };

  const getSortLabel = () => {
    if (sortOrder === 'az') return 'A → Z';
    if (sortOrder === 'za') return 'Z → A';
    if (sortOrder === 'frequency') return 'Frequência';
    if (sortOrder === 'recent') return 'Recentes';
    return '';
  };

  if (loading) return <div style={{ padding: '2rem' }}>Carregando alunos...</div>;

  return (
    <div className="students-page fade-in-up">
      <header className="page-header flex-between">
        <div>
          <h1 className="title">Alunos</h1>
          <p className="subtitle">Gerencie seus alunos e acompanhe os planos.</p>
        </div>
        <button className="primary-button" onClick={() => setIsModalOpen(true)}>Novo Aluno</button>
      </header>

      <div className="filters-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar aluno..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Menu Dropdown de Filtragem e Ordenação */}
        <div className="filter-wrapper">
          <button 
            className={`icon-btn-square ${isFilterOpen || sortOrder !== 'recent' || statusFilter !== 'all' ? 'active' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={18} /> 
            <span>Filtrar: {getSortLabel()}</span>
          </button>

          {isFilterOpen && (
            <>
              <div className="filter-backdrop" onClick={() => setIsFilterOpen(false)} />
              <div className="filter-dropdown glass-panel fade-in-up">
                <div className="filter-dropdown-header flex-between">
                  <span className="filter-dropdown-title">Filtros & Ordenação</span>
                  <button className="icon-btn-close" onClick={() => setIsFilterOpen(false)}>
                    <X size={16} />
                  </button>
                </div>

                <div className="filter-section">
                  <span className="filter-section-label">Ordem Alfabética</span>
                  <button 
                    className={`filter-option ${sortOrder === 'az' ? 'selected' : ''}`}
                    onClick={() => { setSortOrder('az'); setIsFilterOpen(false); }}
                  >
                    <div className="filter-option-content">
                      <ArrowDownAZ size={16} />
                      <span>Nome (A → Z)</span>
                    </div>
                    {sortOrder === 'az' && <Check size={16} color="var(--accent-color)" />}
                  </button>
                  <button 
                    className={`filter-option ${sortOrder === 'za' ? 'selected' : ''}`}
                    onClick={() => { setSortOrder('za'); setIsFilterOpen(false); }}
                  >
                    <div className="filter-option-content">
                      <ArrowUpAZ size={16} />
                      <span>Nome (Z → A)</span>
                    </div>
                    {sortOrder === 'za' && <Check size={16} color="var(--accent-color)" />}
                  </button>
                </div>

                <div className="filter-section">
                  <span className="filter-section-label">Outras Ordenações</span>
                  <button 
                    className={`filter-option ${sortOrder === 'recent' ? 'selected' : ''}`}
                    onClick={() => { setSortOrder('recent'); setIsFilterOpen(false); }}
                  >
                    <div className="filter-option-content">
                      <Clock size={16} />
                      <span>Mais Recentes</span>
                    </div>
                    {sortOrder === 'recent' && <Check size={16} color="var(--accent-color)" />}
                  </button>
                  <button 
                    className={`filter-option ${sortOrder === 'frequency' ? 'selected' : ''}`}
                    onClick={() => { setSortOrder('frequency'); setIsFilterOpen(false); }}
                  >
                    <div className="filter-option-content">
                      <TrendingUp size={16} />
                      <span>Maior Frequência</span>
                    </div>
                    {sortOrder === 'frequency' && <Check size={16} color="var(--accent-color)" />}
                  </button>
                </div>

                <div className="filter-section">
                  <span className="filter-section-label">Status</span>
                  <div className="status-filter-pills">
                    <button 
                      className={`status-pill ${statusFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setStatusFilter('all')}
                    >
                      Todos
                    </button>
                    <button 
                      className={`status-pill ${statusFilter === 'active' ? 'active' : ''}`}
                      onClick={() => setStatusFilter('active')}
                    >
                      Ativos
                    </button>
                    <button 
                      className={`status-pill ${statusFilter === 'inactive' ? 'active' : ''}`}
                      onClick={() => setStatusFilter('inactive')}
                    >
                      Inativos
                    </button>
                  </div>
                </div>

                {(sortOrder !== 'az' || statusFilter !== 'all') && (
                  <button 
                    className="reset-filter-btn"
                    onClick={() => { setSortOrder('az'); setStatusFilter('all'); setIsFilterOpen(false); }}
                  >
                    <RotateCcw size={14} /> Restaurar Padrão (A-Z)
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="students-grid">
        {filteredStudents.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', padding: '2rem 0', textAlign: 'center', gridColumn: '1 / -1' }}>
            Nenhum aluno encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredStudents.map(student => (
            <Card key={student.id} className="student-card">
              <div className="student-card-header flex-between">
                <div className="student-avatar-wrapper">
                  <img src={student.avatar || `https://i.pravatar.cc/150?u=${student.id}`} alt={student.name} className="student-avatar" />
                  <span className={`status-indicator ${student.active ? 'active' : 'inactive'}`}></span>
                </div>
                <button className="icon-btn-transparent"><MoreVertical size={18} /></button>
              </div>
              
              <div className="student-card-body">
                <h3 className="student-name">{student.name}</h3>
                <p className="student-plan">{student.plan || 'Sem plano'}</p>
                
                <div className="student-stats">
                  <div className="stat">
                    <span className="stat-label">Frequência</span>
                    <span className="stat-value">{student.frequency || 0}%</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Última Aula</span>
                    <span className="stat-value">{student.last_class ? new Date(student.last_class).toLocaleDateString('pt-BR') : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="student-card-footer">
                <div className="emotional-quick-view">
                  <Activity size={16} color="var(--accent-color)" />
                  <span>Humor: {student.emotionalScore || 'N/A'}</span>
                </div>
                <button 
                  className="secondary-button"
                  onClick={() => navigate(`/student/${student.id}`)}
                >
                  Ver Perfil
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Novo Aluno">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome Completo</label>
            <input required type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: João Silva" />
          </div>
          <div className="form-group">
            <label>Plano</label>
            <input type="text" className="form-input" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} placeholder="Ex: Mensal 3x" />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Peso Inicial (kg)</label>
              <input type="number" step="0.1" className="form-input" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>BF Inicial (%)</label>
              <input type="number" step="0.1" className="form-input" value={formData.bodyFat} onChange={e => setFormData({...formData, bodyFat: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="primary-button" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>Salvar Aluno</button>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
