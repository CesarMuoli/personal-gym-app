import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { useAppContext } from '../context/AppContext';
import { 
  Search, 
  Filter, 
  Activity, 
  ArrowDownAZ, 
  ArrowUpAZ, 
  Clock, 
  TrendingUp, 
  Check, 
  X, 
  RotateCcw,
  Edit2,
  Trash2
} from 'lucide-react';
import './Students.css';

const Students = () => {
  const navigate = useNavigate();
  const { students, addStudent, updateStudent, deleteStudent, emotionalHistory, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('az'); // Padrão: A-Z
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

  const [formData, setFormData] = useState({ name: '', plan: '', weight: '', bodyFat: '', monthly_fee: '', due_date: 10 });
  const [editFormData, setEditFormData] = useState({ name: '', plan: '', weight: '', body_fat: '', monthly_fee: '', due_date: 10, active: true });

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
      monthly_fee: parseFloat(formData.monthly_fee) || 0,
      due_date: parseInt(formData.due_date, 10) || 10,
      active: true,
      frequency: 0,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(formData.name.trim())}`
    });
    setIsModalOpen(false);
    setFormData({ name: '', plan: '', weight: '', bodyFat: '', monthly_fee: '', due_date: 10 });
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name || '',
      plan: student.plan || '',
      weight: student.weight || '',
      body_fat: student.body_fat ?? student.bodyFat ?? '',
      monthly_fee: student.monthly_fee || '',
      due_date: student.due_date || 10,
      active: student.active !== false
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    await updateStudent(editingStudent.id, {
      name: editFormData.name,
      plan: editFormData.plan,
      weight: parseFloat(editFormData.weight) || 0,
      body_fat: parseFloat(editFormData.body_fat) || 0,
      monthly_fee: parseFloat(editFormData.monthly_fee) || 0,
      due_date: parseInt(editFormData.due_date, 10) || 10,
      active: editFormData.active
    });
    setIsEditModalOpen(false);
    setEditingStudent(null);
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Tem certeza que deseja excluir o aluno "${student.name}"?\nEsta ação removerá todos os dados e histórico associados.`)) {
      await deleteStudent(student.id);
    }
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
          filteredStudents.map(student => {
            const studentEmotions = emotionalHistory.filter(e => String(e.student_id) === String(student.id));
            const latestScore = studentEmotions.length > 0 ? studentEmotions[studentEmotions.length - 1].score : null;
            const scoreDisplay = latestScore !== null ? `${latestScore}/10` : (student.emotionalScore ? `${student.emotionalScore}/10` : 'N/A');

            return (
              <Card key={student.id} className="student-card">
                <div className="student-card-header flex-between">
                  <div className="student-avatar-wrapper">
                    <img src={student.avatar || `https://i.pravatar.cc/150?u=${student.id}`} alt={student.name} className="student-avatar" />
                    <span className={`status-indicator ${student.active ? 'active' : 'inactive'}`}></span>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="student-action-btn edit" 
                      title="Editar aluno"
                      onClick={() => handleOpenEdit(student)}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button 
                      className="student-action-btn delete" 
                      title="Excluir aluno"
                      onClick={() => handleDeleteStudent(student)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
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
                    <span>Humor: {scoreDisplay}</span>
                  </div>
                  <button 
                    className="secondary-button"
                    onClick={() => navigate(`/student/${student.id}`)}
                  >
                    Ver Perfil
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de Cadastro de Novo Aluno */}
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
              <label>Mensalidade (R$)</label>
              <input type="number" step="0.01" className="form-input" value={formData.monthly_fee} onChange={e => setFormData({...formData, monthly_fee: e.target.value})} placeholder="Ex: 350.00" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Dia Vencimento</label>
              <input type="number" min="1" max="31" className="form-input" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
            </div>
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

      {/* Modal de Edição de Aluno */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingStudent(null); }} title="Editar Dados do Aluno">
        <form onSubmit={handleSaveEdit}>
          <div className="form-group">
            <label>Nome Completo</label>
            <input 
              required 
              type="text" 
              className="form-input" 
              value={editFormData.name} 
              onChange={e => setEditFormData({...editFormData, name: e.target.value})} 
            />
          </div>

          <div className="form-group">
            <label>Plano</label>
            <input 
              type="text" 
              className="form-input" 
              value={editFormData.plan} 
              onChange={e => setEditFormData({...editFormData, plan: e.target.value})} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Mensalidade (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                className="form-input" 
                value={editFormData.monthly_fee} 
                onChange={e => setEditFormData({...editFormData, monthly_fee: e.target.value})} 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Dia Vencimento</label>
              <input 
                type="number" 
                min="1" 
                max="31" 
                className="form-input" 
                value={editFormData.due_date} 
                onChange={e => setEditFormData({...editFormData, due_date: e.target.value})} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Peso Atual (kg)</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-input" 
                value={editFormData.weight} 
                onChange={e => setEditFormData({...editFormData, weight: e.target.value})} 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Percentual BF (%)</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-input" 
                value={editFormData.body_fat} 
                onChange={e => setEditFormData({...editFormData, body_fat: e.target.value})} 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status da Matrícula</label>
            <select 
              className="form-input" 
              value={editFormData.active ? 'true' : 'false'} 
              onChange={e => setEditFormData({...editFormData, active: e.target.value === 'true'})}
            >
              <option value="true">Ativo (Treinos Ativos)</option>
              <option value="false">Inativo / Trancado</option>
            </select>
          </div>

          <button type="submit" className="primary-button" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>
            Salvar Alterações
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
