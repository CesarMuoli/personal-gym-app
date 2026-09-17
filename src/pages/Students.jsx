import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import { useAppContext } from '../context/AppContext';
import { Search, Filter, MoreVertical, Activity } from 'lucide-react';
import './Students.css';

const Students = () => {
  const navigate = useNavigate();
  const { students, addStudent, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', plan: '', weight: '', bodyFat: '' });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addStudent({
      name: formData.name,
      plan: formData.plan,
      weight: parseFloat(formData.weight) || 0,
      body_fat: parseFloat(formData.bodyFat) || 0,
      active: true,
      frequency: 0,
      avatar: `https://i.pravatar.cc/150?u=${formData.name.replace(' ', '')}`
    });
    setIsModalOpen(false);
    setFormData({ name: '', plan: '', weight: '', bodyFat: '' });
  };

  if (loading) return <div style={{ padding: '2rem' }}>Carregando alunos...</div>;

  return (
    <div className="students-page">
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
        <button className="icon-btn-square"><Filter size={18} /> Filtrar</button>
      </div>

      <div className="students-grid">
        {filteredStudents.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Nenhum aluno encontrado.</p>
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
                    <span className="stat-value">{student.last_class ? new Date(student.last_class).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="student-card-footer">
                <div className="emotional-quick-view">
                  <Activity size={16} color="var(--accent-color)" />
                  <span>Humor: N/A</span>
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
